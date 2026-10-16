"""
Air Quality & Spatiotemporal Downscaling Router
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh
"""

import os
import time
from pathlib import Path
from typing import Optional, Dict, Any, List
import numpy as np
import pandas as pd
import rasterio
from rasterio.crs import CRS
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.config import settings
from app.services.corridor_manager import get_corridor_context
from app.core.downscaler import RegressionKrigingDownscaler
from app.services.algorand_oracle import AlgorandAttestationOracle

router = APIRouter(prefix="", tags=["Air Quality & Downscaling"])

# Cache downscalers per corridor
downscalers_cache: Dict[str, RegressionKrigingDownscaler] = {}
oracle_instance = AlgorandAttestationOracle()


class DownscaleTriggerRequest(BaseModel):
    step_meters: float = Field(default=350.0, ge=30.0, le=1000.0, description="Target spatial grid resolution in meters")
    save_geotiff: bool = Field(default=True, description="Persist downscaled result as Cloud-Optimized GeoTIFF")


@router.post("/api/v1/{corridor_id}/downscale")
def execute_downscaling_pipeline(
    corridor_id: str,
    payload: DownscaleTriggerRequest = DownscaleTriggerRequest()
):
    """
    Executes the full Physics -> Regression-Kriging -> SVVI pipeline:
    1. Ingests corridor geospatial context and training observations.
    2. Fits Two-Stage Regression-Kriging Downscaler.
    3. Generates continuous 30m grid and predicts PM2.5, AQHI, and Kriging Variance.
    4. Computes Sensor Void Vulnerability Index (SVVI).
    5. Writes multi-band Cloud-Optimized GeoTIFF to `data/outputs/`.
    6. Returns execution summary and SHA-256 state digest.
    """
    try:
        context = get_corridor_context(corridor_id)
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    # 1. Prepare Training Data & Downscaler
    if corridor_id not in downscalers_cache:
        downscaler = RegressionKrigingDownscaler(target_corridor=corridor_id, model_type="spherical")
        stations_df = context.generate_synthetic_stations(n_stations=18)
        downscaler.fit(stations_df, target_col="PM25")
        downscalers_cache[corridor_id] = downscaler
    else:
        downscaler = downscalers_cache[corridor_id]

    # 2. Generate Spatial Grid Coordinates
    grid_coords_utm, lons, lats, shape, affine_transform = context.generate_grid_coords(
        step_meters=payload.step_meters
    )
    n_points = len(grid_coords_utm)

    # 3. Formulate Gridded Atmospheric & Environmental Covariates
    if corridor_id == "kamloops":
        center_lon, center_lat = -120.33, 50.67
        dist = np.sqrt((lons - center_lon)**2 + (lats - center_lat)**2)
        elevations = 345.0 + 580.0 * np.clip(dist / 0.18, 0.0, 1.0)
        elev_factor = (925.0 - elevations) / 580.0
        isi = np.clip(0.15 + 0.70 * elev_factor, 0.0, 1.0)
        tropomi_no2 = 32.0 + 55.0 * elev_factor + np.sin(lons * 30) * 4.0
        aerosol_index = 1.4 + 2.2 * elev_factor + np.cos(lats * 25) * 0.3
        lst = 27.5 + 8.0 * elev_factor
        blh = 420.0 + 380.0 * (1.0 - elev_factor)
        slope = np.random.uniform(2.0, 18.0, n_points)
    else:
        # Delhi NCR
        elevations = np.full(n_points, 225.0)
        isi = np.random.uniform(0.35, 0.88, n_points)
        tropomi_no2 = np.random.uniform(60.0, 115.0, n_points)
        aerosol_index = np.random.uniform(2.0, 3.8, n_points)
        lst = np.random.uniform(38.0, 47.0, n_points)
        blh = np.random.uniform(380.0, 750.0, n_points)
        slope = np.random.uniform(0.5, 3.5, n_points)

    grid_features_df = pd.DataFrame({
        "TROPOMI_NO2": tropomi_no2,
        "UV_Aerosol_Index": aerosol_index,
        "LST": lst,
        "Elevation": elevations,
        "Slope": slope,
        "Wind_U": np.full(n_points, -1.8),
        "Wind_V": np.full(n_points, 1.1),
        "BLH": blh,
        "ISI": isi
    })

    # 4. Predict Downscaled Continuous Fields
    predictions = downscaler.predict(grid_features_df, grid_coords_utm)

    # 5. Calculate Sensor Void Vulnerability Index (SVVI)
    svvi_results = downscaler.calculate_sensor_void_vulnerability(
        grid_coords=grid_coords_utm,
        station_coords=downscaler.station_coords_utm,
        kriging_variance=predictions["kriging_variance"],
        predicted_aqhi=predictions["aqhi"]
    )

    # Reshape 1D arrays into 2D raster matrices: (height, width)
    pm25_2d = predictions["pm25"].reshape(shape).astype(np.float32)
    aqhi_2d = predictions["aqhi"].reshape(shape).astype(np.float32)
    isi_2d = isi.reshape(shape).astype(np.float32)
    svvi_2d = svvi_results["svvi"].reshape(shape).astype(np.float32)
    var_2d = predictions["kriging_variance"].reshape(shape).astype(np.float32)

    # 6. Save Multi-Band Cloud-Optimized GeoTIFF if requested
    output_geotiff_path = ""
    timestamp = int(time.time())

    if payload.save_geotiff:
        settings.OUTPUTS_DATA_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{corridor_id}_downscaled_30m_{timestamp}.tif"
        full_path = settings.OUTPUTS_DATA_DIR / filename

        crs_obj = CRS.from_string(context.crs)

        with rasterio.open(
            full_path,
            "w",
            driver="GTiff",
            height=shape[0],
            width=shape[1],
            count=5,
            dtype=np.float32,
            crs=crs_obj,
            transform=affine_transform,
            nodata=np.nan,
            compress="deflate"
        ) as dst:
            dst.write(pm25_2d, 1)
            dst.write(aqhi_2d, 2)
            dst.write(isi_2d, 3)
            dst.write(svvi_2d, 4)
            dst.write(var_2d, 5)

            dst.set_band_description(1, "Downscaled PM2.5 (ug/m3)")
            dst.set_band_description(2, "Canadian Air Quality Health Index (AQHI)")
            dst.set_band_description(3, "Inversion Severity Index (ISI)")
            dst.set_band_description(4, "Sensor Void Vulnerability Index (SVVI)")
            dst.set_band_description(5, "Ordinary Kriging Estimation Variance")

        output_geotiff_path = str(full_path)

    # 7. Compute Cryptographic State Hash
    raster_hash = oracle_instance.compute_raster_hash(
        pm25_2d,
        metadata={
            "corridor": corridor_id,
            "resolution_meters": payload.step_meters,
            "timestamp": timestamp,
            "mean_pm25": float(np.mean(predictions["pm25"])),
            "peak_aqhi": float(np.max(predictions["aqhi"]))
        }
    )

    return {
        "success": True,
        "corridor": {
            "id": context.id,
            "name": context.name,
            "crs": context.crs
        },
        "raster_metadata": {
            "resolution_meters": payload.step_meters,
            "dimensions": {"height": shape[0], "width": shape[1]},
            "total_pixels": n_points,
            "geotiff_file": output_geotiff_path,
            "sha256_digest": raster_hash
        },
        "downscaled_metrics": {
            "pm25_min_ug_m3": round(float(np.min(predictions["pm25"])), 2),
            "pm25_max_ug_m3": round(float(np.max(predictions["pm25"])), 2),
            "pm25_mean_ug_m3": round(float(np.mean(predictions["pm25"])), 2),
            "peak_aqhi_score": round(float(np.max(predictions["aqhi"])), 1),
            "peak_svvi_score": round(float(np.max(svvi_results["svvi"])), 4),
            "max_sensor_void_km": round(float(np.max(svvi_results["distance_km"])), 2)
        }
    }


@router.get("/api/v1/{corridor_id}/grid")
def get_downscaled_geojson_grid(
    corridor_id: str,
    grid_dim: int = Query(40, ge=15, le=55, description="Client mesh dimension across each axis (e.g. 40x40 = 1600 quads max)")
):
    """
    Returns downscaled predictions formatted as an optimized GeoJSON FeatureCollection
    with polygon quad mesh footprints for direct React-Leaflet choropleth rendering.
    Dynamically caps grid payload to prevent client-side browser freezes.
    """
    try:
        context = get_corridor_context(corridor_id)
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    # 1. Compute dynamic step_meters to generate exactly ~grid_dim x grid_dim mesh
    corridor_width_meters = abs(context.utm_x_max - context.utm_x_min)
    corridor_height_meters = abs(context.utm_y_max - context.utm_y_min)
    step_meters = max(float(max(corridor_width_meters, corridor_height_meters) / grid_dim), 100.0)

    grid_coords_utm, lons, lats, shape, affine_transform = context.generate_grid_coords(
        step_meters=step_meters
    )
    n_points = len(grid_coords_utm)

    # 2. Retrieve or fit corridor downscaler
    if corridor_id not in downscalers_cache:
        downscaler = RegressionKrigingDownscaler(target_corridor=corridor_id)
        stations_df = context.generate_synthetic_stations(n_stations=16)
        downscaler.fit(stations_df)
        downscalers_cache[corridor_id] = downscaler
    else:
        downscaler = downscalers_cache[corridor_id]

    # 3. Synthesize elevation and atmospheric covariates matching corridor profile
    if corridor_id == "kamloops":
        center_lon, center_lat = -120.33, 50.67
        dist = np.sqrt((lons - center_lon)**2 + (lats - center_lat)**2)
        elevations = 340.0 + 580.0 * np.clip(dist / 0.18, 0.0, 1.0)
        elev_inv = (920.0 - elevations) / 580.0
        isi = np.clip(0.15 + 0.70 * elev_inv, 0.0, 1.0)
        tropomi_no2 = 32.0 + 55.0 * elev_inv + np.sin(lons * 30) * 4.0
        aerosol_index = 1.4 + 2.2 * elev_inv + np.cos(lats * 25) * 0.3
        lst = 27.5 + 8.0 * elev_inv
        blh = 420.0 + 380.0 * (1.0 - elev_inv)
        slope = np.random.uniform(2.0, 18.0, n_points)
    else:
        elevations = np.random.uniform(212.0, 275.0, n_points)
        isi = np.random.uniform(0.35, 0.88, n_points)
        tropomi_no2 = np.random.uniform(60.0, 115.0, n_points)
        aerosol_index = np.random.uniform(2.0, 3.8, n_points)
        lst = np.random.uniform(38.0, 47.0, n_points)
        blh = np.random.uniform(380.0, 750.0, n_points)
        slope = np.random.uniform(0.5, 3.5, n_points)

    grid_df = pd.DataFrame({
        "TROPOMI_NO2": tropomi_no2,
        "UV_Aerosol_Index": aerosol_index,
        "LST": lst,
        "Elevation": elevations,
        "Slope": slope,
        "Wind_U": np.full(n_points, -1.8),
        "Wind_V": np.full(n_points, 1.1),
        "BLH": blh,
        "ISI": isi
    })

    # 4. Predict Downscaled Fields & SVVI
    predictions = downscaler.predict(grid_df, grid_coords_utm)
    svvi_results = downscaler.calculate_sensor_void_vulnerability(
        grid_coords=grid_coords_utm,
        station_coords=downscaler.station_coords_utm,
        kriging_variance=predictions["kriging_variance"],
        predicted_aqhi=predictions["aqhi"]
    )

    # 5. Build Lightweight Quad Polygon Footprints
    half_step_deg_lat = (step_meters / 111320.0) / 2.0
    half_step_deg_lon = (step_meters / (111320.0 * np.cos(np.radians(context.min_lat)))) / 2.0

    features = []
    for idx in range(n_points):
        lon = float(lons[idx])
        lat = float(lats[idx])
        pm25 = round(float(predictions["pm25"][idx]), 1)
        aqhi = round(float(predictions["aqhi"][idx]), 1)
        isi_val = round(float(isi[idx]), 3)
        svvi_val = round(float(svvi_results["svvi"][idx]), 3)
        elev_val = round(float(elevations[idx]), 1)
        dist_km = round(float(svvi_results["distance_km"][idx]), 1)

        # Risk classification
        if aqhi >= 8.5:
            risk = "CRITICAL_WILDFIRE_SMOG"
        elif aqhi >= 6.0:
            risk = "HIGH_INVERSION_RISK"
        elif aqhi >= 4.0:
            risk = "MODERATE"
        else:
            risk = "CLEAN_BASELINE"

        # Polygon quad cell footprint
        poly_coords = [
            [
                [round(lon - half_step_deg_lon, 5), round(lat - half_step_deg_lat, 5)],
                [round(lon + half_step_deg_lon, 5), round(lat - half_step_deg_lat, 5)],
                [round(lon + half_step_deg_lon, 5), round(lat + half_step_deg_lat, 5)],
                [round(lon - half_step_deg_lon, 5), round(lat + half_step_deg_lat, 5)],
                [round(lon - half_step_deg_lon, 5), round(lat - half_step_deg_lat, 5)]
            ]
        ]

        features.append({
            "type": "Feature",
            "id": f"{corridor_id.upper()}_QUAD_{idx}",
            "properties": {
                "cell_id": idx,
                "center_lon": round(lon, 4),
                "center_lat": round(lat, 4),
                "pm25": pm25,
                "aqhi": aqhi,
                "isi": isi_val,
                "svvi": svvi_val,
                "elevation": elev_val,
                "distance_km": dist_km,
                "risk_tier": risk
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": poly_coords
            }
        })

    return {
        "type": "FeatureCollection",
        "metadata": {
            "corridor": context.name,
            "crs": context.crs,
            "grid_dimensions": {"height": shape[0], "width": shape[1]},
            "total_polygons": len(features),
            "step_meters": round(step_meters, 1)
        },
        "features": features
    }
