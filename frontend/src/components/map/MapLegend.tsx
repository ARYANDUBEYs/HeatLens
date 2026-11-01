"use client";

import React from "react";
import { Satellite, Info } from "lucide-react";
import { MapMetricLayer } from "@/types";

interface MapLegendProps {
  activeLayer: MapMetricLayer;
}

export function MapLegend({ activeLayer }: MapLegendProps) {
  const getLegendDetails = () => {
    switch (activeLayer) {
      case "priority":
        return {
          title: "Composite AHP Vulnerability Scale",
          sub: "0.35(LST) + 0.25(1-NDVI) + 0.20(AQI) + 0.20(Risk)",
          gradient: "linear-gradient(to right, #34D399 0%, #FBBF24 40%, #FB923C 70%, #F43F5E 100%)",
          stops: [
            { label: "0.0 Low", color: "#34D399" },
            { label: "0.40 Mod", color: "#FBBF24" },
            { label: "0.66 High", color: "#FB923C" },
            { label: "1.0 Critical", color: "#F43F5E" },
          ],
        };

      case "lst":
        return {
          title: "Land Surface Temperature (LST)",
          sub: "Planck's Law Radiometric Retrieval (Band 10 @ 30m)",
          gradient: "linear-gradient(to right, #FEF08A 0%, #FBBF24 35%, #FB923C 65%, #E11D48 100%)",
          stops: [
            { label: "38.5°C", color: "#FEF08A" },
            { label: "42.0°C", color: "#FBBF24" },
            { label: "45.5°C", color: "#FB923C" },
            { label: "48.8°C+", color: "#E11D48" },
          ],
        };

      case "ndvi":
        return {
          title: "Canopy Cover & Green Space (NDVI)",
          sub: "Sentinel-2 MSI Near-Infrared Reflectance (10m Resolution)",
          gradient: "linear-gradient(to right, #E4E4E7 0%, #FDE047 30%, #4ADE80 70%, #059669 100%)",
          stops: [
            { label: "0.06 Concrete", color: "#E4E4E7" },
            { label: "0.15 Sparse", color: "#FDE047" },
            { label: "0.30 Moderate", color: "#4ADE80" },
            { label: "0.45+ Canopy", color: "#059669" },
          ],
        };

      case "aqi":
        return {
          title: "PM2.5 Air Quality Index (AQI)",
          sub: "CPCB Ground Sensors Fused with Atmospheric Inversion",
          gradient: "linear-gradient(to right, #FDE047 0%, #F97316 45%, #E11D48 75%, #881337 100%)",
          stops: [
            { label: "200 Mod", color: "#FDE047" },
            { label: "280 Poor", color: "#F97316" },
            { label: "350 V.Poor", color: "#E11D48" },
            { label: "420+ Severe", color: "#881337" },
          ],
        };
    }
  };

  const details = getLegendDetails();

  return (
    <div className="rounded-xl border border-border bg-surface-white/95 backdrop-blur-md p-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)] z-[1000] select-none max-w-[320px] w-full text-text-primary">
      {/* Title & Formula Subtitle */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs font-bold text-text-primary">
          <span>{details.title}</span>
          <Info className="h-3.5 w-3.5 text-text-secondary" />
        </div>
        <p className="text-[10px] text-text-secondary font-mono truncate mt-0.5" title={details.sub}>
          {details.sub}
        </p>
      </div>

      {/* Gradient Color Bar */}
      <div
        className="h-2.5 w-full rounded-full shadow-inner border border-slate-200/60"
        style={{ background: details.gradient }}
      />

      {/* Numerical Scale Labels */}
      <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary mt-1.5 font-medium">
        {details.stops.map((stop, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: stop.color }}
            />
            {stop.label}
          </span>
        ))}
      </div>

      {/* Satellite Source Attribution Footer */}
      <div className="mt-2.5 pt-1.5 border-t border-border flex items-center justify-between text-[9px] text-text-secondary">
        <span className="flex items-center gap-1">
          <Satellite className="h-3 w-3 text-azure-primary" />
          <span>Landsat-9 Band 10 / Sentinel-2 MSI</span>
        </span>
        <span className="font-mono text-emerald-600 font-semibold">10m-30m Res</span>
      </div>
    </div>
  );
}
