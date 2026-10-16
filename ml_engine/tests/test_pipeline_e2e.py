"""
HeatLens End-to-End Automated Smoke & Integration Test Suite
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh
"""

import sys
import os
from pathlib import Path

# Ensure ml_engine root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)


def test_health_check():
    """
    1. Tests GET /health returns 200 and registered corridor profiles.
    """
    response = client.get("/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    data = response.json()

    assert data["status"] == "healthy"
    assert "kamloops" in data["active_corridors"]
    assert "delhi" in data["active_corridors"]
    assert data["active_corridors"]["kamloops"]["crs"] == "EPSG:32610"
    assert data["active_corridors"]["delhi"]["crs"] == "EPSG:32643"
    print("   [PASS] 1. GET /health: Status 200 & Corridors Active")


def test_downscale_pipeline():
    """
    2. Tests POST /api/v1/kamloops/downscale executes the full
       Physics -> ML Regression-Kriging -> SVVI -> GeoTIFF cycle.
    """
    response = client.post(
        "/api/v1/kamloops/downscale",
        json={"step_meters": 450.0, "save_geotiff": True}
    )
    assert response.status_code == 200, f"Downscale failed: {response.text}"
    data = response.json()

    assert data["success"] is True
    assert data["corridor"]["id"] == "kamloops"
    assert data["raster_metadata"]["total_pixels"] > 0

    geotiff_path = Path(data["raster_metadata"]["geotiff_file"])
    assert geotiff_path.exists(), f"GeoTIFF file not found on disk: {geotiff_path}"

    sha256 = data["raster_metadata"]["sha256_digest"]
    assert len(sha256) == 64, f"Invalid SHA-256 length: {sha256}"
    print(f"   [PASS] 2. POST /api/v1/kamloops/downscale: 5-Band GeoTIFF saved ({data['raster_metadata']['total_pixels']} pixels)")


def test_geojson_grid():
    """
    3. Tests GET /api/v1/kamloops/grid returns an optimized FeatureCollection
       with Polygon footprints and required properties (pm25, aqhi, isi, svvi, elevation).
    """
    response = client.get("/api/v1/kamloops/grid?grid_dim=25")
    assert response.status_code == 200, f"Grid failed: {response.text}"
    data = response.json()

    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0

    first_feature = data["features"][0]
    assert first_feature["geometry"]["type"] == "Polygon"
    assert len(first_feature["geometry"]["coordinates"][0]) == 5, "Must be closed polygon quad"

    props = first_feature["properties"]
    required_props = ["pm25", "aqhi", "isi", "svvi", "elevation", "risk_tier"]
    for req in required_props:
        assert req in props, f"Missing property '{req}' in GeoJSON feature: {props}"

    print(f"   [PASS] 3. GET /api/v1/kamloops/grid: {len(data['features'])} Polygon Quads Rendered (All properties present)")


def test_shelters_optimize():
    """
    4. Tests POST /api/v1/kamloops/shelters/optimize with budget $50,000 CAD
       allocates clean-air shelters and IoT sensor nodes within ceiling.
    """
    budget = 50000.0
    response = client.post(
        "/api/v1/kamloops/shelters/optimize",
        json={"budget_cad": budget, "shelter_cost": 7500.0, "sensor_cost": 850.0}
    )
    assert response.status_code == 200, f"Shelter optimization failed: {response.text}"
    data = response.json()

    assert data["success"] is True
    assert data["budget_summary"]["total_spent_cad"] <= budget
    assert data["equipment_breakdown"]["hepa_shelters_deployed"] >= 2
    assert data["equipment_breakdown"]["iot_kriging_sensors_deployed"] >= 2
    assert data["social_impact_metrics"]["beneficiaries_served"] > 10000
    assert len(data["optimal_placements"]) > 0
    print(f"   [PASS] 4. POST /api/v1/kamloops/shelters/optimize: ${data['budget_summary']['total_spent_cad']:,.2f} spent, {data['social_impact_metrics']['beneficiaries_served']:,} protected")


def test_attestation_stamp_and_verify():
    """
    5. Tests POST /api/v1/attestation/stamp produces on-chain proof
       and GET /api/v1/attestation/verify/{tx_id} validates hash parity.
    """
    sample_hash = "5a833cad3b9851906f3be2c168be5243b47b11349c7056b8075a834db50c9d20"
    stamp_res = client.post(
        "/api/v1/attestation/stamp",
        json={"raster_hash": sample_hash, "corridor_id": "kamloops"}
    )
    assert stamp_res.status_code == 200, f"Stamp failed: {stamp_res.text}"
    stamp_data = stamp_res.json()

    tx_id = stamp_data["transaction_id"]
    assert len(tx_id) >= 20

    verify_res = client.get(f"/api/v1/attestation/verify/{tx_id}?expected_hash={sample_hash}")
    assert verify_res.status_code == 200, f"Verify failed: {verify_res.text}"
    verify_data = verify_res.json()

    assert verify_data["verified"] is True
    assert verify_data["hash_parity"] is True
    assert verify_data["status"] == "FINALIZED_ON_LEDGER"
    print(f"   [PASS] 5. POST /stamp & GET /verify: On-chain ledger parity verified ({tx_id[:16]}...)")


if __name__ == "__main__":
    print("=" * 75)
    print("[RUNNING AUTOMATED E2E SMOKE TEST SUITE] HeatLens Spatiotemporal ML API")
    print("=" * 75)
    test_health_check()
    test_downscale_pipeline()
    test_geojson_grid()
    test_shelters_optimize()
    test_attestation_stamp_and_verify()
    print("=" * 75)
    print("[SUCCESS] ALL 5 END-TO-END SMOKE TESTS PASSED (100% VERIFIED)")
    print("=" * 75)
