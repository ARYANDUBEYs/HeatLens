"""
Municipal Clean-Air Shelter & Sensor Allocation Router
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.optimizer import optimize_clean_air_allocation
from app.services.corridor_manager import get_corridor_context

router = APIRouter(prefix="", tags=["Municipal Simulation & Resource Optimization"])


class CandidateZoneInput(BaseModel):
    zone_id: str
    latitude: float
    longitude: float
    population: int
    svvi_score: float = Field(..., ge=0.0, le=1.0)


class ShelterOptimizationRequest(BaseModel):
    budget_cad: float = Field(default=35000.0, ge=1000.0, description="Total intervention budget in CAD")
    shelter_cost: float = Field(default=7500.0, ge=500.0, description="Unit cost per HEPA clean air shelter")
    sensor_cost: float = Field(default=850.0, ge=50.0, description="Unit cost per solar IoT Kriging sensor node")
    candidate_zones: Optional[List[CandidateZoneInput]] = None


@router.post("/api/v1/{corridor_id}/shelters/optimize")
def optimize_shelter_placement(
    corridor_id: str,
    payload: ShelterOptimizationRequest
):
    """
    Executes Integer Linear Programming (ILP) to optimize the allocation of:
    - Municipal HEPA Clean-Air Filtration Hubs ($7,500 CAD)
    - Solar-powered IoT Spatiotemporal Kriging Sensor Nodes ($850 CAD)
    under the specified municipal budget ceiling.
    """
    try:
        context = get_corridor_context(corridor_id)
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    # Use provided candidate zones or generate corridor-tailored candidate zones
    if payload.candidate_zones and len(payload.candidate_zones) > 0:
        zones = [z.model_dump() for z in payload.candidate_zones]
    else:
        if corridor_id == "kamloops":
            zones = [
                {"zone_id": "KM_DOWNTOWN", "latitude": 50.6745, "longitude": -120.3273, "population": 18500, "svvi_score": 0.88},
                {"zone_id": "KM_NORTH_SHORE", "latitude": 50.6912, "longitude": -120.3541, "population": 14200, "svvi_score": 0.79},
                {"zone_id": "KM_VALLEYVIEW", "latitude": 50.6651, "longitude": -120.2612, "population": 8400, "svvi_score": 0.94},
                {"zone_id": "KM_SAHALI", "latitude": 50.6558, "longitude": -120.3592, "population": 12800, "svvi_score": 0.42},
                {"zone_id": "KM_BROCKLEHURST", "latitude": 50.7051, "longitude": -120.4124, "population": 9600, "svvi_score": 0.85},
                {"zone_id": "KM_RAYLEIGH_RURAL", "latitude": 50.7812, "longitude": -120.2981, "population": 3100, "svvi_score": 0.96},
                {"zone_id": "KM_DALLAS_SUB", "latitude": 50.6482, "longitude": -120.1985, "population": 4600, "svvi_score": 0.91}
            ]
        else:
            # Delhi NCR Wards
            zones = [
                {"zone_id": "DEL_SEELAMPUR", "latitude": 28.6644, "longitude": 77.2685, "population": 42000, "svvi_score": 0.95},
                {"zone_id": "DEL_ANAND_VIHAR", "latitude": 28.6469, "longitude": 77.3160, "population": 38000, "svvi_score": 0.92},
                {"zone_id": "DEL_BAWANA_IND", "latitude": 28.7950, "longitude": 77.0420, "population": 29000, "svvi_score": 0.96},
                {"zone_id": "DEL_CHANAKYAPURI", "latitude": 28.5983, "longitude": 77.1890, "population": 12000, "svvi_score": 0.18},
                {"zone_id": "DEL_NARELA", "latitude": 28.8520, "longitude": 77.0910, "population": 31000, "svvi_score": 0.89}
            ]

    # Execute ILP optimization via PuLP
    results = optimize_clean_air_allocation(
        candidate_zones=zones,
        budget_cad=payload.budget_cad,
        shelter_cost=payload.shelter_cost,
        sensor_cost=payload.sensor_cost
    )

    return {
        "success": True,
        "corridor": {
            "id": context.id,
            "name": context.name
        },
        "budget_summary": {
            "allocated_budget_cad": payload.budget_cad,
            "total_spent_cad": results["itemized_expenditure"]["total_spent_cad"],
            "unspent_surplus_cad": results["unspent_budget_cad"]
        },
        "equipment_breakdown": {
            "hepa_shelters_deployed": results["itemized_expenditure"]["hepa_shelters_count"],
            "hepa_shelters_total_cost_cad": results["itemized_expenditure"]["hepa_shelters_cost_cad"],
            "iot_kriging_sensors_deployed": results["itemized_expenditure"]["iot_sensors_count"],
            "iot_sensors_total_cost_cad": results["itemized_expenditure"]["iot_sensors_cost_cad"]
        },
        "social_impact_metrics": {
            "beneficiaries_served": results["total_protected_population"],
            "vulnerability_reduction_impact_score": results["total_vulnerability_impact"]
        },
        "optimal_placements": results["optimal_allocations"]
    }
