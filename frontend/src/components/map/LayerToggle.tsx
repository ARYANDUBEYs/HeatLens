"use client";

import React from "react";
import { Flame, Thermometer, Leaf, Wind } from "lucide-react";
import { MapMetricLayer } from "@/types";

interface LayerToggleProps {
  activeLayer: MapMetricLayer;
  onLayerChange: (layer: MapMetricLayer) => void;
}

interface LayerOption {
  id: MapMetricLayer;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge: string;
}

const LAYERS: LayerOption[] = [
  {
    id: "priority",
    label: "Priority Index",
    shortLabel: "Priority",
    icon: Flame,
    badge: "AHP CR=0.023",
  },
  {
    id: "lst",
    label: "Surface Temp (LST)",
    shortLabel: "LST (°C)",
    icon: Thermometer,
    badge: "Band 10 @30m",
  },
  {
    id: "ndvi",
    label: "Canopy Cover (NDVI)",
    shortLabel: "NDVI",
    icon: Leaf,
    badge: "Sentinel @10m",
  },
  {
    id: "aqi",
    label: "Air Quality (AQI)",
    shortLabel: "AQI",
    icon: Wind,
    badge: "CPCB PM2.5",
  },
];

export function LayerToggle({ activeLayer, onLayerChange }: LayerToggleProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-white/95 backdrop-blur-md p-1 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-1 select-none">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider px-1.5 hidden 2xl:inline">
        Layer:
      </span>
      {LAYERS.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayer === layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => onLayerChange(layer.id)}
            title={`${layer.label} — ${layer.badge}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-azure-soft text-azure-primary border border-sky-200 shadow-xs"
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary border border-transparent"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 shrink-0 ${
                isActive ? "text-azure-primary" : "text-text-secondary"
              }`}
            />
            <span className="hidden 2xl:inline">{layer.label}</span>
            <span className="2xl:hidden">{layer.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
