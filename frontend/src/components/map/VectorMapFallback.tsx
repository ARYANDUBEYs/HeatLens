"use client";

import React, { useState } from "react";
import { MapMetricLayer, WardMetrics } from "@/types";
import { delhiWardFeatureCollection } from "@/data/delhiGeoJson";
import { getRiskColor } from "@/lib/formulas";
import { Sparkles, Info } from "lucide-react";

interface VectorMapFallbackProps {
  activeLayer: MapMetricLayer;
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
}

export function VectorMapFallback({
  activeLayer,
  selectedWardId,
  onSelectWard,
}: VectorMapFallbackProps) {
  const [hoveredWard, setHoveredWard] = useState<WardMetrics | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Bounding box for Delhi NCR municipal ward extents
  const minLng = 76.95;
  const maxLng = 77.34;
  const minLat = 28.50;
  const maxLat = 28.74;

  const width = 900;
  const height = 650;

  const project = (lng: number, lat: number): [number, number] => {
    const x = ((lng - minLng) / (maxLng - minLng)) * (width - 140) + 70;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * (height - 120) + 60;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  };

  const getMetricFillColor = (props: WardMetrics): string => {
    if (activeLayer === "priority") {
      return getRiskColor(props.riskLevel).fill;
    }
    if (activeLayer === "lst") {
      const lst = props.lst;
      const ratio = Math.max(0, Math.min(1, (lst - 38.0) / 10.8));
      if (ratio > 0.75) return "#E11D48";
      if (ratio > 0.50) return "#FB923C";
      if (ratio > 0.25) return "#FBBF24";
      return "#FEF08A";
    }
    if (activeLayer === "ndvi") {
      const ndvi = props.ndvi;
      const ratio = Math.max(0, Math.min(1, (ndvi - 0.06) / 0.36));
      if (ratio > 0.75) return "#059669";
      if (ratio > 0.45) return "#4ADE80";
      if (ratio > 0.20) return "#FDE047";
      return "#E4E4E7";
    }
    if (activeLayer === "aqi") {
      const aqi = props.aqi;
      const ratio = Math.max(0, Math.min(1, (aqi - 200) / 220));
      if (ratio > 0.80) return "#881337";
      if (ratio > 0.55) return "#E11D48";
      if (ratio > 0.30) return "#F97316";
      return "#FDE047";
    }
    return "#0284C7";
  };

  const getActiveMetricDisplay = (props: WardMetrics) => {
    switch (activeLayer) {
      case "priority":
        return `AHP Priority: ${(props.priorityScore * 100).toFixed(1)}%`;
      case "lst":
        return `Radiometric LST: ${props.lst.toFixed(1)}°C`;
      case "ndvi":
        return `Vegetation NDVI: ${props.ndvi.toFixed(2)}`;
      case "aqi":
        return `PM2.5 AQI: ${props.aqi}`;
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-canvas overflow-hidden select-none p-4"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Background Decorative Geospatial Grid */}
      <svg
        className="w-full h-full max-h-[750px] max-w-[1000px] drop-shadow-sm transition-all"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.75" strokeDasharray="3 3" />
          </pattern>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={width} height={height} fill="url(#centerGlow)" rx="16" />
        <rect width={width} height={height} fill="url(#grid-pattern)" rx="16" />

        {/* Yamuna River Stylized Geometry */}
        <path
          d="M 520,30 Q 560,180 500,320 T 580,550 T 610,630"
          fill="none"
          stroke="#BAE6FD"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.8"
        />
        <text x="560" y="340" fill="#0284C7" fontSize="11" fontWeight="600" opacity="0.6" letterSpacing="2">
          YAMUNA RIVER
        </text>

        {/* Municipal Ward Polygons */}
        {delhiWardFeatureCollection.features.map((feature) => {
          const props = feature.properties as WardMetrics;
          const isSelected = props.id === selectedWardId;
          const isHovered = hoveredWard?.id === props.id;
          const ring = feature.geometry.coordinates[0];

          const pathD =
            ring
              .map(([lng, lat], idx) => {
                const [x, y] = project(lng, lat);
                return `${idx === 0 ? "M" : "L"} ${x},${y}`;
              })
              .join(" ") + " Z";

          const [centerX, centerY] = project(
            props.centerCoordinates[1],
            props.centerCoordinates[0]
          );

          const fillColor = getMetricFillColor(props);

          return (
            <g
              key={props.id}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectWard(props.id)}
              onMouseEnter={() => setHoveredWard(props)}
              onMouseLeave={() => setHoveredWard(null)}
            >
              <path
                d={pathD}
                fill={fillColor}
                fillOpacity={isSelected ? 0.85 : isHovered ? 0.70 : 0.42}
                stroke={isSelected ? "#0284C7" : isHovered ? "#0284C7" : "#94A3B8"}
                strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                strokeDasharray={isSelected ? undefined : "3 3"}
                className="transition-all duration-150"
              />

              {/* Center Coordinate Pin & Label */}
              <circle
                cx={centerX}
                cy={centerY}
                r={isSelected ? 6 : 4}
                fill={isSelected ? "#0284C7" : "#0F172A"}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={centerX}
                y={centerY - 10}
                textAnchor="middle"
                fill="#0F172A"
                fontSize={isSelected ? "12" : "10"}
                fontWeight={isSelected ? "750" : "600"}
                className="pointer-events-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
              >
                {props.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredWard && (
        <div
          className="absolute z-[1100] pointer-events-none rounded-xl border border-border bg-surface-white/98 backdrop-blur-md p-3 shadow-xl transition-all"
          style={{
            left: `${Math.min(mousePos.x + 15, width - 200)}px`,
            top: `${Math.max(mousePos.y - 70, 20)}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-slate-900 text-xs">{hoveredWard.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                getRiskColor(hoveredWard.riskLevel).badge
              }`}
            >
              {hoveredWard.riskLevel}
            </span>
          </div>
          <div className="text-[11px] font-mono text-azure-primary font-semibold">
            {getActiveMetricDisplay(hoveredWard)}
          </div>
          <div className="text-[10px] text-text-secondary mt-0.5">
            {hoveredWard.zone} • Click to open telemetry
          </div>
        </div>
      )}
    </div>
  );
}
