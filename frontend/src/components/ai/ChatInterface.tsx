"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  MapPin,
  Loader2,
  RefreshCw,
  Cpu,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { SuggestionPills } from "./SuggestionPills";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolOutput?: {
    toolName: string;
    params: Record<string, unknown>;
    targetWardIds: string[];
    actionLabel: string;
  };
  hindi?: boolean;
}

interface ChatInterfaceProps {
  onSelectWard: (wardId: string) => void;
  selectedWardId?: string | null;
}

export function ChatInterface({ onSelectWard }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Welcome to the **HeatLens Decision Agent** (Azure OpenAI GPT-4o).\n\nI monitor street-level thermal equity across Delhi NCR using fused Landsat-9 TIRS Band 10 and Sentinel-2 MSI telemetry. Ask any question in English or हिन्दी to deploy emergency municipal interventions.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  // Simulated Azure OpenAI Function Calling Engine
  const processQuery = (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q || isAnalyzing) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsAnalyzing(true);

    // Simulate Azure OpenAI latency and tool execution
    setTimeout(() => {
      const qLower = q.toLowerCase();
      let assistantResponse: Message;

      // Scenario 1: Hydration Kiosks / East Delhi
      if (qLower.includes("hydration") || qLower.includes("kiosk") || qLower.includes("east delhi")) {
        assistantResponse = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content:
            "### Recommended Hydration Kiosk Deployments — East & North-East Delhi\n\nBased on dual-satellite thermal radiometry and street pedestrian density, the following two wards exhibit the most urgent thermal distress:\n\n1. **Seelampur (DEL-001)** — Surface LST: `48.6°C` | AQI: `415` (Critical)\n   - *Rationale:* Dense informal market corridor with severe heat trap topography and zero shaded transit refuges.\n   - *Action:* Deploy 3 mobile hydration tankers along the GT Road axis.\n\n2. **Shahdara (DEL-004)** — Surface LST: `46.5°C` | NDVI: `0.11` (High Risk)\n   - *Rationale:* Major rail and bus interchange with unshaded waiting avenues.\n   - *Action:* Establish 2 evaporative misting kiosks at transit interchanges.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          toolOutput: {
            toolName: "deploy_emergency_hydration_kiosks",
            params: { zone: "East & North-East Delhi", count: 2, priorityThreshold: 0.75 },
            targetWardIds: ["DEL-001", "DEL-004"],
            actionLabel: "Highlight Seelampur & Shahdara on Map",
          },
        };
      }
      // Scenario 2: Canopy Deficit (NDVI < 0.12)
      else if (qLower.includes("canopy") || qLower.includes("ndvi") || qLower.includes("deficit") || qLower.includes("tree")) {
        assistantResponse = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content:
            "### Severe Canopy Deficit Zones (Sentinel-2 NDVI < 0.12)\n\nSpectral reflectance analysis identifies critical vegetative depletion in the following industrial and high-density sectors:\n\n- **Okhla Phase 1 (DEL-003)**: NDVI `0.06` | FVC: `2%` | LST: `48.8°C`\n  - High-density metal roof fabrication zone with zero continuous tree canopy.\n- **Seelampur (DEL-001)**: NDVI `0.07` | LST: `48.6°C`\n- **Chandni Chowk (DEL-002)**: NDVI `0.08` | LST: `47.8°C`\n\n**Strategic Intervention:** Fast-track cool roof membrane retrofits and establish linear bioswale urban forestry corridors.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          toolOutput: {
            toolName: "query_canopy_deficit_wards",
            params: { ndviMax: 0.12, city: "Delhi NCR" },
            targetWardIds: ["DEL-003", "DEL-001", "DEL-002"],
            actionLabel: "Highlight Severe Deficit Wards on Map",
          },
        };
      }
      // Scenario 3: Hindi Query
      else if (
        q.includes("गर्मी") ||
        q.includes("दिल्ली") ||
        q.includes("क्षेत्र") ||
        q.includes("वार्ड") ||
        /[\u0900-\u097F]/.test(q)
      ) {
        assistantResponse = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          hindi: true,
          content:
            "### उपग्रह थर्मल विश्लेषण रिपोर्ट (पूर्वी एवं मध्य दिल्ली)\n\nनासा Landsat-9 और Sentinel-2 उपग्रह डेटा के अनुसार, निम्नलिखित क्षेत्र सबसे गंभीर **हीट ट्रैप** के अंतर्गत आते हैं:\n\n1. **Seelampur (DEL-001)** — भू-सतह तापमान: `48.6°C` (अत्यधिक गंभीर)\n   - वनस्पति आवरण (NDVI): केवल `0.07` | AQI: `415`\n2. **Chandni Chowk (DEL-002)** — तापमान: `47.8°C`\n3. **Shahdara (DEL-004)** — तापमान: `46.5°C`\n\n**अनुशंसित तत्काल कार्रवाई:** दोपहर 12 से 4 बजे के दौरान आपातकालीन पेयजल केंद्र एवं कूलिंग शेल्टर स्थापित किए जाएं।",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          toolOutput: {
            toolName: "get_hottest_wards_hindi",
            params: { region: "East & Central Delhi" },
            targetWardIds: ["DEL-001", "DEL-002"],
            actionLabel: "मानचित्र पर संवेदनशील वार्ड देखें (DEL-001)",
          },
        };
      }
      // Scenario 4: General or Specific Ward Query
      else {
        assistantResponse = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content:
            `### Microclimate Diagnostics & Policy Guidance\n\nQuery processed against 10 monitored Delhi NCR wards utilizing our Analytic Hierarchy Process (AHP Saaty CR = 0.023):\n\n- **Maximum Observed LST:** \`48.8°C\` (Okhla Phase 1)\n- **Minimum Observed LST:** \`38.6°C\` (Lodhi Estate & Chanakyapuri)\n- **Thermal Disparity:** \`+10.2°C\` localized gap between concrete traps and urban forest canopies.\n\nRecommended municipal action: Focus high-albedo coatings and mobile misting stations in wards exceeding **46°C** surface threshold.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          toolOutput: {
            toolName: "evaluate_general_heat_metrics",
            params: { query: q },
            targetWardIds: ["DEL-001"],
            actionLabel: "Highlight High Priority Wards on Map",
          },
        };
      }

      setMessages((prev) => [...prev, assistantResponse]);
      setIsAnalyzing(false);
    }, 700);
  };

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    // Simulate voice speech-to-text input after 1.5s
    setTimeout(() => {
      setInput("Show top 3 wards for hydration kiosks in East Delhi");
      setIsListening(false);
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-white shadow-sm flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="p-3 border-b border-border bg-surface-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-azure-soft text-azure-primary flex items-center justify-center border border-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-primary">
                Azure OpenAI Decision Agent
              </span>
              <span className="font-mono text-[9px] bg-azure-soft text-azure-primary px-1.5 py-0.2 rounded font-semibold border border-sky-200">
                GPT-4o
              </span>
            </div>
            <p className="text-[10px] text-text-secondary">
              Natural Language Geospatial Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active</span>
          </div>

          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            title="Reset Conversation"
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-muted transition"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Suggestion Pills */}
      <div className="px-3 pt-2 pb-1 border-b border-border/60 bg-surface-white">
        <SuggestionPills
          onSelectQuery={(q) => processQuery(q)}
          disabled={isAnalyzing}
        />
      </div>

      {/* Messages Scroll Area */}
      <div className="p-3 max-h-[360px] min-h-[180px] overflow-y-auto space-y-3 text-xs bg-canvas/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="h-6 w-6 rounded-md bg-azure-primary text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-xl p-3 shadow-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-azure-soft text-text-primary border border-sky-200 rounded-tr-xs"
                  : "bg-surface-white text-text-primary border border-border rounded-tl-xs"
              }`}
            >
              {/* Formatted Text */}
              <div className="whitespace-pre-wrap font-sans text-xs space-y-1">
                {m.content.split("\n\n").map((paragraph, pIdx) => {
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h4
                        key={pIdx}
                        className="font-bold text-xs text-text-primary text-azure-primary mt-1 mb-0.5 flex items-center gap-1"
                      >
                        {paragraph.replace("### ", "")}
                      </h4>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-text-primary text-[11px] leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Simulated Tool Execution Card */}
              {m.toolOutput && (
                <div className="mt-2.5 pt-2 border-t border-border space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary bg-surface-muted px-2 py-1 rounded border border-border">
                    <Cpu className="h-3 w-3 text-azure-primary shrink-0" />
                    <span className="truncate">
                      Tool: {m.toolOutput.toolName}()
                    </span>
                  </div>

                  {/* Interactive Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (m.toolOutput?.targetWardIds && m.toolOutput.targetWardIds.length > 0) {
                        onSelectWard(m.toolOutput.targetWardIds[0]);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-azure-primary hover:bg-sky-700 text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{m.toolOutput.actionLabel}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 ml-0.5" />
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-1.5 text-[9px] text-text-secondary font-mono text-right">
                {m.timestamp}
              </div>
            </div>

            {m.role === "user" && (
              <div className="h-6 w-6 rounded-md bg-surface-muted border border-border text-text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking Indicator */}
        {isAnalyzing && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-white border border-border text-xs text-text-secondary shadow-xs">
            <Loader2 className="h-4 w-4 text-azure-primary animate-spin" />
            <span className="text-[11px] font-medium text-text-primary">
              Analyzing satellite telemetry &amp; ward vectors...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          processQuery(input);
        }}
        className="p-2.5 border-t border-border bg-surface-white flex items-center gap-1.5"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAnalyzing}
            placeholder={
              isListening
                ? "Listening... speak now"
                : "Ask in English or हिन्दी (e.g., 'Deploy cooling centers in South Delhi')..."
            }
            className={`w-full text-xs text-text-primary bg-surface-muted rounded-lg pl-3 pr-8 py-2 outline-none border transition-all placeholder:text-text-secondary/70 ${
              isListening
                ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/50"
                : "border-border focus:border-azure-primary focus:bg-surface-white"
            }`}
          />
          <button
            type="button"
            onClick={handleMicClick}
            title={isListening ? "Listening (Azure Speech)" : "Simulate Azure Speech-to-Text"}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition ${
              isListening
                ? "text-rose-600 animate-pulse"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isAnalyzing}
          className="h-8 w-8 rounded-lg bg-azure-primary hover:bg-sky-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

    </div>
  );
}
