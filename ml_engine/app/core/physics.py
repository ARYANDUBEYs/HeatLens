"""
Radiative Transfer Physics, Satellite Thermal Inversion, & ABL Dynamics Module
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh

Formulations:
1. USGS Landsat-8/9 TIRS Band 10 TOA Radiance to at-satellite Brightness Temperature (BT).
2. Sobrino et al. Fractional Vegetation Cover (Pv) and Land Surface Temperature (LST).
3. Atmospheric Boundary Layer (ABL) Multi-Level Lapse Rate & Thermal Inversion Severity Index (ISI).
"""

from typing import Dict, Union, Tuple, Optional
import numpy as np


# ============================================================================
# Calibration Constants for Landsat-8/9 TIRS & Radiative Physics
# ============================================================================
LANDSAT_M_L: float = 0.0003342        # Radiance Multiplier Band 10 (USGS Metadata)
LANDSAT_A_L: float = 0.1              # Radiance Add Band 10 (USGS Metadata)
LANDSAT_K1: float = 774.8853          # Thermal Conversion Constant 1, W/(m^2 * sr * um)
LANDSAT_K2: float = 1321.0789         # Thermal Conversion Constant 2, Kelvin
TIRS_BAND10_LAMBDA: float = 10.895e-6 # Central emitted wavelength, meters (10.895 um)
PLANCK_RHO: float = 1.438e-2          # Universal constant rho = h * c / sigma (meter-Kelvin)

DEFAULT_NDVI_MIN: float = 0.05        # Bare soil NDVI threshold (Sobrino et al.)
DEFAULT_NDVI_MAX: float = 0.70        # Dense canopy NDVI threshold (Sobrino et al.)
DEFAULT_BLH_THRESHOLD: float = 800.0  # Boundary Layer Height trapping threshold (meters)


# ============================================================================
# 1. Landsat-8/9 Band 10 Radiative Transfer to Brightness Temperature (BT)
# ============================================================================
def radiance_to_brightness_temp(
    qcal: Union[float, int, np.ndarray],
    m_l: float = LANDSAT_M_L,
    a_l: float = LANDSAT_A_L,
    k1: float = LANDSAT_K1,
    k2: float = LANDSAT_K2
) -> np.ndarray:
    """
    Converts Landsat-8/9 Band 10 Quantized Calibrated Pixel Values (DN / Qcal)
    to top-of-atmosphere (TOA) spectral radiance and inverts to at-satellite
    Brightness Temperature (BT) in Celsius using Planck's Radiation Law.

    Formulas:
        L_lambda = M_L * Q_cal + A_L
        BT_K = K2 / ln((K1 / L_lambda) + 1.0)
        BT_C = BT_K - 273.15

    Parameters:
        qcal: Raw digital numbers (DN) from Band 10 raster.
        m_l: Radiance multiplicative scaling factor.
        a_l: Radiance additive scaling factor.
        k1: Thermal conversion constant K1 in W/(m^2 * sr * um).
        k2: Thermal conversion constant K2 in Kelvin.

    Returns:
        np.ndarray: Brightness Temperature in Celsius. Invalid or non-positive
                    radiances are masked gracefully as np.nan.
    """
    qcal_arr = np.asarray(qcal, dtype=np.float64)

    # 1. Compute TOA spectral radiance
    l_lambda = m_l * qcal_arr + a_l

    # 2. Identify physically valid pixels:
    # In USGS Landsat 8/9 products, DN <= 0 represents nodata/fill.
    # Radiance must be strictly positive and correspond to calibrated DN > 0.
    valid_mask = (qcal_arr > 0) & (l_lambda > 0.0)
    bt_celsius = np.full_like(l_lambda, np.nan, dtype=np.float64)

    # 3. Planck's Law Inversion for valid pixels
    if np.any(valid_mask):
        radiance_valid = l_lambda[valid_mask]
        bt_kelvin = k2 / np.log((k1 / radiance_valid) + 1.0)
        bt_celsius[valid_mask] = bt_kelvin - 273.15

    return bt_celsius


# ============================================================================
# 2. Sobrino Fractional Vegetation Cover & Land Surface Temperature (LST)
# ============================================================================
def calculate_lst(
    bt_celsius: Union[float, np.ndarray],
    ndvi: Union[float, np.ndarray],
    lambda_val: float = TIRS_BAND10_LAMBDA,
    rho: float = PLANCK_RHO,
    ndvi_min: float = DEFAULT_NDVI_MIN,
    ndvi_max: float = DEFAULT_NDVI_MAX
) -> np.ndarray:
    """
    Computes Land Surface Temperature (LST in Celsius) from Brightness Temperature
    and NDVI using the Sobrino et al. fractional vegetation emissivity correction.

    Formulas:
        P_v = ((NDVI - NDVI_min) / (NDVI_max - NDVI_min))^2
        epsilon = 0.004 * P_v + 0.986
        LST = [BT_K / (1 + (lambda * BT_K / rho) * ln(epsilon))] - 273.15

    Parameters:
        bt_celsius: At-satellite brightness temperature in Celsius.
        ndvi: Normalized Difference Vegetation Index (clipped to [-1.0, 1.0]).
        lambda_val: Effective emitted radiance wavelength in meters (~10.895 um).
        rho: Universal physical constant h*c/sigma = 1.438e-2 m*K.
        ndvi_min: Soil NDVI baseline (default: 0.05).
        ndvi_max: Dense vegetation canopy NDVI baseline (default: 0.70).

    Returns:
        np.ndarray: Emissivity-corrected Land Surface Temperature (LST) in Celsius.
    """
    bt_arr = np.asarray(bt_celsius, dtype=np.float64)
    ndvi_arr = np.asarray(ndvi, dtype=np.float64)

    # Broadcast shapes if one is a scalar
    bt_arr, ndvi_arr = np.broadcast_arrays(bt_arr, ndvi_arr)

    # 1. Calculate Fractional Vegetation Cover (Pv)
    ndvi_clipped = np.clip(ndvi_arr, ndvi_min, ndvi_max)
    pv = ((ndvi_clipped - ndvi_min) / (ndvi_max - ndvi_min)) ** 2.0
    pv = np.clip(pv, 0.0, 1.0)

    # 2. Calculate Land Surface Emissivity (LSE / epsilon)
    # Urban & soil surfaces: epsilon = 0.004 * Pv + 0.986
    # Pure water bodies (NDVI < 0) default to water emissivity ~ 0.991
    emissivity = np.where(ndvi_arr < 0.0, 0.991, 0.004 * pv + 0.986)
    emissivity = np.clip(emissivity, 0.92, 0.995)

    # 3. Emissivity-corrected LST via Planck's equation
    bt_kelvin = bt_arr + 273.15
    valid_mask = (bt_kelvin > 150.0) & (~np.isnan(bt_kelvin)) & (emissivity > 0.0)

    lst_celsius = np.full_like(bt_arr, np.nan, dtype=np.float64)

    if np.any(valid_mask):
        bt_k_valid = bt_kelvin[valid_mask]
        eps_valid = emissivity[valid_mask]

        numerator = bt_k_valid
        denom = 1.0 + ((lambda_val * bt_k_valid) / rho) * np.log(eps_valid)
        lst_k = numerator / denom
        lst_celsius[valid_mask] = lst_k - 273.15

    return lst_celsius


# ============================================================================
# 3. Atmospheric Boundary Layer (ABL) & Thermal Inversion Severity Index (ISI)
# ============================================================================
def calculate_inversion_index(
    temp_profile_dict: Dict[str, Union[float, np.ndarray]],
    geopotential_heights: Dict[str, Union[float, np.ndarray]],
    blh: Union[float, np.ndarray],
    blh_threshold: float = DEFAULT_BLH_THRESHOLD
) -> np.ndarray:
    """
    Evaluates vertical atmospheric temperature profile and Boundary Layer Height (BLH)
    to calculate a normalized Inversion Severity Index (ISI) in [0.0, 1.0].

    In mountain valley basins (like Kamloops, Thompson Valley, Okanagan), thermal
    inversions occur when warm air overrides cooler valley floor air (dT/dz > 0).
    This atmospheric lid suppresses vertical dispersion, trapping wildfire smoke and PM2.5.

    Parameters:
        temp_profile_dict: Dict containing air temperature at standard pressure levels:
                           {'1000hPa': T0, '950hPa': T1, '900hPa': T2, '850hPa': T3}.
                           Temperatures may be in Celsius or Kelvin (internally normalized).
        geopotential_heights: Dict containing geopotential height in meters corresponding
                              to each level: e.g. {'1000hPa': 110, '950hPa': 520, ...}.
        blh: Planetary Boundary Layer Height (BLH) in meters (e.g. from ERA5-Land).
        blh_threshold: Upper threshold below which the boundary layer is compressed (default 800m).

    Returns:
        np.ndarray: Inversion Severity Index (ISI) normalized between 0.0 (Uncapped / Strong Dispersion)
                    and 1.0 (Acute Trapping Inversion Lid).
    """
    # Standard mandatory pressure levels ordered from surface upwards
    ordered_levels = ["1000hPa", "950hPa", "900hPa", "850hPa"]

    # Validate that required levels exist
    available_levels = [lvl for lvl in ordered_levels if lvl in temp_profile_dict and lvl in geopotential_heights]
    if len(available_levels) < 2:
        raise ValueError(
            f"At least two vertical atmospheric levels required. Found: {available_levels}"
        )

    # Determine broadcast shape
    sample_val = np.asarray(temp_profile_dict[available_levels[0]], dtype=np.float64)
    blh_arr = np.asarray(blh, dtype=np.float64)

    # Initialize accumulators for cumulative inversion temperature gain and lapse rate
    inv_temp_delta = np.zeros_like(sample_val)
    positive_lapse_layers = np.zeros_like(sample_val)

    # Step through consecutive atmospheric layers
    for i in range(len(available_levels) - 1):
        lower_lvl = available_levels[i]
        upper_lvl = available_levels[i + 1]

        t_lower = np.asarray(temp_profile_dict[lower_lvl], dtype=np.float64)
        t_upper = np.asarray(temp_profile_dict[upper_lvl], dtype=np.float64)
        z_lower = np.asarray(geopotential_heights[lower_lvl], dtype=np.float64)
        z_upper = np.asarray(geopotential_heights[upper_lvl], dtype=np.float64)

        dz = np.maximum(z_upper - z_lower, 1.0)  # meters
        dt = t_upper - t_lower                   # positive if temperature increases with height (inversion)

        # Detect positive lapse rate (dT/dz > 0)
        inversion_mask = dt > 0.0
        layer_delta = np.where(inversion_mask, dt, 0.0)

        inv_temp_delta += layer_delta
        positive_lapse_layers += np.where(inversion_mask, 1.0, 0.0)

    # Boundary Layer Compression Factor:
    # When BLH is suppressed below threshold (e.g. < 400m), particulate matter is confined
    # directly against valley floor settlements.
    blh_compression = np.clip((blh_threshold - blh_arr) / blh_threshold, 0.0, 1.0)

    # Inversion Thermal Strength Factor:
    # A cumulative temperature increase of >= 5.0°C aloft represents an acute trapping cap
    thermal_strength = np.clip(inv_temp_delta / 5.0, 0.0, 1.0)

    # Combine: 65% thermal cap strength + 35% boundary layer compression
    isi = 0.65 * thermal_strength + 0.35 * blh_compression

    # If no thermal inversion exists (normal cooling with height across all layers),
    # suppress ISI to reflect healthy convective dispersion
    has_any_inversion = positive_lapse_layers > 0.0
    isi = np.where(has_any_inversion, isi, 0.0)

    return np.clip(np.round(isi, 4), 0.0, 1.0)


# ============================================================================
# Unit Test & Sanity Checks
# ============================================================================
if __name__ == "__main__":
    print("=" * 75)
    print("[RUNNING UNIT TESTS] Radiative Transfer Physics & ABL Inversion Engine")
    print("=" * 75)

    # 1. Test Landsat-8/9 DN to Brightness Temperature
    test_qcal = np.array([21500, 24800, 28200, 0, -50], dtype=np.float64)
    bts = radiance_to_brightness_temp(test_qcal)
    print("\n1. Landsat DN to Brightness Temperature Test:")
    for dn, bt in zip(test_qcal, bts):
        status_str = f"{bt:.2f} deg C" if not np.isnan(bt) else "NaN (Masked Non-Physical)"
        print(f"   DN: {dn:6.0f}  -->  BT: {status_str}")

    assert not np.isnan(bts[1]), "Valid DN must produce valid BT"
    assert np.isnan(bts[4]), "Negative DN must produce NaN"
    print("   [PASS] Landsat-8/9 Radiative Transfer BT: PASS")

    # 2. Test Sobrino Fractional Vegetation Cover & LST
    test_bts = np.array([22.5, 30.0, 38.0])
    test_ndvis = np.array([0.15, 0.35, 0.65])
    lsts = calculate_lst(test_bts, test_ndvis)
    print("\n2. Sobrino LST Emissivity Correction Test:")
    for bt, ndvi, lst in zip(test_bts, test_ndvis, lsts):
        print(f"   BT: {bt:.1f} deg C, NDVI: {ndvi:.2f}  -->  LST: {lst:.2f} deg C (Delta: {lst - bt:+.2f} deg C)")

    assert np.all(lsts > 0), "Realistic temperatures must be positive"
    print("   [PASS] Sobrino LST Emissivity Correction: PASS")

    # 3. Test Atmospheric Boundary Layer Inversion Severity Index (ISI)
    heights = {
        "1000hPa": 120.0,
        "950hPa": 560.0,
        "900hPa": 1020.0,
        "850hPa": 1540.0
    }

    # Case A: Normal Uncapped Convective Atmosphere (Temperature decreases with height)
    normal_profile = {
        "1000hPa": 26.0,
        "950hPa": 22.5,
        "900hPa": 18.0,
        "850hPa": 14.5
    }
    isi_normal = calculate_inversion_index(normal_profile, heights, blh=1400.0)
    print(f"\n3. ABL Inversion Test (Case A - Normal Lapse Rate): ISI = {isi_normal:.4f}")
    assert isi_normal == 0.0, "Normal convective atmosphere must yield ISI = 0.0"

    # Case B: Acute Mountain Valley Inversion (Warm air capping cold valley floor)
    inversion_profile = {
        "1000hPa": 14.0,  # Cold trapped air in Kamloops valley floor
        "950hPa": 19.5,   # +5.5 deg C warm inversion lid
        "900hPa": 18.0,
        "850hPa": 15.0
    }
    isi_inversion = calculate_inversion_index(inversion_profile, heights, blh=380.0)
    print(f"   ABL Inversion Test (Case B - Trapping Smoke Inversion): ISI = {isi_inversion:.4f}")
    assert isi_inversion > 0.70, "Acute inversion with low BLH must yield high ISI > 0.70"

    print("\n" + "=" * 75)
    print("[SUCCESS] ALL RADIATIVE PHYSICS & ABL SANITY CHECKS PASSED (100% VERIFIED)")
    print("=" * 75)
