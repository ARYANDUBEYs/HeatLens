import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import { mockWards, getMockWardById } from "@/data/mockWards";
import { WardMetrics } from "@/types";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// AZURE OPENAI TOOL DEFINITIONS
// ─────────────────────────────────────────────────────────────
const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_top_k_vulnerable_wards",
      description:
        "Retrieve the top K most heat-vulnerable municipal wards in Delhi NCR, filterable by zone and sort criteria.",
      parameters: {
        type: "object",
        properties: {
          k: {
            type: "integer",
            description: "Number of top wards to return (e.g., 3, 5)",
            default: 5,
          },
          zone: {
            type: "string",
            description:
              "Optional district zone filter (e.g., 'East Delhi', 'North-East Delhi', 'South Delhi')",
          },
          sort_by: {
            type: "string",
            enum: ["priority_score", "lst", "canopy_deficit"],
            description:
              "Sorting criteria: composite AHP priority score, peak radiometric LST, or lowest NDVI canopy cover",
            default: "priority_score",
          },
        },
        required: ["k"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_ward_recommendations",
      description:
        "Retrieve targeted municipal action directives and microclimate telemetry for a specific ward by ID or name.",
      parameters: {
        type: "object",
        properties: {
          ward_id: {
            type: "string",
            description:
              "The identifier or name of the ward (e.g., 'DEL-001', 'Seelampur', 'Okhla Phase 1')",
          },
        },
        required: ["ward_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_wards",
      description:
        "Compare thermal disparity, vegetation deficit, and vulnerability between two or more municipal wards.",
      parameters: {
        type: "object",
        properties: {
          ward_ids: {
            type: "array",
            items: { type: "string" },
            description: "List of ward IDs or names to contrast",
          },
        },
        required: ["ward_ids"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are the HeatLens Climate Resilience Decision Agent, an autonomous enterprise environmental intelligence system powered by Microsoft Azure for the Microsoft Imagine Cup 2026 (Earth Track).

You advise municipal authorities, climate researchers, and emergency response teams across Delhi NCR.
Your decisions are grounded in:
1. NASA Landsat-8/9 TIRS Band 10 radiometric Land Surface Temperature (LST, 30m resolution).
2. ESA Copernicus Sentinel-2 MSI Fractional Vegetation Cover (NDVI/FVC, 10m resolution).
3. Saaty's Analytic Hierarchy Process (AHP) composite scoring (Consistency Ratio CR = 0.023).

Guidelines:
- Seamlessly understand and converse in both English and Hindi (हिन्दी).
- Ground all advice strictly in empirical telemetry.
- When answering queries about hotspots, cooling centers, or vegetation, always invoke the appropriate function tool.
- Provide structured, professional, and actionable policy directives.`;

// Tool Execution Helpers
function executeTool(name: string, args: Record<string, any>) {
  if (name === "get_top_k_vulnerable_wards") {
    const k = Number(args.k || 5);
    const zone = args.zone;
    const sortBy = args.sort_by || "priority_score";

    let list = [...mockWards];
    if (zone && zone !== "All Delhi NCR") {
      list = list.filter((w) => w.zone.toLowerCase().includes(zone.toLowerCase()));
    }

    if (sortBy === "lst") {
      list.sort((a, b) => b.lst - a.lst);
    } else if (sortBy === "canopy_deficit") {
      list.sort((a, b) => a.ndvi - b.ndvi);
    } else {
      list.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    const sliced = list.slice(0, k);
    return {
      totalFound: list.length,
      returnedCount: sliced.length,
      wards: sliced.map((w) => ({
        id: w.id,
        name: w.name,
        zone: w.zone,
        lst: `${w.lst}°C`,
        ndvi: w.ndvi,
        aqi: w.aqi,
        priorityScore: `${(w.priorityScore * 100).toFixed(1)}%`,
        riskLevel: w.riskLevel,
        recommendedActions: w.recommendedActions,
      })),
      targetWardIds: sliced.map((w) => w.id),
    };
  }

  if (name === "get_ward_recommendations") {
    const query = String(args.ward_id || "").toLowerCase();
    const ward = mockWards.find(
      (w) => w.id.toLowerCase() === query || w.name.toLowerCase().includes(query)
    );
    if (!ward) return { error: `Ward '${args.ward_id}' not found.` };
    return {
      ward: {
        id: ward.id,
        name: ward.name,
        zone: ward.zone,
        lst: `${ward.lst}°C`,
        ndvi: ward.ndvi,
        fvc: ward.fvc,
        aqi: ward.aqi,
        priorityScore: `${(ward.priorityScore * 100).toFixed(1)}%`,
        riskLevel: ward.riskLevel,
        recommendedActions: ward.recommendedActions,
      },
      targetWardIds: [ward.id],
    };
  }

  if (name === "compare_wards") {
    const ids = (args.ward_ids || []).map((id: string) => id.toLowerCase());
    const matched = mockWards.filter((w) =>
      ids.some((id: string) => w.id.toLowerCase() === id || w.name.toLowerCase().includes(id))
    );
    return {
      comparison: matched.map((w) => ({
        id: w.id,
        name: w.name,
        lst: `${w.lst}°C`,
        ndvi: w.ndvi,
        priorityScore: `${(w.priorityScore * 100).toFixed(1)}%`,
        riskLevel: w.riskLevel,
      })),
      targetWardIds: matched.map((w) => w.id),
    };
  }

  return { error: `Unknown tool '${name}'` };
}

// ─────────────────────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message string is required." }, { status: 400 });
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";

    // 1. Live Azure OpenAI with Function Calling
    if (endpoint && apiKey && !apiKey.startsWith("your_") && endpoint.includes("openai.azure.com")) {
      try {
        const client = new AzureOpenAI({
          endpoint,
          apiKey,
          apiVersion: "2024-08-01-preview",
        });

        const messages: any[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...conversationHistory.slice(-4),
          { role: "user", content: message },
        ];

        const initialResponse = await client.chat.completions.create({
          model: deploymentName,
          messages,
          tools: TOOLS,
          tool_choice: "auto",
        });

        const choice = initialResponse.choices[0];
        const responseMessage = choice.message;

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          const toolCall = responseMessage.tool_calls[0];
          if (toolCall.type === "function") {
            const fnName = toolCall.function.name;
            const fnArgs = JSON.parse(toolCall.function.arguments);
            const toolResult = executeTool(fnName, fnArgs);

            messages.push(responseMessage);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });

            const secondResponse = await client.chat.completions.create({
              model: deploymentName,
              messages,
            });

            return NextResponse.json({
              answer: secondResponse.choices[0].message.content,
              source: "Azure OpenAI Service (GPT-4o)",
              toolOutput: {
                toolName: fnName,
                params: fnArgs,
                targetWardIds: toolResult.targetWardIds || [],
                actionLabel: `Highlight Target Wards on Map`,
              },
            });
          }
        }

        return NextResponse.json({
          answer: responseMessage.content,
          source: "Azure OpenAI Service (GPT-4o)",
          toolOutput: null,
        });
      } catch (azureErr) {
        console.warn("[Azure OpenAI Live Fallback]:", azureErr);
      }
    }

    // 2. Intelligent Simulation Fallback (Offline / Pre-Credentials)
    const qLower = message.toLowerCase();

    // Hydration / East Delhi query
    if (qLower.includes("hydration") || qLower.includes("kiosk") || qLower.includes("east delhi")) {
      const toolRes = executeTool("get_top_k_vulnerable_wards", {
        k: 2,
        zone: "East Delhi",
        sort_by: "priority_score",
      });
      return NextResponse.json({
        answer:
          "### Recommended Hydration Kiosk Deployments — East & North-East Delhi\n\nDual-satellite thermal radiometry from Landsat-9 TIRS and Sentinel-2 confirms extreme surface heat concentrations requiring emergency transit hydration:\n\n1. **Seelampur (DEL-001)** — Surface LST: `48.6°C` | AQI: `415` (Critical Risk)\n   - *Rationale:* Dense informal market corridor with severe heat trap topography and zero shaded transit refuges.\n   - *Directives:* Deploy 3 mobile hydration kiosks along the GT Road junction.\n\n2. **Shahdara (DEL-004)** — Surface LST: `46.5°C` | NDVI: `0.11` (High Risk)\n   - *Rationale:* High pedestrian interchange volume at rail transit nodes.\n   - *Directives:* Deploy 2 evaporative misting kiosks with cold water dispensers.",
        source: "HeatLens Autonomous Decision Agent (Azure OpenAI Simulation)",
        toolOutput: {
          toolName: "get_top_k_vulnerable_wards",
          params: { zone: "East Delhi", k: 2, sort_by: "priority_score" },
          targetWardIds: ["DEL-001", "DEL-004"],
          actionLabel: "Highlight Seelampur & Shahdara on Map",
        },
      });
    }

    // Canopy deficit query
    if (qLower.includes("canopy") || qLower.includes("ndvi") || qLower.includes("deficit") || qLower.includes("tree")) {
      const toolRes = executeTool("get_top_k_vulnerable_wards", {
        k: 3,
        sort_by: "canopy_deficit",
      });
      return NextResponse.json({
        answer:
          "### Severe Canopy Deficit Zones (Sentinel-2 NDVI < 0.12)\n\nSpectral vegetation analysis reveals critical vegetative depletion across industrial and commercial corridors:\n\n- **Okhla Phase 1 (DEL-003)**: NDVI `0.06` | FVC: `2%` | LST: `48.8°C`\n  - Dense sheet-metal roofing with near-total canopy void.\n- **Seelampur (DEL-001)**: NDVI `0.07` | LST: `48.6°C`\n- **Chandni Chowk (DEL-002)**: NDVI `0.08` | LST: `47.8°C`\n\n**Intervention Protocol:** Fast-track cool roof membrane retrofitting and establish linear urban bioswale corridors.",
        source: "HeatLens Autonomous Decision Agent (Azure OpenAI Simulation)",
        toolOutput: {
          toolName: "get_top_k_vulnerable_wards",
          params: { sort_by: "canopy_deficit", k: 3 },
          targetWardIds: ["DEL-003", "DEL-001", "DEL-002"],
          actionLabel: "Highlight Severe Deficit Wards on Map",
        },
      });
    }

    // Hindi query
    if (
      message.includes("गर्मी") ||
      message.includes("दिल्ली") ||
      message.includes("क्षेत्र") ||
      message.includes("वार्ड") ||
      /[\u0900-\u097F]/.test(message)
    ) {
      return NextResponse.json({
        answer:
          "### उपग्रह थर्मल विश्लेषण रिपोर्ट (पूर्वी एवं मध्य दिल्ली)\n\nनासा Landsat-9 और Sentinel-2 उपग्रह डेटा के अनुसार, निम्नलिखित क्षेत्र सबसे गंभीर **हीट ट्रैप** के अंतर्गत आते हैं:\n\n1. **Seelampur (DEL-001)** — भू-सतह तापमान: `48.6°C` (अत्यधिक गंभीर)\n   - वनस्पति आवरण (NDVI): केवल `0.07` | AQI: `415`\n2. **Chandni Chowk (DEL-002)** — तापमान: `47.8°C`\n3. **Shahdara (DEL-004)** — तापमान: `46.5°C`\n\n**अनुशंसित तत्काल कार्रवाई:** दोपहर 12 से 4 बजे के दौरान आपातकालीन पेयजल केंद्र एवं कूलिंग शेल्टर स्थापित किए जाएं।",
        source: "HeatLens Autonomous Decision Agent (Azure OpenAI Simulation)",
        toolOutput: {
          toolName: "get_top_k_vulnerable_wards",
          params: { query: message, lang: "hi" },
          targetWardIds: ["DEL-001", "DEL-002"],
          actionLabel: "मानचित्र पर संवेदनशील वार्ड देखें (DEL-001)",
        },
      });
    }

    // General fallback
    return NextResponse.json({
      answer:
        "### HeatLens Telemetry Analysis\n\nQuery evaluated across 10 monitored Delhi NCR wards utilizing Saaty's Analytic Hierarchy Process (CR = 0.023):\n\n- **Peak Observed LST:** `48.8°C` (Okhla Phase 1)\n- **Minimum Observed LST:** `38.6°C` (Lodhi Estate & Chanakyapuri)\n- **Localized Thermal Delta:** `+10.2°C` microclimate gap.\n\nRecommended action: Deploy mobile misting stations and high-albedo cool roof coatings to wards exceeding the 46°C threshold.",
      source: "HeatLens Autonomous Decision Agent (Azure OpenAI Simulation)",
      toolOutput: {
        toolName: "evaluate_general_heat_metrics",
        params: { query: message },
        targetWardIds: ["DEL-001"],
        actionLabel: "Highlight High Priority Wards on Map",
      },
    });
  } catch (err: any) {
    console.error("[API /api/chat error]:", err);
    return NextResponse.json(
      { error: "Internal server error processing decision query." },
      { status: 500 }
    );
  }
}
