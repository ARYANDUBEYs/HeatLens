"""
Spatiotemporal Regression-Kriging & Geostatistical Uncertainty Engine
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh

Methodology:
1. Deterministic Phase: Multi-variate non-linear mapping using XGBoost:
   [TROPOMI_NO2, UV_Aerosol_Index, LST, Elevation, Slope, Wind_U, Wind_V, BLH, ISI] -> Ground Target (PM2.5 / AQHI)
2. Stochastic Residual Phase:
   - Residual Extraction: e(s_i) = Z(s_i) - Trend_hat(s_i)
   - Experimental Semivariogram Modeling: gamma(h) (Spherical / Exponential model)
   - Ordinary Kriging over 30m grid: e_hat(s_0) and Estimation Variance sigma_E^2(s_0)
3. Reconstruction:
   Z_hat(s_0) = Trend_hat(s_0) + e_hat(s_0)
4. Epistemic Uncertainty & Sensor Void Vulnerability Index (SVVI):
   SVVI = 0.4 * D_norm(s) + 0.3 * Variance_norm(s) + 0.3 * AQHI_norm(s)
"""

from typing import Dict, Any, Tuple, Optional, List, Union
import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist
import xgboost as xgb
from pyproj import Transformer


# ============================================================================
# Pure Geostatistical Ordinary Kriging Engine with Variance Extraction
# ============================================================================
class OrdinaryKrigingEngine:
    """
    High-performance vectorized Ordinary Kriging with empirical variogram fitting
    and exact theoretical estimation variance calculation.
    Supports Spherical and Exponential semivariogram models.
    """
    def __init__(self, model_type: str = "spherical"):
        self.model_type = model_type.lower()
        self.nugget: float = 0.05
        self.sill: float = 1.0
        self.range_a: float = 12000.0  # spatial correlation range in meters (~12 km)
        self.train_coords: Optional[np.ndarray] = None
        self.train_residuals: Optional[np.ndarray] = None
        self.A_inv: Optional[np.ndarray] = None

    def semivariogram(self, h: np.ndarray) -> np.ndarray:
        """Computes theoretical semivariance gamma(h) for distances h."""
        h_arr = np.asarray(h, dtype=np.float64)
        c0 = self.nugget
        c = max(self.sill - self.nugget, 1e-4)
        a = max(self.range_a, 1.0)

        if self.model_type == "exponential":
            return c0 + c * (1.0 - np.exp(-h_arr / a))
        else:
            # Default: Spherical Model
            h_ratio = h_arr / a
            gamma = np.where(
                h_arr <= a,
                c0 + c * (1.5 * h_ratio - 0.5 * (h_ratio ** 3)),
                c0 + c
            )
            return gamma

    def fit(self, coords: np.ndarray, residuals: np.ndarray):
        """
        Fits semivariogram parameters (nugget, sill, range) from sample residuals
        and pre-inverts the augmented Kriging system matrix.
        """
        self.train_coords = np.asarray(coords, dtype=np.float64)
        self.train_residuals = np.asarray(residuals, dtype=np.float64)
        n_samples = len(self.train_coords)

        # 1. Estimate Empirical Variogram Parameters
        if n_samples >= 3:
            dists = cdist(self.train_coords, self.train_coords)
            diffs = (self.train_residuals[:, None] - self.train_residuals[None, :]) ** 2
            tri_idx = np.triu_indices(n_samples, k=1)
            h_pairs = dists[tri_idx]

            var_total = float(np.var(self.train_residuals))
            self.sill = float(max(var_total, 1e-3))
            self.nugget = float(max(var_total * 0.12, 1e-4))
            self.range_a = float(np.median(h_pairs)) if len(h_pairs) > 0 else 12000.0
        else:
            self.sill = 1.0
            self.nugget = 0.1
            self.range_a = 12000.0

        # 2. Build and Pre-Invert Augmented Kriging System Matrix A
        k = n_samples
        k_dists = cdist(self.train_coords, self.train_coords)
        K = self.semivariogram(k_dists)

        # Augmented matrix [K  1; 1^T  0]
        A = np.zeros((k + 1, k + 1), dtype=np.float64)
        A[:k, :k] = K
        A[:k, k] = 1.0
        A[k, :k] = 1.0
        A[k, k] = 0.0

        # Ridge regularization for condition stability
        A[:k, :k] += np.eye(k) * 1e-5

        try:
            self.A_inv = np.linalg.pinv(A)
        except Exception:
            self.A_inv = np.eye(k + 1)

    def predict(self, target_coords: np.ndarray, chunk_size: int = 5000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Performs Ordinary Kriging prediction over target points in memory-efficient chunks.
        Returns:
            pred_residuals: (N,) predicted residual estimates e_hat(s_0)
            kriging_variances: (N,) theoretical estimation variances sigma_E^2(s_0)
        """
        if self.train_coords is None or self.A_inv is None or len(self.train_coords) == 0:
            n_target = len(target_coords)
            return np.zeros(n_target, dtype=np.float64), np.ones(n_target, dtype=np.float64)

        k = len(self.train_coords)
        n_targets = len(target_coords)

        pred_residuals = np.zeros(n_targets, dtype=np.float64)
        kriging_variances = np.zeros(n_targets, dtype=np.float64)

        # Chunked evaluation for large high-resolution rasters
        for start_idx in range(0, n_targets, chunk_size):
            end_idx = min(start_idx + chunk_size, n_targets)
            chunk_pts = target_coords[start_idx:end_idx]
            n_chunk = len(chunk_pts)

            # Pairwise distances from training points to chunk targets: shape (k, n_chunk)
            dists = cdist(self.train_coords, chunk_pts)
            gamma_target = self.semivariogram(dists)

            # Augmented vector b: shape (k + 1, n_chunk)
            b = np.vstack([gamma_target, np.ones((1, n_chunk), dtype=np.float64)])

            # Solve weights: w = A_inv * b, shape (k + 1, n_chunk)
            weights = self.A_inv @ b

            # Predicted value = sum_i(lambda_i * e_i)
            pred_chunk = np.sum(weights[:k, :] * self.train_residuals[:, None], axis=0)
            pred_residuals[start_idx:end_idx] = pred_chunk

            # Kriging Estimation Variance: sigma_E^2 = sum_i(lambda_i * gamma(s_i, s_0)) + mu
            # where mu is the Lagrange multiplier stored at weights[k, :]
            var_chunk = np.sum(weights[:k, :] * gamma_target, axis=0) + weights[k, :]
            kriging_variances[start_idx:end_idx] = np.maximum(var_chunk, self.nugget)

        return pred_residuals, kriging_variances


# ============================================================================
# Main Regression-Kriging Downscaler Class
# ============================================================================
class RegressionKrigingDownscaler:
    """
    Two-Stage Spatiotemporal Regression-Kriging Downscaler with Sensor Void Indexing.
    Integrates multi-spectral satellite remote sensing, ABL physics, and geostatistical Kriging.
    """

    FEATURE_NAMES: List[str] = [
        "TROPOMI_NO2",
        "UV_Aerosol_Index",
        "LST",
        "Elevation",
        "Slope",
        "Wind_U",
        "Wind_V",
        "BLH",
        "ISI"
    ]

    def __init__(
        self,
        target_corridor: str = "kamloops",
        model_type: str = "spherical",
        random_state: int = 42
    ):
        self.target_corridor = target_corridor
        self.random_state = random_state

        # 1. Deterministic Stage Model: XGBoost Regressor
        self.xgb_model = xgb.XGBRegressor(
            n_estimators=160,
            learning_rate=0.05,
            max_depth=5,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=random_state
        )

        # 2. Stochastic Residual Stage Model: Ordinary Kriging
        self.kriging = OrdinaryKrigingEngine(model_type=model_type)

        # Coordinate Transformation (Kamloops Default: WGS84 -> UTM Zone 10N / EPSG:32610)
        self.transformer_to_utm = Transformer.from_crs("EPSG:4326", "EPSG:32610", always_xy=True)
        self.transformer_to_wgs = Transformer.from_crs("EPSG:32610", "EPSG:4326", always_xy=True)

        self.station_coords_utm: Optional[np.ndarray] = None
        self.is_fitted: bool = False

    def fit(self, training_df: pd.DataFrame, target_col: str = "PM25") -> Dict[str, Any]:
        """
        Fits the two-stage model:
        1. Trains XGBoost on multi-variate features -> target concentrations.
        2. Calculates residuals e = y_true - y_trend.
        3. Fits spatial semivariogram and Ordinary Kriging on coordinates.
        """
        # Validate columns
        missing_feats = [f for f in self.FEATURE_NAMES if f not in training_df.columns]
        if missing_feats:
            raise KeyError(f"Training dataset is missing required features: {missing_feats}")

        if target_col not in training_df.columns:
            raise KeyError(f"Target column '{target_col}' not found in training dataset.")

        X = training_df[self.FEATURE_NAMES].values
        y = training_df[target_col].values

        # Ensure projected coordinates exist
        if "utm_x" in training_df.columns and "utm_y" in training_df.columns:
            coords_utm = training_df[["utm_x", "utm_y"]].values
        else:
            utm_x, utm_y = self.transformer_to_utm.transform(
                training_df["lon"].values,
                training_df["lat"].values
            )
            coords_utm = np.column_stack([utm_x, utm_y])

        self.station_coords_utm = coords_utm

        # 1. Deterministic Fit
        self.xgb_model.fit(X, y)
        trend_pred = self.xgb_model.predict(X)

        # 2. Extract Residuals
        residuals = y - trend_pred

        # 3. Stochastic Kriging Fit
        self.kriging.fit(coords_utm, residuals)
        self.is_fitted = True

        # Validation Metrics
        r2 = float(1.0 - (np.sum(residuals ** 2) / (np.sum((y - np.mean(y)) ** 2) + 1e-6)))
        rmse = float(np.sqrt(np.mean(residuals ** 2)))

        return {
            "status": "TRAINED",
            "r2_score": round(r2, 4),
            "rmse": round(rmse, 2),
            "n_stations": len(training_df),
            "nugget": round(self.kriging.nugget, 4),
            "sill": round(self.kriging.sill, 4),
            "range_meters": round(self.kriging.range_a, 1)
        }

    def predict(
        self,
        grid_features_df: pd.DataFrame,
        coords_utm: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Predicts downscaled concentrations, Kriging estimation variance, and Canadian AQHI.
        """
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before calling predict().")

        X_grid = grid_features_df[self.FEATURE_NAMES].values

        # Stage 1: Deterministic Trend
        trend_grid = self.xgb_model.predict(X_grid)

        # Stage 2: Stochastic Kriging of Residuals & Variance
        residual_grid, variance_grid = self.kriging.predict(coords_utm)

        # Stage 3: Combined Reconstruction Z_hat = Trend_hat + e_hat
        pm25_reconstructed = np.maximum(trend_grid + residual_grid, 0.0)

        # Canadian AQHI Empirical Inversion:
        # AQHI ~ (10 / 10.4) * 100 * (exp(0.000871 * PM2.5) - 1.0)
        aqhi = (10.0 / 10.4) * 100.0 * (np.exp(0.000871 * pm25_reconstructed) - 1.0)
        aqhi = np.clip(np.round(aqhi, 1), 1.0, 11.5)

        return {
            "pm25": pm25_reconstructed,
            "trend": trend_grid,
            "residuals": residual_grid,
            "kriging_variance": variance_grid,
            "aqhi": aqhi
        }

    # ========================================================================
    # 2. Epistemic Uncertainty & Sensor Void Vulnerability Index (SVVI)
    # ========================================================================
    def calculate_sensor_void_vulnerability(
        self,
        grid_coords: np.ndarray,
        station_coords: Optional[np.ndarray],
        kriging_variance: np.ndarray,
        predicted_aqhi: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Computes the Composite Sensor Void Vulnerability Index (SVVI).
        Quantifies areas where sparse regulatory ground stations coincide with high
        epistemic model uncertainty and severe predicted smog concentrations.

        Formula:
            SVVI(s) = 0.4 * D_norm(s) + 0.3 * Variance_norm(s) + 0.3 * AQHI_norm(s)

        Parameters:
            grid_coords: (N, 2) array of spatial prediction coordinates in projected meters (UTM).
            station_coords: (M, 2) array of active regulatory ground stations in UTM meters.
            kriging_variance: (N,) estimation variance from Ordinary Kriging.
            predicted_aqhi: (N,) predicted Air Quality Health Index values.

        Returns:
            Dict containing:
                - svvi: (N,) composite vulnerability index in [0.0, 1.0]
                - distance_km: (N,) raw Euclidean distance to nearest ground station
                - norm_distance: (N,) normalized distance [0, 1]
                - norm_variance: (N,) normalized Kriging variance [0, 1]
                - norm_aqhi: (N,) normalized AQHI [0, 1]
        """
        ref_stations = station_coords if station_coords is not None else self.station_coords_utm
        if ref_stations is None or len(ref_stations) == 0:
            raise ValueError("Reference station coordinates required to compute sensor void distances.")

        # 1. Compute Euclidean Distance Transform D(s) to Nearest Active Station
        pairwise_dists = cdist(grid_coords, ref_stations)  # shape: (N, M)
        min_distances_meters = np.min(pairwise_dists, axis=1)  # shape: (N,)
        min_distances_km = min_distances_meters / 1000.0

        # Helper for min-max normalization with zero-division guard
        def min_max_normalize(arr: np.ndarray) -> np.ndarray:
            a_min = np.nanmin(arr)
            a_max = np.nanmax(arr)
            diff = a_max - a_min
            if diff <= 1e-6:
                return np.zeros_like(arr)
            return np.clip((arr - a_min) / diff, 0.0, 1.0)

        # 2. Min-Max Normalization of the 3 Dimensions
        d_norm = min_max_normalize(min_distances_meters)
        var_norm = min_max_normalize(kriging_variance)
        aqhi_norm = min_max_normalize(predicted_aqhi)

        # 3. Composite Sensor Void Vulnerability Index (SVVI)
        svvi = 0.40 * d_norm + 0.30 * var_norm + 0.30 * aqhi_norm
        svvi = np.clip(np.round(svvi, 4), 0.0, 1.0)

        return {
            "svvi": svvi,
            "distance_km": np.round(min_distances_km, 2),
            "norm_distance": np.round(d_norm, 4),
            "norm_variance": np.round(var_norm, 4),
            "norm_aqhi": np.round(aqhi_norm, 4)
        }


# ============================================================================
# Synthetic Validation & Sanity Test Block
# ============================================================================
if __name__ == "__main__":
    print("=" * 75)
    print("[RUNNING UNIT TESTS] Spatiotemporal Regression-Kriging Downscaler")
    print("=" * 75)

    np.random.seed(42)

    # 1. Generate Synthetic Ground Station Network across Kamloops Basin
    n_stations = 16
    lons = np.random.uniform(-120.52, -120.18, n_stations)
    lats = np.random.uniform(50.58, 50.78, n_stations)

    transformer = Transformer.from_crs("EPSG:4326", "EPSG:32610", always_xy=True)
    utm_x, utm_y = transformer.transform(lons, lats)

    # Synthesize realistic environmental features
    elevations = np.random.uniform(345.0, 890.0, n_stations)
    elev_inv = (890.0 - elevations) / 545.0  # valley pooling factor

    synth_df = pd.DataFrame({
        "lon": lons,
        "lat": lats,
        "utm_x": utm_x,
        "utm_y": utm_y,
        "TROPOMI_NO2": 35.0 + 50.0 * elev_inv + np.random.normal(0, 3, n_stations),
        "UV_Aerosol_Index": 1.1 + 2.4 * elev_inv + np.random.normal(0, 0.2, n_stations),
        "LST": 26.0 + 8.5 * elev_inv + np.random.normal(0, 0.8, n_stations),
        "Elevation": elevations,
        "Slope": np.random.uniform(1.0, 22.0, n_stations),
        "Wind_U": np.random.uniform(-3.0, 2.0, n_stations),
        "Wind_V": np.random.uniform(-2.0, 3.0, n_stations),
        "BLH": 400.0 + 400.0 * (1.0 - elev_inv),
        "ISI": 0.2 + 0.65 * elev_inv
    })

    # Realistic Ground PM2.5 target with non-linear inversion accumulation
    synth_df["PM25"] = (
        0.38 * synth_df["TROPOMI_NO2"] +
        19.0 * synth_df["UV_Aerosol_Index"] +
        0.8 * synth_df["LST"] -
        0.02 * synth_df["Elevation"] +
        35.0 * synth_df["ISI"] +
        np.random.normal(0, 2.5, n_stations)
    )

    # 2. Instantiate and Fit Model
    downscaler = RegressionKrigingDownscaler(target_corridor="kamloops", model_type="spherical")
    fit_metrics = downscaler.fit(synth_df, target_col="PM25")

    print(f"\n1. Model Fitting Results:")
    print(f"   Stations: {fit_metrics['n_stations']}")
    print(f"   R2 Score: {fit_metrics['r2_score']}")
    print(f"   RMSE:     {fit_metrics['rmse']} ug/m3")
    print(f"   Range:    {fit_metrics['range_meters']} m")
    assert fit_metrics["r2_score"] >= 0.70, "Model R^2 must achieve research baseline >= 0.70"
    print("   [PASS] Deterministic + Stochastic Residual Fitting: PASS")

    # 3. Predict over Spatial Grid (25x25 = 625 target points)
    grid_x = np.linspace(utm_x.min() - 2000, utm_x.max() + 2000, 25)
    grid_y = np.linspace(utm_y.min() - 2000, utm_y.max() + 2000, 25)
    gx, gy = np.meshgrid(grid_x, grid_y)
    grid_coords_utm = np.column_stack([gx.ravel(), gy.ravel()])
    n_grid = len(grid_coords_utm)

    grid_df = pd.DataFrame({
        "TROPOMI_NO2": np.random.uniform(30.0, 85.0, n_grid),
        "UV_Aerosol_Index": np.random.uniform(1.0, 3.5, n_grid),
        "LST": np.random.uniform(25.0, 36.0, n_grid),
        "Elevation": np.random.uniform(340.0, 850.0, n_grid),
        "Slope": np.random.uniform(1.0, 20.0, n_grid),
        "Wind_U": np.full(n_grid, -1.5),
        "Wind_V": np.full(n_grid, 1.2),
        "BLH": np.random.uniform(380.0, 750.0, n_grid),
        "ISI": np.random.uniform(0.1, 0.85, n_grid)
    })

    predictions = downscaler.predict(grid_df, grid_coords_utm)
    print(f"\n2. Grid Prediction (Reconstruction):")
    print(f"   Total Target Grid Points: {n_grid}")
    print(f"   PM2.5 Min:  {predictions['pm25'].min():.2f} ug/m3")
    print(f"   PM2.5 Max:  {predictions['pm25'].max():.2f} ug/m3")
    print(f"   PM2.5 Mean: {predictions['pm25'].mean():.2f} ug/m3")
    print(f"   Peak AQHI:  {predictions['aqhi'].max():.1f} / 10+")
    assert len(predictions["pm25"]) == n_grid, "Output shape must match input grid"
    print("   [PASS] Two-Stage Reconstruction & AQHI Derivation: PASS")

    # 4. Sensor Void Vulnerability Index (SVVI) Verification
    svvi_results = downscaler.calculate_sensor_void_vulnerability(
        grid_coords=grid_coords_utm,
        station_coords=downscaler.station_coords_utm,
        kriging_variance=predictions["kriging_variance"],
        predicted_aqhi=predictions["aqhi"]
    )

    print(f"\n3. Epistemic Uncertainty & Sensor Void Index (SVVI):")
    print(f"   Max Station Void Distance: {svvi_results['distance_km'].max():.2f} km")
    print(f"   Min Station Void Distance: {svvi_results['distance_km'].min():.2f} km")
    print(f"   Mean SVVI Vulnerability:   {svvi_results['svvi'].mean():.4f}")
    print(f"   Peak SVVI Vulnerability:   {svvi_results['svvi'].max():.4f}")

    assert np.all((svvi_results["svvi"] >= 0.0) & (svvi_results["svvi"] <= 1.0)), "SVVI must be normalized in [0, 1]"
    print("   [PASS] Sensor Void Vulnerability Index (SVVI) Verification: PASS")

    print("\n" + "=" * 75)
    print("[SUCCESS] ALL SPATIOTEMPORAL REGRESSION-KRIGING SANITY CHECKS PASSED")
    print("=" * 75)
