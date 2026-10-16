"""
Municipal Clean Air Intervention & Resource Allocation Optimizer
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh

Formulation (Integer Linear Programming via PuLP):
- Decision Variables:
    x_j in {0, 1}: Binary decision to deploy a Municipal HEPA Clean-Air Shelter in Zone j ($7,500 CAD)
    z_j in {0, 1}: Binary decision to deploy an IoT Spatiotemporal Kriging Sensor Node in Zone j ($850 CAD)
- Budget Constraint:
    sum_j (x_j * shelter_cost + z_j * sensor_cost) <= budget_cad
- Objective Function:
    Maximize sum_j [ Population_j * SVVI_j * (x_j + 0.3 * z_j) ]
"""

from typing import List, Dict, Any, Union
import pulp


def optimize_clean_air_allocation(
    candidate_zones: List[Dict[str, Any]],
    budget_cad: float,
    shelter_cost: float = 7500.0,
    sensor_cost: float = 850.0
) -> Dict[str, Any]:
    """
    Optimizes municipal clean-air intervention allocations across candidate valley zones
    using Integer Linear Programming (ILP).

    Parameters:
        candidate_zones: List of candidate geographic zones containing:
                         - zone_id: str
                         - latitude: float
                         - longitude: float
                         - population: int
                         - svvi_score: float (Sensor Void Vulnerability Index in [0.0, 1.0])
        budget_cad: Total municipal expenditure ceiling in Canadian Dollars (CAD).
        shelter_cost: Unit capital expenditure for high-capacity HEPA clean air hub ($7,500 CAD).
        sensor_cost: Unit capital expenditure for solar-powered IoT Kriging sensor ($850 CAD).

    Returns:
        Dict containing:
            - optimal_allocations: List of zones selected for intervention
            - itemized_expenditure: Cost breakdown by equipment type
            - unspent_budget_cad: Remaining municipal surplus
            - total_protected_population: Direct beneficiaries served
            - total_vulnerability_impact: Cumulative ILP objective function score
    """
    if not candidate_zones or budget_cad <= 0:
        return {
            "status": "NO_ALLOCATION",
            "optimal_allocations": [],
            "itemized_expenditure": {
                "hepa_shelters_count": 0,
                "hepa_shelters_cost_cad": 0.0,
                "iot_sensors_count": 0,
                "iot_sensors_cost_cad": 0.0,
                "total_spent_cad": 0.0
            },
            "unspent_budget_cad": float(budget_cad),
            "total_protected_population": 0,
            "total_vulnerability_impact": 0.0
        }

    # 1. Initialize ILP Optimization Problem (Maximization)
    prob = pulp.LpProblem("Municipal_Clean_Air_Allocation_ILP", pulp.LpMaximize)

    # 2. Decision Variables
    # x[j]: Binary variable for HEPA shelter deployment
    # z[j]: Binary variable for IoT Kriging sensor node deployment
    x = {}
    z = {}

    for zone in candidate_zones:
        zid = str(zone["zone_id"])
        x[zid] = pulp.LpVariable(f"deploy_shelter_{zid}", cat=pulp.LpBinary)
        z[zid] = pulp.LpVariable(f"deploy_sensor_{zid}", cat=pulp.LpBinary)

    # 3. Budget Constraint
    # sum_j (x_j * shelter_cost + z_j * sensor_cost) <= budget_cad
    prob += (
        pulp.lpSum([
            x[str(zone["zone_id"])] * shelter_cost +
            z[str(zone["zone_id"])] * sensor_cost
            for zone in candidate_zones
        ]) <= budget_cad,
        "Total_Budget_Ceiling_CAD"
    )

    # 4. Objective Function:
    # Maximize sum_j [ Population_j * SVVI_j * (x_j + 0.3 * z_j) ]
    prob += pulp.lpSum([
        float(zone.get("population", 1000)) *
        float(zone.get("svvi_score", 0.5)) *
        (x[str(zone["zone_id"])] + 0.30 * z[str(zone["zone_id"])])
        for zone in candidate_zones
    ]), "Maximize_Population_Vulnerability_Coverage"

    # 5. Solve ILP using CBC solver (quiet mode)
    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    # 6. Parse Optimization Results
    optimal_allocations = []
    shelters_count = 0
    sensors_count = 0
    protected_population = 0

    for zone in candidate_zones:
        zid = str(zone["zone_id"])
        shelter_val = int(pulp.value(x[zid]) or 0)
        sensor_val = int(pulp.value(z[zid]) or 0)

        if shelter_val > 0 or sensor_val > 0:
            if shelter_val > 0:
                shelters_count += 1
                protected_population += int(zone.get("population", 0))
            if sensor_val > 0:
                sensors_count += 1

            optimal_allocations.append({
                "zone_id": zid,
                "latitude": float(zone["latitude"]),
                "longitude": float(zone["longitude"]),
                "population": int(zone.get("population", 0)),
                "svvi_score": round(float(zone.get("svvi_score", 0.0)), 4),
                "deploy_hepa_shelter": bool(shelter_val),
                "deploy_iot_sensor": bool(sensor_val),
                "zone_cost_cad": float(shelter_val * shelter_cost + sensor_val * sensor_cost)
            })

    total_spent = float(shelters_count * shelter_cost + sensors_count * sensor_cost)
    unspent_budget = float(round(budget_cad - total_spent, 2))
    objective_value = float(pulp.value(prob.objective) or 0.0)

    return {
        "status": "OPTIMAL" if prob.status == pulp.constants.LpStatusOptimal else "FEASIBLE",
        "optimal_allocations": optimal_allocations,
        "itemized_expenditure": {
            "hepa_shelters_count": shelters_count,
            "hepa_shelters_cost_cad": float(shelters_count * shelter_cost),
            "iot_sensors_count": sensors_count,
            "iot_sensors_cost_cad": float(sensors_count * sensor_cost),
            "total_spent_cad": total_spent
        },
        "unspent_budget_cad": unspent_budget,
        "total_protected_population": protected_population,
        "total_vulnerability_impact": round(objective_value, 2)
    }


# ============================================================================
# Unit Test & Sanity Checks
# ============================================================================
if __name__ == "__main__":
    print("=" * 75)
    print("[RUNNING UNIT TESTS] Municipal Clean-Air Allocation ILP Optimizer")
    print("=" * 75)

    # 1. Candidate Zones across Kamloops Valley Corridors
    test_zones = [
        {"zone_id": "KM_DOWNTOWN", "latitude": 50.6745, "longitude": -120.3273, "population": 18500, "svvi_score": 0.88},
        {"zone_id": "KM_NORTH_SHORE", "latitude": 50.6912, "longitude": -120.3541, "population": 14200, "svvi_score": 0.79},
        {"zone_id": "KM_VALLEYVIEW", "latitude": 50.6651, "longitude": -120.2612, "population": 8400, "svvi_score": 0.94},
        {"zone_id": "KM_SAHALI", "latitude": 50.6558, "longitude": -120.3592, "population": 12800, "svvi_score": 0.42},
        {"zone_id": "KM_BROCKLEHURST", "latitude": 50.7051, "longitude": -120.4124, "population": 9600, "svvi_score": 0.85},
        {"zone_id": "KM_RAYLEIGH_RURAL", "latitude": 50.7812, "longitude": -120.2981, "population": 3100, "svvi_score": 0.96}
    ]

    budget = 28000.0  # CAD $28,000

    allocation_results = optimize_clean_air_allocation(test_zones, budget_cad=budget)

    print("\n1. Optimization Results:")
    print(f"   Status:                   {allocation_results['status']}")
    print(f"   Budget Allocated:         ${budget:,.2f} CAD")
    print(f"   Total Spent:              ${allocation_results['itemized_expenditure']['total_spent_cad']:,.2f} CAD")
    print(f"   Unspent Surplus:          ${allocation_results['unspent_budget_cad']:,.2f} CAD")
    print(f"   HEPA Shelters Deployed:   {allocation_results['itemized_expenditure']['hepa_shelters_count']} units")
    print(f"   IoT Sensor Nodes Mesh:    {allocation_results['itemized_expenditure']['iot_sensors_count']} nodes")
    print(f"   Beneficiaries Served:     {allocation_results['total_protected_population']:,} residents")
    print(f"   Vulnerability Impact:     {allocation_results['total_vulnerability_impact']:,.2f}")

    print("\n2. Itemized Deployed Zones:")
    for alloc in allocation_results["optimal_allocations"]:
        action_desc = []
        if alloc["deploy_hepa_shelter"]:
            action_desc.append("HEPA Shelter ($7.5k)")
        if alloc["deploy_iot_sensor"]:
            action_desc.append("IoT Kriging Sensor ($850)")
        print(f"   - {alloc['zone_id']:18s} (SVVI: {alloc['svvi_score']:.2f}, Pop: {alloc['population']:6,d}) -> {' + '.join(action_desc)}")

    # Assertions
    assert allocation_results["itemized_expenditure"]["total_spent_cad"] <= budget, "Expenditure must not exceed budget"
    assert allocation_results["itemized_expenditure"]["hepa_shelters_count"] >= 1, "Must deploy at least 1 shelter within $28k budget"
    assert allocation_results["itemized_expenditure"]["iot_sensors_count"] >= 1, "Must deploy IoT sensors for high SVVI areas"
    print("\n   [PASS] Integer Linear Programming Optimization: PASS")

    print("\n" + "=" * 75)
    print("[SUCCESS] ALL MUNICIPAL RESOURCE OPTIMIZER SANITY CHECKS PASSED")
    print("=" * 75)
