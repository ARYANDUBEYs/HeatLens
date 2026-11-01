"""
HeatLens - Microsoft Imagine Cup 2026
Unified Azure Backend & Geospatial AI API Gateway
File: backend/main.py
"""

import os
import json
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment configuration
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("HeatLensBackend")

# Initialize FastAPI application
app = FastAPI(
    title="HeatLens Geospatial AI API",
    description="Backend API for Microsoft Imagine Cup 2026 - Earth Track",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
GEOJSON_FILE = DATA_DIR / "delhi_ward_boundaries.geojson"
SCORES_FILE = DATA_DIR / "delhi_ward_scores.json"

# Helper to load data
def load_scores_data() -> Dict[str, Any]:
    if not SCORES_FILE.exists():
        raise HTTPException(status_code=500, detail="Ward scores database not generated.")
    with open(SCORES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_geojson_data() -> Dict[str, Any]:
    if not GEOJSON_FILE.exists():
        raise HTTPException(status_code=500, detail="Ward boundaries GeoJSON not found.")
    with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# Azure OpenAI Setup (optional live connection)
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY", "").strip()
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini").strip()
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview").strip()

azure_openai_client = None
if AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY and not AZURE_OPENAI_KEY.startswith("your_"):
    try:
        from openai import AzureOpenAI
        azure_openai_client = AzureOpenAI(
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
            api_version=AZURE_OPENAI_API_VERSION
        )
        logger.info("[HeatLens] Connected to Azure OpenAI at %s", AZURE_OPENAI_ENDPOINT)
    except Exception as e:
        logger.warning("[HeatLens] Could not initialize Azure OpenAI client: %s", e)
else:
    logger.info("[HeatLens] Azure OpenAI credentials not set; running in local intelligent simulation mode.")

# Tool definitions for Azure OpenAI
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_ward_heat_score",
            "description": "Retrieve satellite LST, NDVI, AQI, and composite vulnerability score for a specific ward.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ward_name": {"type": "string", "description": "Name or identifier of the ward (e.g., 'Chandni Chowk', 'Okhla')"}
                },
                "required": ["ward_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_hottest_wards",
            "description": "Get the top K wards experiencing the most severe heat vulnerability.",
            "parameters": {
                "type": "object",
                "properties": {
                    "k": {"type": "integer", "description": "Number of top wards to return, defaults to 5"}
                },
                "required": ["k"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_cooling_center_recommendations",
            "description": "Provide urgent recommendations on where to establish emergency municipal cooling shelters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "num_centers": {"type": "integer", "description": "Number of cooling centers needed"}
                },
                "required": ["num_centers"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_wards",
            "description": "Compare microclimate and vulnerability disparity between two or more wards.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ward_names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of ward names to compare"
                    }
                },
                "required": ["ward_names"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are HeatLens AI, an enterprise geospatial climate intelligence agent powered by Microsoft Azure.
You serve municipal commissioners, disaster response teams, and urban planners across Delhi NCR.
Your answers are grounded in radiometric Land Surface Temperature (LST) from Landsat-8/9 Band 10 and Sentinel-2 NDVI.

Guidelines:
1. Always base statements on computed data and mention risk tier (HIGH, MEDIUM, LOW).
2. Report temperatures in Celsius and point out the +8°C to +10°C thermal disparities between concrete industrial zones and vegetated ridges.
3. Suggest concrete actions: cooling centers, cool roofs, reflective pavements, and emergency water misters.
4. Keep responses structured, professional, and directly actionable.
"""

# Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

# Tool Execution Handlers
def execute_tool_call(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    scores_obj = load_scores_data()
    wards = scores_obj["wards"]

    if name == "get_ward_heat_score":
        query = args.get("ward_name", "").lower()
        matched = next((w for w in wards if query in w["ward_name"].lower() or query in w["ward_id"].lower()), None)
        if matched:
            return {"ward": matched}
        return {"error": f"Ward matching '{args.get('ward_name')}' not found."}

    elif name == "get_top_hottest_wards":
        k = int(args.get("k", 5))
        top_k = wards[:k]
        return {
            "city": scores_obj["city"],
            "date": scores_obj["date"],
            "top_wards": top_k
        }

    elif name == "get_cooling_center_recommendations":
        num = int(args.get("num_centers", 5))
        # Prioritize high risk wards with low existing cooling centers
        prioritized = sorted(wards, key=lambda x: (x["risk_tier"] != "HIGH", x["existing_cooling_centers"], -x["vulnerability_score"]))
        recommended = prioritized[:num]
        return {
            "city": scores_obj["city"],
            "recommended_interventions": [
                {
                    "ward_name": w["ward_name"],
                    "zone": w["zone"],
                    "lst_celsius": w["lst_celsius"],
                    "risk_tier": w["risk_tier"],
                    "existing_centers": w["existing_cooling_centers"],
                    "recommended_additional_centers": max(1, 3 - w["existing_cooling_centers"]),
                    "coordinates": w["coordinates"]
                }
                for w in recommended
            ],
            "reasoning": "Selected based on high Land Surface Temperature, low vegetative cooling (NDVI), dense vulnerable populations, and deficit of current cooling infrastructure."
        }

    elif name == "compare_wards":
        names = [n.lower() for n in args.get("ward_names", [])]
        found = [w for w in wards if any(n in w["ward_name"].lower() for n in names)]
        return {"comparison": found}

    return {"error": f"Unknown tool: {name}"}

# Fallback Simulation Engine
def simulated_chat_response(user_msg: str) -> Dict[str, Any]:
    msg_lower = user_msg.lower()
    scores_obj = load_scores_data()
    wards = scores_obj["wards"]

    # 1. Cooling center queries
    if "cooling center" in msg_lower or "shelter" in msg_lower or "emergency" in msg_lower:
        result = execute_tool_call("get_cooling_center_recommendations", {"num_centers": 5})
        recs = result["recommended_interventions"]
        answer = (
            f"### Municipal Cooling Center Action Plan — Delhi NCR\n\n"
            f"Based on radiometric analysis combining Landsat-8 TIRS Band 10 and Sentinel-2 NDVI, the following 5 wards have the most critical deficit of thermal relief infrastructure:\n\n"
        )
        for i, r in enumerate(recs, 1):
            answer += (
                f"{i}. **{r['ward_name']}** ({r['zone']})\n"
                f"   - **Surface Temp (LST):** `{r['lst_celsius']}°C` | **Risk Tier:** `{r['risk_tier']}`\n"
                f"   - **Existing Centers:** {r['existing_centers']} → **Urgent Need:** `+{r['recommended_additional_centers']} centers`\n"
            )
        answer += (
            f"\n> **Strategic Recommendation:** Deploy rapid-assembly air-conditioned misting stations near transport hubs and market avenues within 48 hours."
        )
        map_data = [{"top_wards": recs}]
        return {"answer": answer, "map_data": map_data, "source": "HeatLens Local Analytics"}

    # 2. Hottest / top wards query
    elif "hottest" in msg_lower or "top" in msg_lower or "worst" in msg_lower or "vulnerable" in msg_lower:
        result = execute_tool_call("get_top_hottest_wards", {"k": 5})
        top = result["top_wards"]
        answer = (
            f"### Top 5 Most Heat-Vulnerable Wards in Delhi NCR\n\n"
            f"Derived from Planck's Law inversion with Analytic Hierarchy Process (Saaty CR = 0.023):\n\n"
        )
        for i, w in enumerate(top, 1):
            answer += (
                f"{i}. **{w['ward_name']}** ({w['zone']})\n"
                f"   - **LST:** `{w['lst_celsius']}°C` | **NDVI:** `{w['ndvi']}` (Low vegetation)\n"
                f"   - **Vulnerability Score:** `{(w['vulnerability_score'] * 100):.1f}%` ({w['risk_tier']})\n"
            )
        answer += "\nNotice the extreme thermal delta of over **12°C** compared to forested zones like Hauz Khas / Ridge."
        map_data = [{"top_wards": top}]
        return {"answer": answer, "map_data": map_data, "source": "HeatLens Local Analytics"}

    # 3. Specific Ward Query
    matched_ward = None
    for w in wards:
        if w["ward_name"].lower() in msg_lower or w["ward_id"].lower() in msg_lower:
            matched_ward = w
            break

    if matched_ward:
        answer = (
            f"### Ward Heat Profile: {matched_ward['ward_name']} ({matched_ward['ward_id']})\n\n"
            f"- **Zone:** {matched_ward['zone']}\n"
            f"- **Land Surface Temperature (LST):** `{matched_ward['lst_celsius']}°C`\n"
            f"- **Vegetation Index (NDVI):** `{matched_ward['ndvi']}`\n"
            f"- **Air Quality Index (AQI):** `{matched_ward['aqi']}`\n"
            f"- **Population Density:** `{matched_ward['population_density']:,} people/km²`\n"
            f"- **Overall Vulnerability Score:** `{(matched_ward['vulnerability_score'] * 100):.1f}%` (**{matched_ward['risk_tier']}**)\n"
            f"- **Current Cooling Centers:** `{matched_ward['existing_cooling_centers']}`\n\n"
            f"**Recommended Action:** {'Urgent intervention required: establish municipal cooling shelter & high-albedo cool roofs.' if matched_ward['risk_tier'] == 'HIGH' else 'Maintain tree canopy and monitor seasonal thermal drift.'}"
        )
        map_data = [{"top_wards": [matched_ward]}]
        return {"answer": answer, "map_data": map_data, "source": "HeatLens Local Analytics"}

    # Default overview
    stats_overview = (
        f"### HeatLens Climate Intelligence Overview\n\n"
        f"I monitor 20 municipal wards across Delhi NCR using fused **Landsat-8/9 Band 10** thermal infrared and **Sentinel-2 MSI** reflectance.\n\n"
        f"- **Peak Observed LST:** `49.1°C` (Okhla Industrial Area)\n"
        f"- **Minimum Observed LST:** `36.9°C` (Vasant Kunj & Ridge)\n"
        f"- **Maximum Thermal Disparity:** `+12.2°C` microclimate gap\n\n"
        f"**Sample queries you can ask me:**\n"
        f"- *'Which 5 wards in Delhi need cooling centers?'*\n"
        f"- *'Show me the hottest wards in Delhi'* \n"
        f"- *'What is the heat score for Chandni Chowk?'*\n"
        f"- *'Compare Okhla and Hauz Khas'*"
    )
    return {"answer": stats_overview, "map_data": [], "source": "HeatLens Local Analytics"}


# ─── REST ENDPOINTS ──────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HeatLens Geospatial Backend",
        "azure_openai_configured": azure_openai_client is not None,
        "region": "Central India",
        "competition": "Microsoft Imagine Cup 2026",
        "track": "Earth (Environmental Sustainability & Climate AI)"
    }

@app.get("/api/stats")
def get_city_statistics():
    data = load_scores_data()
    wards = data["wards"]
    lsts = [w["lst_celsius"] for w in wards]
    ndvis = [w["ndvi"] for w in wards]
    scores = [w["vulnerability_score"] for w in wards]

    hottest = max(wards, key=lambda w: w["lst_celsius"])
    coolest = min(wards, key=lambda w: w["lst_celsius"])

    return {
        "city": data["city"],
        "date": data["date"],
        "total_wards": len(wards),
        "avg_lst_celsius": round(sum(lsts) / len(lsts), 1),
        "max_lst_celsius": max(lsts),
        "min_lst_celsius": min(lsts),
        "hottest_ward": {"name": hottest["ward_name"], "lst": hottest["lst_celsius"]},
        "coolest_ward": {"name": coolest["ward_name"], "lst": coolest["lst_celsius"]},
        "thermal_disparity_celsius": round(max(lsts) - min(lsts), 1),
        "avg_ndvi": round(sum(ndvis) / len(ndvis), 2),
        "risk_breakdown": {
            "high": data["high_risk_count"],
            "medium": data["medium_risk_count"],
            "low": data["low_risk_count"]
        }
    }

@app.get("/api/ward-boundaries")
def get_ward_boundaries():
    return load_geojson_data()

@app.get("/api/ward-scores")
def get_ward_scores(
    risk_tier: Optional[str] = Query(None, description="Filter by risk tier: HIGH, MEDIUM, LOW")
):
    data = load_scores_data()
    wards = data["wards"]
    if risk_tier:
        wards = [w for w in wards if w["risk_tier"].upper() == risk_tier.upper()]
    return {
        "city": data["city"],
        "date": data["date"],
        "total_results": len(wards),
        "wards": wards
    }

@app.get("/api/top-wards")
def get_top_wards(k: int = Query(5, ge=1, le=20)):
    data = load_scores_data()
    return {
        "city": data["city"],
        "date": data["date"],
        "top_wards": data["wards"][:k]
    }

@app.get("/api/cooling-centers")
def get_cooling_centers(num_centers: int = Query(5, ge=1, le=10)):
    return execute_tool_call("get_cooling_center_recommendations", {"num_centers": num_centers})

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Intelligent Conversational Interface for HeatLens.
    Uses Azure OpenAI GPT-4o with function calling when configured,
    or falls back automatically to local spatial inference.
    """
    if azure_openai_client:
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for msg in request.conversation_history[-6:]:
                messages.append({"role": msg.role, "content": msg.content})
            messages.append({"role": "user", "content": request.message})

            response = azure_openai_client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=messages,
                tools=OPENAI_TOOLS,
                tool_choice="auto"
            )

            msg = response.choices[0].message
            if msg.tool_calls:
                tool_results = []
                for tc in msg.tool_calls:
                    fn_name = tc.function.name
                    fn_args = json.loads(tc.function.arguments)
                    res = execute_tool_call(fn_name, fn_args)
                    tool_results.append({
                        "tool_call_id": tc.id,
                        "function_name": fn_name,
                        "result": res
                    })

                messages.append(msg)
                for tr in tool_results:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tr["tool_call_id"],
                        "content": json.dumps(tr["result"])
                    })

                follow_up = azure_openai_client.chat.completions.create(
                    model=AZURE_OPENAI_DEPLOYMENT,
                    messages=messages
                )
                answer = follow_up.choices[0].message.content
                map_data = [tr["result"] for tr in tool_results]
                return {"answer": answer, "map_data": map_data, "source": "Azure OpenAI Service (GPT-4o)"}
            else:
                return {"answer": msg.content, "map_data": [], "source": "Azure OpenAI Service (GPT-4o)"}
        except Exception as e:
            logger.error("[HeatLens] Azure OpenAI call encountered an error: %s. Using local engine fallback.", e)
            return simulated_chat_response(request.message)

    # Local fallback
    return simulated_chat_response(request.message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
