# HeatLens — Urban Climate Intelligence Platform
# BACKEND — AZURE OPENAI FUNCTION CALLING SERVICE
# File: backend/services/azure_openai_service.py
# =============================================================
# WHAT THIS DOES:
# Natural language interface for HeatLens.
# User types plain English/Hindi → GPT-4o understands intent →
# calls the right data function → returns ward data → maps update
#
# HOW TO USE:
# pip install openai azure-storage-blob fastapi uvicorn
# Set env vars: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT
# =============================================================

import os
import json
from openai import AzureOpenAI
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# ─── AZURE OPENAI CLIENT ─────────────────────────────────────
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-08-01-preview"
)

DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")

# ─── FUNCTION DEFINITIONS (Tool Calling) ─────────────────────
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_ward_heat_score",
            "description": "Get the heat vulnerability score and LST for a specific ward.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ward_name": {"type": "string", "description": "Name or ID of the ward"},
                    "date": {"type": "string", "description": "Month/year e.g. '2025-07'"}
                },
                "required": ["ward_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_hottest_wards",
            "description": "Get the top K most heat-vulnerable wards in a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name e.g. 'Delhi'"},
                    "k": {"type": "integer", "description": "Number of top wards to return"},
                    "date": {"type": "string", "description": "Month/year e.g. '2025-07'"}
                },
                "required": ["city", "k"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_wards",
            "description": "Compare heat vulnerability scores across multiple wards.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ward_list": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of ward names to compare"
                    }
                },
                "required": ["ward_list"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_cooling_center_recommendations",
            "description": "Recommend optimal locations for cooling centers based on heat vulnerability.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                    "num_centers": {"type": "integer", "description": "How many cooling centers to plan"}
                },
                "required": ["city", "num_centers"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are HeatLens AI, an expert climate intelligence assistant.
You help urban planners, municipal officials, and researchers understand 
heat vulnerability across Delhi NCR wards using satellite data.

You have access to ward-level Land Surface Temperature (LST) derived from
NASA Landsat-8/9 TIRS satellites and Sentinel-2 MSI vegetation data.

When answering:
- Always call the appropriate tool to get real data
- Express temperatures in Celsius
- Mention risk tiers (HIGH/MEDIUM/LOW) clearly
- Suggest actionable next steps (cooling centers, tree planting, etc.)
- Be concise but evidence-based
"""

# ─── FASTAPI ENDPOINT ─────────────────────────────────────────
app = FastAPI(title="HeatLens Azure OpenAI Service")

class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Natural language chat interface for HeatLens.
    Streams GPT-4o responses with function calling.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(request.conversation_history)
    messages.append({"role": "user", "content": request.message})

    # Call Azure OpenAI with function tools
    response = client.chat.completions.create(
        model=DEPLOYMENT,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
        stream=False
    )

    message = response.choices[0].message

    # Handle tool calls
    if message.tool_calls:
        tool_results = []
        for tool_call in message.tool_calls:
            result = execute_tool(tool_call.function.name, tool_call.function.arguments)
            tool_results.append({
                "tool_call_id": tool_call.id,
                "function_name": tool_call.function.name,
                "result": result
            })

        # Get final response with tool results
        messages.append(message)
        for tr in tool_results:
            messages.append({
                "role": "tool",
                "tool_call_id": tr["tool_call_id"],
                "content": json.dumps(tr["result"])
            })

        final_response = client.chat.completions.create(
            model=DEPLOYMENT,
            messages=messages
        )
        answer = final_response.choices[0].message.content
        map_data = [tr["result"] for tr in tool_results]
    else:
        answer = message.content
        map_data = []

    return {"answer": answer, "map_data": map_data}


# ─── TOOL EXECUTION FUNCTIONS ─────────────────────────────────
def execute_tool(name: str, arguments: str) -> dict:
    args = json.loads(arguments)

    if name == "get_ward_heat_score":
        return get_ward_heat_score(args.get("ward_name"), args.get("date"))
    elif name == "get_top_hottest_wards":
        return get_top_hottest_wards(args.get("city"), args.get("k", 5), args.get("date"))
    elif name == "compare_wards":
        return compare_wards(args.get("ward_list", []))
    elif name == "get_cooling_center_recommendations":
        return get_cooling_center_recommendations(args.get("city"), args.get("num_centers", 5))
    return {"error": f"Unknown tool: {name}"}


# ─── DATA FUNCTIONS (connect to Azure Blob Storage in production) ─
def get_ward_heat_score(ward_name: str, date: str = None) -> dict:
    """TODO: Read from Azure Blob Storage ward_scores JSON."""
    # Mock data for development
    return {
        "ward": ward_name,
        "lst_celsius": 44.7,
        "ndvi": 0.12,
        "vulnerability_score": 0.81,
        "risk_tier": "HIGH",
        "date": date or "2025-07",
        "coordinates": {"lat": 28.6139, "lng": 77.2090}
    }

def get_top_hottest_wards(city: str, k: int, date: str = None) -> dict:
    """TODO: Query Azure Cosmos DB or Blob Storage for top-K wards."""
    mock_wards = [
        {"ward": f"Ward_{i}", "lst_celsius": 47 - i, "score": 0.9 - i*0.05,
         "risk_tier": "HIGH", "lat": 28.6 + i*0.01, "lng": 77.2 + i*0.01}
        for i in range(k)
    ]
    return {"city": city, "date": date or "2025-07", "top_wards": mock_wards}

def compare_wards(ward_list: list) -> dict:
    """TODO: Batch query from Azure Blob Storage."""
    comparison = [
        {"ward": w, "lst_celsius": 40 + hash(w) % 8,
         "score": round(0.5 + (hash(w) % 40) / 100, 2)}
        for w in ward_list
    ]
    return {"comparison": sorted(comparison, key=lambda x: x["score"], reverse=True)}

def get_cooling_center_recommendations(city: str, num_centers: int) -> dict:
    """Returns top N wards that need cooling centers most urgently."""
    top = get_top_hottest_wards(city, num_centers)
    return {
        "city": city,
        "recommended_locations": top["top_wards"],
        "reasoning": "Based on highest composite heat vulnerability score (LST + NDVI + AQI + Risk)"
    }


# ─── RUN LOCALLY ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # Test: curl -X POST http://localhost:8000/api/chat
    #       -H "Content-Type: application/json"
    #       -d '{"message": "Which 5 wards in Delhi need cooling centers?"}'
