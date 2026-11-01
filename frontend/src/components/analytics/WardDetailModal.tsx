"use client";

import React, { useEffect } from "react";
import {
  X,
  Flame,
  Leaf,
  Wind,
  ShieldAlert,
  CheckCircle2,
  Compass,
  Users,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { WardMetrics } from "@/types";
import { getRiskColor } from "@/lib/formulas";
import { HistoricalChart } from "./HistoricalChart";

interface WardDetailModalProps {
  ward: WardMetrics | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAIAboutWard?: (ward: WardMetrics) => void;
}

export function WardDetailModal({
  ward,
  isOpen,
  onClose,
  onAskAIAboutWard,
}: WardDetailModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ward) return null;

  const risk = getRiskColor(ward.riskLevel);
  const baselineDelta = Number((ward.lst - 39.4).toFixed(1));

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      {/* Light Backdrop Blur */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Over Drawer Container (580px) */}
      <div className="relative w-full max-w-[580px] h-full bg-surface-white border-l border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-border bg-surface-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-text-secondary uppercase">
                {ward.id} • {ward.zone}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${risk.badge}`}
              >
                {ward.riskLevel} Risk
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              {ward.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-text-secondary font-mono pt-0.5">
              <span className="flex items-center gap-1">
                <Compass className="h-3 w-3 text-azure-primary" />
                {ward.centerCoordinates[0].toFixed(4)}° N, {ward.centerCoordinates[1].toFixed(4)}° E
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-sans">
                <Users className="h-3 w-3 text-slate-400" />
                ~28,500 residents / km²
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          
          {/* SECTION 1: 3-Column Environmental Telemetry Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Card A: Surface Temperature */}
            <div className="rounded-xl border border-border bg-surface-muted p-3 flex flex-col justify-between panel-card-hover">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-[11px] font-semibold">Surface Temp</span>
                <Flame className="h-4 w-4 text-heat-critical" />
              </div>
              <div className="my-1.5">
                <div className="text-xl font-extrabold font-mono text-heat-critical">
                  {ward.lst.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-rose-600 font-medium">
                  +{baselineDelta > 0 ? baselineDelta : 0}°C above baseline
                </div>
              </div>
              <span className="text-[9px] text-text-secondary font-mono">
                Landsat-9 Band 10
              </span>
            </div>

            {/* Card B: Canopy & Vegetation */}
            <div className="rounded-xl border border-border bg-surface-muted p-3 flex flex-col justify-between panel-card-hover">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-[11px] font-semibold">Canopy Cover</span>
                <Leaf className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="my-1.5">
                <div className="text-xl font-extrabold font-mono text-emerald-700">
                  {ward.fvc.toFixed(2)} FVC
                </div>
                <div className="text-[10px] text-emerald-600 font-medium truncate">
                  NDVI: {ward.ndvi.toFixed(2)} ({ward.ndvi < 0.15 ? "Severe Deficit" : "Moderate"})
                </div>
              </div>
              <span className="text-[9px] text-text-secondary font-mono">
                Sentinel-2 MSI
              </span>
            </div>

            {/* Card C: Air Quality */}
            <div className="rounded-xl border border-border bg-surface-muted p-3 flex flex-col justify-between panel-card-hover">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-[11px] font-semibold">Air Quality</span>
                <Wind className="h-4 w-4 text-amber-500" />
              </div>
              <div className="my-1.5">
                <div className="text-xl font-extrabold font-mono text-amber-600">
                  {ward.aqi} AQI
                </div>
                <div className="text-[10px] text-amber-700 font-medium">
                  {ward.aqi > 350 ? "Hazardous PM2.5" : "Very Poor Category"}
                </div>
              </div>
              <span className="text-[9px] text-text-secondary font-mono">
                CPCB Telemetry
              </span>
            </div>

          </div>

          {/* SECTION 2: Composite Vulnerability Index Breakdown */}
          <div className="rounded-xl border border-border bg-surface-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-azure-primary" />
                Analytic Hierarchy Process (AHP) Score
              </span>
              <span className="font-mono text-sm font-extrabold text-text-primary">
                {(ward.priorityScore * 100).toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(ward.priorityScore * 100).toFixed(1)}%`,
                  backgroundColor: risk.fill,
                }}
              />
            </div>

            {/* Mathematical Weights Row */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono text-text-secondary pt-1">
              <div className="p-1.5 rounded bg-surface-muted">
                <div className="font-bold text-rose-600">35% LST</div>
                <span>Thermal</span>
              </div>
              <div className="p-1.5 rounded bg-surface-muted">
                <div className="font-bold text-emerald-600">25% 1-NDVI</div>
                <span>Canopy</span>
              </div>
              <div className="p-1.5 rounded bg-surface-muted">
                <div className="font-bold text-amber-600">20% AQI</div>
                <span>Pollution</span>
              </div>
              <div className="p-1.5 rounded bg-surface-muted">
                <div className="font-bold text-azure-primary">20% Risk</div>
                <span>Social</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Historical 14-Day Thermal Trajectory Chart */}
          <div className="rounded-xl border border-border bg-surface-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-primary">
                  Historical 14-Day Radiometric Trajectory
                </h3>
                <p className="text-[10px] text-text-secondary">
                  Landsat-9 Observed Surface Temp vs. Climatological Baseline
                </p>
              </div>
              <span className="text-[10px] font-mono text-text-secondary bg-surface-muted px-2 py-0.5 rounded border border-border">
                Daily Mean LST
              </span>
            </div>

            <HistoricalChart data={ward.historicalLST} />
          </div>

          {/* SECTION 4: Recommended Interventions & Action Plan */}
          <div className="rounded-xl border border-border bg-surface-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-azure-primary" />
                Targeted Municipal Action Plan
              </h3>
              <span className="text-[10px] text-text-secondary font-mono">
                {ward.recommendedActions.length} Directives
              </span>
            </div>

            <div className="space-y-2">
              {ward.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-surface-muted/60 text-xs text-text-primary leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer CTA */}
        <div className="p-4 border-t border-border bg-surface-muted/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border bg-surface-white text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted transition"
          >
            Close Overview
          </button>

          {onAskAIAboutWard && (
            <button
              onClick={() => {
                onAskAIAboutWard(ward);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-azure-primary hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Query Azure OpenAI for {ward.name}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
