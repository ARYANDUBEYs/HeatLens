"""
HeatLens - Delhi NCR Ward Boundary & Score Generator
Generates realistic GeoJSON and baseline multi-factor vulnerability data
based on Landsat-8/9 Band 10 LST and Sentinel-2 NDVI.
"""

import json
import os
import numpy as np

# Coordinates centered on Delhi NCR: [longitude, latitude]
WARDS_META = [
    {
        "ward_id": "DEL_001",
        "ward_name": "Connaught Place",
        "zone": "New Delhi",
        "center": [77.2195, 28.6315],
        "radius_deg": 0.015,
        "base_lst": 43.8,
        "ndvi": 0.22,
        "aqi": 210,
        "population_density": 18500,
        "vulnerable_pop_pct": 0.28,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_002",
        "ward_name": "Chandni Chowk",
        "zone": "Central Delhi",
        "center": [77.2300, 28.6562],
        "radius_deg": 0.012,
        "base_lst": 47.6,
        "ndvi": 0.08,
        "aqi": 285,
        "population_density": 34000,
        "vulnerable_pop_pct": 0.42,
        "cooling_centers": 0
    },
    {
        "ward_id": "DEL_003",
        "ward_name": "Karol Bagh",
        "zone": "Central Delhi",
        "center": [77.1895, 28.6515],
        "radius_deg": 0.016,
        "base_lst": 45.9,
        "ndvi": 0.14,
        "aqi": 240,
        "population_density": 27000,
        "vulnerable_pop_pct": 0.35,
        "cooling_centers": 1
    },
    {
        "ward_id": "DEL_004",
        "ward_name": "Rohini Sector 7",
        "zone": "North West Delhi",
        "center": [77.1130, 28.7125],
        "radius_deg": 0.020,
        "base_lst": 44.5,
        "ndvi": 0.25,
        "aqi": 220,
        "population_density": 21000,
        "vulnerable_pop_pct": 0.31,
        "cooling_centers": 1
    },
    {
        "ward_id": "DEL_005",
        "ward_name": "Narela Industrial Area",
        "zone": "North Delhi",
        "center": [77.0980, 28.8520],
        "radius_deg": 0.025,
        "base_lst": 48.9,
        "ndvi": 0.06,
        "aqi": 320,
        "population_density": 16000,
        "vulnerable_pop_pct": 0.46,
        "cooling_centers": 0
    },
    {
        "ward_id": "DEL_006",
        "ward_name": "Anand Vihar",
        "zone": "East Delhi",
        "center": [77.3150, 28.6470],
        "radius_deg": 0.018,
        "base_lst": 48.2,
        "ndvi": 0.09,
        "aqi": 345,
        "population_density": 29000,
        "vulnerable_pop_pct": 0.39,
        "cooling_centers": 0
    },
    {
        "ward_id": "DEL_007",
        "ward_name": "Mayur Vihar Phase 1",
        "zone": "East Delhi",
        "center": [77.2950, 28.6050],
        "radius_deg": 0.018,
        "base_lst": 42.1,
        "ndvi": 0.32,
        "aqi": 195,
        "population_density": 19500,
        "vulnerable_pop_pct": 0.26,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_008",
        "ward_name": "Okhla Industrial Area",
        "zone": "South East Delhi",
        "center": [77.2750, 28.5350],
        "radius_deg": 0.022,
        "base_lst": 49.1,
        "ndvi": 0.05,
        "aqi": 310,
        "population_density": 24000,
        "vulnerable_pop_pct": 0.44,
        "cooling_centers": 0
    },
    {
        "ward_id": "DEL_009",
        "ward_name": "Hauz Khas & Green Park",
        "zone": "South Delhi",
        "center": [77.2020, 28.5520],
        "radius_deg": 0.017,
        "base_lst": 38.2,
        "ndvi": 0.48,
        "aqi": 160,
        "population_density": 14000,
        "vulnerable_pop_pct": 0.20,
        "cooling_centers": 3
    },
    {
        "ward_id": "DEL_010",
        "ward_name": "Vasant Kunj & Ridge",
        "zone": "South West Delhi",
        "center": [77.1550, 28.5250],
        "radius_deg": 0.024,
        "base_lst": 36.9,
        "ndvi": 0.54,
        "aqi": 140,
        "population_density": 11000,
        "vulnerable_pop_pct": 0.18,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_011",
        "ward_name": "Dwarka Sector 10",
        "zone": "South West Delhi",
        "center": [77.0580, 28.5820],
        "radius_deg": 0.021,
        "base_lst": 41.8,
        "ndvi": 0.34,
        "aqi": 180,
        "population_density": 16500,
        "vulnerable_pop_pct": 0.22,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_012",
        "ward_name": "Janakpuri",
        "zone": "West Delhi",
        "center": [77.0850, 28.6250],
        "radius_deg": 0.018,
        "base_lst": 43.4,
        "ndvi": 0.24,
        "aqi": 215,
        "population_density": 22000,
        "vulnerable_pop_pct": 0.30,
        "cooling_centers": 1
    },
    {
        "ward_id": "DEL_013",
        "ward_name": "Civil Lines",
        "zone": "North Delhi",
        "center": [77.2250, 28.6800],
        "radius_deg": 0.017,
        "base_lst": 39.5,
        "ndvi": 0.44,
        "aqi": 175,
        "population_density": 13500,
        "vulnerable_pop_pct": 0.21,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_014",
        "ward_name": "Shahdara",
        "zone": "North East Delhi",
        "center": [77.2920, 28.6720],
        "radius_deg": 0.019,
        "base_lst": 46.8,
        "ndvi": 0.11,
        "aqi": 290,
        "population_density": 31000,
        "vulnerable_pop_pct": 0.40,
        "cooling_centers": 0
    },
    {
        "ward_id": "DEL_015",
        "ward_name": "Najafgarh",
        "zone": "South West Delhi",
        "center": [76.9850, 28.6100],
        "radius_deg": 0.028,
        "base_lst": 44.0,
        "ndvi": 0.29,
        "aqi": 205,
        "population_density": 9500,
        "vulnerable_pop_pct": 0.33,
        "cooling_centers": 1
    },
    {
        "ward_id": "DEL_016",
        "ward_name": "Punjabi Bagh",
        "zone": "West Delhi",
        "center": [77.1350, 28.6650],
        "radius_deg": 0.016,
        "base_lst": 43.0,
        "ndvi": 0.28,
        "aqi": 210,
        "population_density": 20000,
        "vulnerable_pop_pct": 0.27,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_017",
        "ward_name": "Lajpat Nagar",
        "zone": "South Delhi",
        "center": [77.2420, 28.5700],
        "radius_deg": 0.015,
        "base_lst": 44.2,
        "ndvi": 0.19,
        "aqi": 225,
        "population_density": 26000,
        "vulnerable_pop_pct": 0.31,
        "cooling_centers": 1
    },
    {
        "ward_id": "DEL_018",
        "ward_name": "Saket",
        "zone": "South Delhi",
        "center": [77.2150, 28.5200],
        "radius_deg": 0.018,
        "base_lst": 41.5,
        "ndvi": 0.36,
        "aqi": 185,
        "population_density": 17000,
        "vulnerable_pop_pct": 0.23,
        "cooling_centers": 2
    },
    {
        "ward_id": "DEL_019",
        "ward_name": "Sarita Vihar",
        "zone": "South East Delhi",
        "center": [77.3000, 28.5300],
        "radius_deg": 0.018,
        "base_lst": 45.2,
        "ndvi": 0.17,
        "aqi": 260,
        "population_density": 21500,
        "vulnerable_pop_pct": 0.34,
        "cooling_centers": 1
    },
    {
        "ward_id": "DEL_020",
        "ward_name": "Alipur",
        "zone": "North Delhi",
        "center": [77.1350, 28.8000],
        "radius_deg": 0.026,
        "base_lst": 42.6,
        "ndvi": 0.35,
        "aqi": 190,
        "population_density": 8500,
        "vulnerable_pop_pct": 0.29,
        "cooling_centers": 1
    }
]

def create_polygon(center, r, n_points=8, seed=42):
    """Generate irregular polygon around center."""
    rng = np.random.RandomState(seed)
    angles = np.linspace(0, 2 * np.pi, n_points, endpoint=False)
    coords = []
    for a in angles:
        # vary radius slightly for realistic boundary shape
        jitter = 1.0 + 0.18 * rng.randn()
        lng = center[0] + r * np.cos(a) * jitter
        lat = center[1] + (r * 0.85) * np.sin(a) * jitter
        coords.append([round(lng, 5), round(lat, 5)])
    coords.append(coords[0])  # close ring
    return [coords]

def compute_ahp_scores(wards):
    """Compute AHP multi-factor score: 0.35(LST) + 0.25(1-NDVI) + 0.20(AQI) + 0.20(Risk)."""
    lsts = np.array([w["base_lst"] for w in wards])
    ndvis = np.array([w["ndvi"] for w in wards])
    aqis = np.array([w["aqi"] for w in wards])
    risks = np.array([w["vulnerable_pop_pct"] for w in wards])

    # Min-max normalization
    lst_n = (lsts - lsts.min()) / (lsts.max() - lsts.min())
    ndvi_n = (ndvis - ndvis.min()) / (ndvis.max() - ndvis.min())
    aqi_n = (aqis - aqis.min()) / (aqis.max() - aqis.min())
    risk_n = (risks - risks.min()) / (risks.max() - risks.min())

    scores = 0.35 * lst_n + 0.25 * (1.0 - ndvi_n) + 0.20 * aqi_n + 0.20 * risk_n

    results = []
    for i, w in enumerate(wards):
        score = float(round(scores[i], 4))
        if score >= 0.70:
            tier = "HIGH"
        elif score >= 0.40:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        entry = {
            "ward_id": w["ward_id"],
            "ward_name": w["ward_name"],
            "zone": w["zone"],
            "coordinates": {"lng": w["center"][0], "lat": w["center"][1]},
            "lst_celsius": w["base_lst"],
            "ndvi": w["ndvi"],
            "aqi": w["aqi"],
            "population_density": w["population_density"],
            "vulnerable_pop_pct": w["vulnerable_pop_pct"],
            "existing_cooling_centers": w["cooling_centers"],
            "vulnerability_score": score,
            "risk_tier": tier,
            "recommended_cooling_centers": max(0, 3 - w["cooling_centers"]) if tier == "HIGH" else (1 if tier == "MEDIUM" and w["cooling_centers"] == 0 else 0)
        }
        results.append(entry)

    # Sort descending by vulnerability
    results.sort(key=lambda x: x["vulnerability_score"], reverse=True)
    return results

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(base_dir, exist_ok=True)

    scores_data = compute_ahp_scores(WARDS_META)
    scores_dict = {item["ward_id"]: item for item in scores_data}

    # Generate GeoJSON FeatureCollection
    features = []
    for idx, w in enumerate(WARDS_META):
        poly_coords = create_polygon(w["center"], w["radius_deg"], n_points=10, seed=100 + idx)
        score_info = scores_dict[w["ward_id"]]

        feature = {
            "type": "Feature",
            "id": w["ward_id"],
            "properties": {
                "ward_id": w["ward_id"],
                "ward_name": w["ward_name"],
                "zone": w["zone"],
                "lst_celsius": score_info["lst_celsius"],
                "ndvi": score_info["ndvi"],
                "aqi": score_info["aqi"],
                "population_density": score_info["population_density"],
                "vulnerability_score": score_info["vulnerability_score"],
                "risk_tier": score_info["risk_tier"],
                "existing_cooling_centers": score_info["existing_cooling_centers"],
                "recommended_cooling_centers": score_info["recommended_cooling_centers"]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": poly_coords
            }
        }
        features.append(feature)

    geojson_output = {
        "type": "FeatureCollection",
        "metadata": {
            "city": "Delhi NCR",
            "region": "Central India",
            "satellite_sources": ["Landsat-8/9 TIRS Band 10", "Sentinel-2 MSI"],
            "date": "2025-07",
            "total_wards": len(features)
        },
        "features": features
    }

    geojson_path = os.path.join(base_dir, "delhi_ward_boundaries.geojson")
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson_output, f, indent=2)

    scores_path = os.path.join(base_dir, "delhi_ward_scores.json")
    with open(scores_path, "w", encoding="utf-8") as f:
        json.dump({
            "city": "Delhi NCR",
            "date": "2025-07",
            "total_wards": len(scores_data),
            "high_risk_count": sum(1 for s in scores_data if s["risk_tier"] == "HIGH"),
            "medium_risk_count": sum(1 for s in scores_data if s["risk_tier"] == "MEDIUM"),
            "low_risk_count": sum(1 for s in scores_data if s["risk_tier"] == "LOW"),
            "wards": scores_data
        }, f, indent=2)

    print(f"Generated {geojson_path}")
    print(f"Generated {scores_path}")
    print(f"Total wards generated: {len(scores_data)}")

if __name__ == "__main__":
    main()
