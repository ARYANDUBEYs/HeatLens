"""
Dynamic Corridor Manager & Geospatial Projection Context
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh
"""

from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
from pyproj import Transformer
from affine import Affine
from app.config import settings, CorridorDefinition


class CorridorContext:
    """
    Encapsulates bounding box, projection transformations, and raster grid parameters
    for an active geographic corridor (Kamloops, BC vs Delhi NCR).
    """
    def __init__(self, definition: CorridorDefinition):
        self.definition = definition
        self.id = definition.id
        self.name = definition.name
        self.crs = definition.crs
        self.utm_zone = definition.utm_zone
        self.default_provider = definition.default_insitu_provider
        self.bounding_box = definition.bounding_box  # (min_lon, min_lat, max_lon, max_lat)
        self.min_lon, self.min_lat, self.max_lon, self.max_lat = self.bounding_box

        # Coordinate Transformers
        self.transformer_to_utm = Transformer.from_crs("EPSG:4326", self.crs, always_xy=True)
        self.transformer_to_wgs = Transformer.from_crs(self.crs, "EPSG:4326", always_xy=True)

        # Compute metric extent in projected coordinates
        self.utm_x_min, self.utm_y_min = self.transformer_to_utm.transform(self.min_lon, self.min_lat)
        self.utm_x_max, self.utm_y_max = self.transformer_to_utm.transform(self.max_lon, self.max_lat)

    def generate_grid_coords(
        self,
        step_meters: float = 300.0
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Tuple[int, int], Affine]:
        """
        Generates continuous 2D spatial grid points over the corridor in projected UTM coordinates.
        Returns:
            - grid_coords_utm: (N, 2) numpy array of projected coordinates [utm_x, utm_y]
            - lons: (N,) WGS84 longitudes
            - lats: (N,) WGS84 latitudes
            - shape: (height, width) raster dimensions
            - transform: Affine georeferencing transform for GeoTIFF writing
        """
        x_coords = np.arange(self.utm_x_min, self.utm_x_max, step_meters)
        y_coords = np.arange(self.utm_y_min, self.utm_y_max, step_meters)

        # Raster convention: Y coordinates descend from north to south
        y_coords_desc = np.sort(y_coords)[::-1]

        xx, yy = np.meshgrid(x_coords, y_coords_desc)
        grid_shape = xx.shape

        grid_coords_utm = np.column_stack([xx.ravel(), yy.ravel()])
        lons, lats = self.transformer_to_wgs.transform(grid_coords_utm[:, 0], grid_coords_utm[:, 1])

        # Affine Transform: [pixel_width, 0, x_min, 0, -pixel_height, y_max]
        transform = Affine.translation(self.utm_x_min, y_coords_desc[0]) * Affine.scale(step_meters, -step_meters)

        return grid_coords_utm, lons, lats, grid_shape, transform

    def generate_synthetic_stations(self, n_stations: int = 16) -> pd.DataFrame:
        """
        Generates realistic calibrated ground station observations matching the corridor's
        topographical and environmental profile (Kamloops valley inversion vs Delhi heat equity).
        """
        np.random.seed(42 if self.id == "kamloops" else 101)

        lons = np.random.uniform(self.min_lon + 0.03, self.max_lon - 0.03, n_stations)
        lats = np.random.uniform(self.min_lat + 0.03, self.max_lat - 0.03, n_stations)
        utm_x, utm_y = self.transformer_to_utm.transform(lons, lats)

        if self.id == "kamloops":
            # Kamloops: Valley bottom ~340m, surrounding ridges up to 900m
            center_lon, center_lat = -120.33, 50.67
            dist = np.sqrt((lons - center_lon)**2 + (lats - center_lat)**2)
            elevations = 340.0 + 560.0 * np.clip(dist / 0.20, 0.0, 1.0)
            elev_inv = (900.0 - elevations) / 560.0

            df = pd.DataFrame({
                "station_id": [f"ECCC_TRU_{i+1:02d}" for i in range(n_stations)],
                "lon": lons,
                "lat": lats,
                "utm_x": utm_x,
                "utm_y": utm_y,
                "TROPOMI_NO2": 35.0 + 50.0 * elev_inv + np.random.normal(0, 3, n_stations),
                "UV_Aerosol_Index": 1.2 + 2.4 * elev_inv + np.random.normal(0, 0.2, n_stations),
                "LST": 26.0 + 8.5 * elev_inv + np.random.normal(0, 0.8, n_stations),
                "Elevation": elevations,
                "Slope": np.random.uniform(1.0, 22.0, n_stations),
                "Wind_U": np.random.uniform(-3.0, 2.0, n_stations),
                "Wind_V": np.random.uniform(-2.0, 3.0, n_stations),
                "BLH": 400.0 + 400.0 * (1.0 - elev_inv),
                "ISI": 0.2 + 0.65 * elev_inv
            })
            df["PM25"] = (
                0.38 * df["TROPOMI_NO2"] +
                19.0 * df["UV_Aerosol_Index"] +
                0.80 * df["LST"] -
                0.02 * df["Elevation"] +
                35.0 * df["ISI"] +
                np.random.normal(0, 2.5, n_stations)
            )
        else:
            # Delhi NCR: Dense informal settlements with high thermal burden & low tree canopy
            df = pd.DataFrame({
                "station_id": [f"CPCB_DEL_{i+1:02d}" for i in range(n_stations)],
                "lon": lons,
                "lat": lats,
                "utm_x": utm_x,
                "utm_y": utm_y,
                "TROPOMI_NO2": np.random.uniform(55.0, 120.0, n_stations),
                "UV_Aerosol_Index": np.random.uniform(1.8, 3.8, n_stations),
                "LST": np.random.uniform(36.0, 46.5, n_stations),
                "Elevation": np.random.uniform(210.0, 260.0, n_stations),
                "Slope": np.random.uniform(0.5, 4.0, n_stations),
                "Wind_U": np.random.uniform(-2.0, 2.0, n_stations),
                "Wind_V": np.random.uniform(-2.0, 2.0, n_stations),
                "BLH": np.random.uniform(350.0, 800.0, n_stations),
                "ISI": np.random.uniform(0.3, 0.85, n_stations)
            })
            df["PM25"] = (
                0.45 * df["TROPOMI_NO2"] +
                22.0 * df["UV_Aerosol_Index"] +
                1.10 * df["LST"] +
                25.0 * df["ISI"] +
                np.random.normal(0, 5.0, n_stations)
            )

        df["PM25"] = np.clip(df["PM25"], 10.0, 350.0)
        return df


def get_corridor_context(corridor_id: str) -> CorridorContext:
    """
    Factory helper returning a configured CorridorContext for the specified corridor.
    """
    definition = settings.get_corridor(corridor_id)
    return CorridorContext(definition)
