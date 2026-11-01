"use client";

import React, { useState, useMemo } from "react";
import {
  Flame,
  Thermometer,
  Leaf,
  Filter,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { mockWards } from "@/data/mockWards";
import { getRiskColor } from "@/lib/formulas";
import { WardMetrics } from "@/types";
import { ChatInterface } from "@/components/ai/ChatInterface";

interface SidebarProps {
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
}

const ZONES = [
  "All Delhi NCR",
  "North-East Delhi",
  "Central Delhi",
  "South Delhi",
  "East Delhi",
  "North Delhi",
  "South-West Delhi",
];

export function Sidebar({ selectedWardId, onSelectWard }: SidebarProps) {
  const [selectedZone, setSelectedZone] = useState("All Delhi NCR");

  // Filter wards by zone and sort descending by AHP priorityScore
  const filteredWards = useMemo(() => {
    let list = [...mockWards];
    if (selectedZone !== "All Delhi NCR") {
      list = list.filter((w) => w.zone === selectedZone);
    }
    return list.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [selectedZone]);

  const topWards = useMemo(() => filteredWards.slice(0, 5), [filteredWards]);

  return (
    <aside className="w-[420px] shrink-0 border-r border-border bg-surface-white flex flex-col h-full overflow-y-auto select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          STICKY HEADER: District & Zone Quick Filter
          ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-border bg-surface-white/95 backdrop-blur-md p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Layers className="h-4 w-4 text-azure-primary" />
            <span>Climate Command &amp; Controls</span>
          </div>
          <span className="text-[10px] font-mono text-text-secondary bg-surface-muted px-2 py-0.5 rounded border border-border">
            Landsat-9 • Sentinel-2
          </span>
        </div>

        {/* Zone Filter Dropdown */}
        <div className="relative flex items-center">
          <Filter className="absolute left-2.5 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full text-xs font-medium text-text-primary bg-surface-muted hover:bg-slate-200/50 border border-border rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-azure-primary transition cursor-pointer appearance-none"
          >
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                Zone: {zone}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none text-text-secondary text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR SCROLLABLE CONTENT
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 space-y-4 flex-1">
        
        {/* SECTION 1: Regional Summary KPI Card */}
        <div className="rounded-xl border border-border bg-surface-white p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-azure-primary" />
              Regional Microclimate Telemetry
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Validated CR=0.023
            </span>
          </div>

          {/* Compact 3-Metric Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            
            {/* Metric 1 */}
            <div className="rounded-lg border border-border bg-surface-muted p-2 flex flex-col justify-between">
              <span className="text-[10px] font-medium text-text-secondary">Monitored</span>
              <div className="text-base font-extrabold font-mono text-text-primary my-0.5">
                250
              </div>
              <span className="text-[9px] text-text-secondary">Total Wards</span>
            </div>

            {/* Metric 2 */}
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-2 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-heat-critical">Heat Traps</span>
              <div className="text-base font-extrabold font-mono text-heat-critical my-0.5">
                18
              </div>
              <span className="text-[9px] text-rose-700 font-medium">Critical Risk</span>
            </div>

            {/* Metric 3 */}
            <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-2 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-heat-high">Thermal Delta</span>
              <div className="text-base font-extrabold font-mono text-heat-high my-0.5">
                +9.2°C
              </div>
              <span className="text-[9px] text-orange-700 font-medium">Localized Gap</span>
            </div>

          </div>

          {/* Subtitle */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-text-secondary font-mono">
            <span>Regional baseline: 39.4°C</span>
            <span className="text-text-primary font-bold">Peak surface: 48.6°C</span>
          </div>
        </div>

        {/* SECTION 2: Ranked Priority Ward List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Ranked Priority Wards</span>
              <span className="text-[10px] font-mono text-text-secondary font-normal">
                (Top {topWards.length})
              </span>
            </div>
            <span className="text-[10px] text-text-secondary">Sorted by AHP</span>
          </div>

          <div className="space-y-2">
            {topWards.map((ward, rank) => {
              const isSelected = ward.id === selectedWardId;
              const risk = getRiskColor(ward.riskLevel);

              return (
                <div
                  key={ward.id}
                  onClick={() => onSelectWard(ward.id)}
                  className={`rounded-xl border p-3 transition-all duration-150 cursor-pointer text-left relative ${
                    isSelected
                      ? "bg-azure-soft border-azure-primary shadow-sm ring-1 ring-azure-primary"
                      : "bg-surface-white hover:bg-surface-muted border-border shadow-xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-md bg-surface-muted text-text-secondary font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-border">
                        #{rank + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary leading-tight">
                          {ward.name}
                        </h4>
                        <span className="text-[10px] text-text-secondary font-medium">
                          {ward.zone}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${risk.badge}`}>
                      {ward.riskLevel}
                    </span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/70 text-[11px]">
                    <div className="flex items-center gap-1 text-text-secondary">
                      <Thermometer className="h-3 w-3 text-rose-500 shrink-0" />
                      <span className="font-mono font-bold text-text-primary">
                        {ward.lst.toFixed(1)}°C
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-text-secondary">
                      <Leaf className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="font-mono text-text-primary">
                        NDVI {ward.ndvi.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1 text-text-secondary font-mono">
                      <span>AHP:</span>
                      <span className="font-bold text-text-primary">
                        {(ward.priorityScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Indicator arrow */}
                  <ChevronRight
                    className={`absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 transition-transform ${
                      isSelected
                        ? "text-azure-primary translate-x-0.5"
                        : "text-slate-300 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Conversational Decision Agent */}
        <div className="space-y-1 pt-1">
          <ChatInterface
            onSelectWard={onSelectWard}
            selectedWardId={selectedWardId}
          />
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR FOOTER
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-border bg-surface-muted/60 flex items-center justify-between text-[11px] text-text-secondary shrink-0">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="h-3 w-3 text-azure-primary" />
          <span>Region: Central India (Mumbai)</span>
        </span>
        <span className="font-mono font-semibold text-azure-primary">
          Climate AI '26
        </span>
      </div>

    </aside>
  );
}
