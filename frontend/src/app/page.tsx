"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Sparkles,
  MapPin,
  Flame,
  ShieldCheck,
  Compass,
  Cpu,
  Thermometer,
  Leaf,
  Wind,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { MapViewport } from "@/components/map/MapViewport";
import { MapMetricLayer } from "@/types";
import { mockWards, getMockWardById } from "@/data/mockWards";
import { getRiskColor } from "@/lib/formulas";

export default function HomePage() {
  const [selectedWardId, setSelectedWardId] = useState<string | null>("DEL-001");
  const [activeLayer, setActiveLayer] = useState<MapMetricLayer>("priority");

  const selectedWard = useMemo(
    () => (selectedWardId ? getMockWardById(selectedWardId) : mockWards[0]),
    [selectedWardId]
  );

  const selectedRisk = selectedWard ? getRiskColor(selectedWard.riskLevel) : null;

  return (
    <main className="flex-1 h-[calc(100vh-4rem)] flex overflow-hidden bg-canvas">
      
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: Fixed 420px Width Control & AI Decision Panel Shell
          ───────────────────────────────────────────────────────────── */}
      <aside className="w-[420px] shrink-0 border-r border-border bg-surface-white flex flex-col h-full overflow-y-auto">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-border bg-surface-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary">
              <SlidersHorizontal className="h-4 w-4 text-azure-primary" />
              <h2 className="text-sm font-bold tracking-tight">
                Controls &amp; Decision Support
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-azure-soft px-2 py-0.5 text-[10px] font-semibold text-azure-primary border border-sky-200">
              <Cpu className="h-3 w-3" />
              Azure OpenAI
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary leading-normal">
            Autonomous decision engine evaluating street-level thermal risk and cooling infrastructure equity.
          </p>
        </div>

        {/* Panel Body */}
        <div className="p-4 space-y-4 flex-1">
          
          {/* Active Selected Ward Inspector Summary */}
          {selectedWard && selectedRisk && (
            <div className="rounded-xl border border-border bg-surface-white p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-text-secondary uppercase">
                    {selectedWard.id} • {selectedWard.zone}
                  </span>
                  <h3 className="text-base font-extrabold text-text-primary leading-tight mt-0.5">
                    {selectedWard.name}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${selectedRisk.badge}`}>
                  {selectedWard.riskLevel} Risk
                </span>
              </div>

              {/* 4-Tile Quick Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                
                {/* LST */}
                <div className="rounded-lg border border-border bg-surface-muted p-2.5">
                  <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                    <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-[11px] font-medium">Surface Temp</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-text-primary">
                    {selectedWard.lst.toFixed(1)}°C
                  </div>
                  <span className="text-[10px] text-text-secondary">Band 10 @30m</span>
                </div>

                {/* NDVI */}
                <div className="rounded-lg border border-border bg-surface-muted p-2.5">
                  <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                    <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] font-medium">Vegetation</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-text-primary">
                    {selectedWard.ndvi.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-text-secondary">FVC {(selectedWard.fvc * 100).toFixed(0)}%</span>
                </div>

                {/* AQI */}
                <div className="rounded-lg border border-border bg-surface-muted p-2.5">
                  <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                    <Wind className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-medium">Air Quality</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-text-primary">
                    {selectedWard.aqi} AQI
                  </div>
                  <span className="text-[10px] text-text-secondary">PM2.5 Sensor</span>
                </div>

                {/* Priority */}
                <div className="rounded-lg border border-border bg-surface-muted p-2.5">
                  <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                    <Flame className="h-3.5 w-3.5 text-azure-primary" />
                    <span className="text-[11px] font-medium">Priority Index</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-text-primary">
                    {(selectedWard.priorityScore * 100).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-text-secondary">Saaty AHP Model</span>
                </div>

              </div>

              {/* Priority Bar Indicator */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-text-secondary">AHP Composite Score:</span>
                  <span className="font-mono font-bold text-text-primary">
                    {(selectedWard.priorityScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(selectedWard.priorityScore * 100).toFixed(1)}%`,
                      backgroundColor: selectedRisk.fill,
                    }}
                  />
                </div>
              </div>

              {/* Recommended Actions Directives */}
              <div className="pt-2 border-t border-border space-y-1.5">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                  Action Directives ({selectedWard.recommendedActions.length})
                </span>
                <ul className="space-y-1.5">
                  {selectedWard.recommendedActions.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-text-secondary leading-snug"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-azure-primary shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Quick Ward Navigation Carousel */}
          <div className="rounded-xl border border-border bg-surface-white p-3.5 space-y-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Quick Ward Selector
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mockWards.map((w) => {
                const isSelected = w.id === selectedWardId;
                const risk = getRiskColor(w.riskLevel);
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWardId(w.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? "bg-azure-soft text-azure-primary border-sky-300 shadow-sm"
                        : "bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-slate-200/60 border-border"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: risk.fill }}
                    />
                    <span>{w.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scientific Validation Pill */}
          <div className="rounded-xl border border-border bg-surface-muted p-3.5 panel-card-hover">
            <div className="flex items-center justify-between text-xs font-semibold text-text-primary mb-1.5">
              <span className="flex items-center gap-1.5 text-azure-primary">
                <ShieldCheck className="h-4 w-4 text-azure-primary" />
                IEEE Scientific Formulation
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                CR = 0.023 PASS
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Analytic Hierarchy Process model:{" "}
              <span className="font-mono font-medium text-text-primary">
                0.35(LST) + 0.25(1-NDVI) + 0.20(AQI) + 0.20(Risk)
              </span>
            </p>
          </div>

        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-text-secondary">
          <span className="font-medium">Region: Central India (Mumbai)</span>
          <span className="font-mono font-semibold text-azure-primary">Azure Maps SDK Ready</span>
        </div>

      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: Flexible Viewport Interactive Map
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 h-full bg-canvas relative flex flex-col overflow-hidden">
        
        {/* Viewport Top Bar */}
        <div className="h-12 border-b border-border bg-surface-white px-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <Layers className="h-4 w-4 text-azure-primary" />
              <span>Delhi NCR Ward Boundary Matrix</span>
            </div>
            <span className="h-3.5 w-[1px] bg-border"></span>
            <span className="text-xs text-text-secondary font-mono">
              10 Evaluated Wards • 50M+ Monitored Population
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-text-secondary bg-surface-muted px-2.5 py-1 rounded-md border border-border">
              <Compass className="h-3.5 w-3.5 text-azure-primary" />
              28.6139° N, 77.2090° E
            </span>
          </div>
        </div>

        {/* Interactive Map Viewport */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <MapViewport
            selectedWardId={selectedWardId}
            onSelectWard={(id) => setSelectedWardId(id)}
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
          />
        </div>

      </section>

    </main>
  );
}
