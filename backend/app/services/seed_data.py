"""
Synthetic Earth Observation & In-Situ Station Data Seeder
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh

Generates baseline 100x100 GeoTIFF rasters and station JSON feeds in `data/raw/`
for Kamloops (BC, Canada) and Delhi NCR (India).
"""

import os
import sys
import json
from pathlib import Path

# Ensure root package is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import numpy as np
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
from pyproj import Transformer

from app.config import settings
from app.services.corridor_manager import get_corridor_context


def seed_corridor_rasters(corridor_id: str):
    """
    Seeds 100x100 synthetic baseline rasters for the specified corridor:
    - LST (Land Surface Temperature in Celsius)
    - TROPOMI NO2 (Tropospheric column density in umol/m2)
    - DEM (Digital Elevation Model in meters)
    - Wind (2-Band U/V vector components in m/s)
    """
    context = get_corridor_context(corridor_id)
    raw_dir = settings.RAW_DATA_DIR
    raw_dir.mkdir(parents=True, exist_ok=True)

    height, width = 100, 100
    min_x, min_y = context.utm_x_min, context.utm_y_min
    max_x, max_y = context.utm_x_max, context.utm_y_max

    # Affine transform for 100x100 raster matching corridor bounds
    transform = from_bounds(min_x, min_y, max_x, max_y, width, height)
    crs_obj = CRS.from_string(context.crs)

    # 1. Synthesize DEM & Topography
    # Generate elevation gradients matching actual valley profile
    xx, yy = np.meshgrid(np.linspace(0, 1, width), np.linspace(0, 1, height))

    if corridor_id == "kamloops":
        # Valley bottom ~340m, surrounding ridges up to 1150m
        dist_from_valley_center = np.sqrt((xx - 0.5)**2 + (yy - 0.45)**2)
        dem = 340.0 + 820.0 * np.clip(dist_from_valley_center / 0.55, 0.0, 1.0)
        elev_inv = (1160.0 - dem) / 820.0

        # LST: Valley floor is warmer (28-32°C), ridges cooler (18-22°C)
        lst = 18.0 + 13.5 * elev_inv + np.random.normal(0, 0.5, (height, width))
        lst = np.clip(lst, 17.5, 33.0).astype(np.float32)

        # TROPOMI NO2: High pooling in valley floor (40-85 umol/m2)
        tropomi_no2 = (30.0 + 55.0 * elev_inv + np.random.normal(0, 2.0, (height, width))).astype(np.float32)

        # Wind: Valley channeling wind vector
        wind_u = np.full((height, width), -2.2, dtype=np.float32) + np.random.normal(0, 0.2, (height, width)).astype(np.float32)
        wind_v = np.full((height, width), 1.1, dtype=np.float32) + np.random.normal(0, 0.2, (height, width)).astype(np.float32)

    else:
        # Delhi NCR: Flat plain (210m-290m) with acute urban heat island
        dem = (210.0 + 75.0 * xx + np.random.normal(0, 2.0, (height, width))).astype(np.float32)
        
        # LST: Extreme thermal load across built-up slums (36-46°C)
        dist_center = np.sqrt((xx - 0.55)**2 + (yy - 0.5)**2)
        lst = 34.0 + 12.0 * np.clip(1.0 - dist_center, 0.0, 1.0) + np.random.normal(0, 0.8, (height, width))
        lst = np.clip(lst, 25.0, 48.0).astype(np.float32)

        # TROPOMI NO2: High industrial/traffic emissions
        tropomi_no2 = (55.0 + 65.0 * np.clip(1.0 - dist_center, 0.0, 1.0) + np.random.normal(0, 3.0, (height, width))).astype(np.float32)

        wind_u = np.full((height, width), -1.2, dtype=np.float32)
        wind_v = np.full((height, width), 0.8, dtype=np.float32)

    dem = dem.astype(np.float32)

    # Helper function to write single-band GeoTIFF
    def write_single_band(filename: str, array_2d: np.ndarray, description: str):
        filepath = raw_dir / filename
        with rasterio.open(
            filepath,
            "w",
            driver="GTiff",
            height=height,
            width=width,
            count=1,
            dtype=np.float32,
            crs=crs_obj,
            transform=transform,
            nodata=np.nan,
            compress="deflate"
        ) as dst:
            dst.write(array_2d, 1)
            dst.set_band_description(1, description)
        return filepath

    # Write LST
    write_single_band(f"{corridor_id}_lst.tif", lst, "Land Surface Temperature (Celsius)")
    # Write TROPOMI NO2
    write_single_band(f"{corridor_id}_tropomi_no2.tif", tropomi_no2, "Tropospheric NO2 Column (umol/m2)")
    # Write DEM
    write_single_band(f"{corridor_id}_dem.tif", dem, "Digital Elevation Model (meters)")

    # Write 2-Band Wind Raster
    wind_filepath = raw_dir / f"{corridor_id}_wind.tif"
    with rasterio.open(
        wind_filepath,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=2,
        dtype=np.float32,
        crs=crs_obj,
        transform=transform,
        nodata=np.nan,
        compress="deflate"
    ) as dst:
        dst.write(wind_u, 1)
        dst.write(wind_v, 2)
        dst.set_band_description(1, "Wind U Component (m/s)")
        dst.set_band_description(2, "Wind V Component (m/s)")

    print(f"[SEEDED RASTERS] {corridor_id.upper()} -> 4 GeoTIFFs saved to {raw_dir}")


def seed_ground_stations(corridor_id: str):
    """
    Seeds mock regulatory in-situ station JSON feeds:
    - Kamloops: 5 ECCC / BC Ministry stations
    - Delhi: 8 CPCB National Air Quality stations
    """
    raw_dir = settings.RAW_DATA_DIR
    raw_dir.mkdir(parents=True, exist_ok=True)

    if corridor_id == "kamloops":
        stations = [
            {"station_id": "ECCC_KM_01", "name": "Kamloops Downtown Federal Station", "latitude": 50.6745, "longitude": -120.3273, "elevation_m": 348.0, "current_pm25": 42.5, "aqhi": 5.2, "status": "ACTIVE"},
            {"station_id": "ECCC_KM_02", "name": "Kamloops North Shore Station", "latitude": 50.6912, "longitude": -120.3541, "elevation_m": 352.0, "current_pm25": 58.2, "aqhi": 6.8, "status": "ACTIVE"},
            {"station_id": "ECCC_KM_03", "name": "Thompson Rivers University Air Lab", "latitude": 50.6701, "longitude": -120.3650, "elevation_m": 435.0, "current_pm25": 38.1, "aqhi": 4.9, "status": "ACTIVE"},
            {"station_id": "ECCC_KM_04", "name": "Valleyview Inversion Site", "latitude": 50.6651, "longitude": -120.2612, "elevation_m": 342.0, "current_pm25": 84.7, "aqhi": 8.9, "status": "ACTIVE"},
            {"station_id": "ECCC_KM_05", "name": "Rayleigh North Valley Sentinel", "latitude": 50.7812, "longitude": -120.2981, "elevation_m": 360.0, "current_pm25": 92.4, "aqhi": 9.4, "status": "ACTIVE"}
        ]
    else:
        stations = [
            {"station_id": "CPCB_DEL_01", "name": "Anand Vihar Monitoring Station", "latitude": 28.6469, "longitude": 77.3160, "elevation_m": 215.0, "current_pm25": 210.0, "aqhi": 10.0, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_02", "name": "R K Puram NAQI Lab", "latitude": 28.5630, "longitude": 77.1860, "elevation_m": 228.0, "current_pm25": 165.0, "aqhi": 8.5, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_03", "name": "Punjabi Bagh Urban Sensor", "latitude": 28.6740, "longitude": 77.1310, "elevation_m": 218.0, "current_pm25": 190.0, "aqhi": 9.2, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_04", "name": "Shadipur Central Feeder", "latitude": 28.6510, "longitude": 77.1580, "elevation_m": 216.0, "current_pm25": 178.0, "aqhi": 8.9, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_05", "name": "Bawana Industrial Perimeter", "latitude": 28.7950, "longitude": 77.0420, "elevation_m": 222.0, "current_pm25": 260.0, "aqhi": 10.5, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_06", "name": "Okhla Phase-II Monitoring", "latitude": 28.5310, "longitude": 77.2710, "elevation_m": 219.0, "current_pm25": 182.0, "aqhi": 9.0, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_07", "name": "Jahangirpuri North Gateway", "latitude": 28.7320, "longitude": 77.1700, "elevation_m": 214.0, "current_pm25": 235.0, "aqhi": 10.0, "status": "ACTIVE"},
            {"station_id": "CPCB_DEL_08", "name": "Dwarka Sector 8 Baseline", "latitude": 28.5710, "longitude": 77.0710, "elevation_m": 225.0, "current_pm25": 140.0, "aqhi": 7.8, "status": "ACTIVE"}
        ]

    filepath = raw_dir / f"{corridor_id}_stations.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({
            "corridor": corridor_id,
            "provider": "ECCC_NAPS" if corridor_id == "kamloops" else "CPCB_NAQI",
            "total_stations": len(stations),
            "stations": stations
        }, f, indent=2)

    print(f"[SEEDED STATIONS] {corridor_id.upper()} -> {len(stations)} stations saved to {filepath}")


def run_all_seeders():
    """Seeds both Kamloops and Delhi NCR synthetic datasets."""
    print("=" * 75)
    print("[RUNNING SEEDER] Generating Baseline Earth Observation Datasets")
    print("=" * 75)
    for cid in ["kamloops", "delhi"]:
        seed_corridor_rasters(cid)
        seed_ground_stations(cid)
    print("=" * 75)
    print("[SUCCESS] ALL SYNTHETIC RASTERS & STATIONS SEEDED INTO data/raw/")
    print("=" * 75)


if __name__ == "__main__":
    run_all_seeders()
