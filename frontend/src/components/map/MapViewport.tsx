"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Compass, RotateCcw, MapPin, Loader2 } from "lucide-react";
import { MapMetricLayer } from "@/types";
import { LayerToggle } from "./LayerToggle";
import { MapLegend } from "./MapLegend";

// Dynamically import LeafletMapInner with SSR disabled to prevent window/document errors
const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-muted/60 text-text-secondary space-y-3">
      <div className="h-10 w-10 rounded-xl bg-surface-white border border-border shadow-sm flex items-center justify-center text-azure-primary">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <span className="text-xs font-semibold text-text-primary block">
          Initializing CartoDB Positron Basemap &amp; GeoJSON Choropleth...
        </span>
        <span className="text-[10px] text-text-secondary font-mono">
          Landsat-9 Band 10 • Sentinel-2 Telemetry
        </span>
      </div>
    </div>
  ),
});

interface MapViewportProps {
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  activeLayer?: MapMetricLayer;
  onLayerChange?: (layer: MapMetricLayer) => void;
}

export function MapViewport({
  selectedWardId,
  onSelectWard,
  activeLayer: externalActiveLayer,
  onLayerChange: externalOnLayerChange,
}: MapViewportProps) {
  // Local state if not controlled from parent
  const [internalLayer, setInternalLayer] = useState<MapMetricLayer>("priority");
  const activeLayer = externalActiveLayer ?? internalLayer;
  const handleLayerChange = externalOnLayerChange ?? setInternalLayer;

  return (
    <div className="relative w-full h-full overflow-hidden bg-canvas flex flex-col select-none">
      
      {/* Floating Top-Left Coordinates & Context Pill */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 pointer-events-auto">
        <div className="rounded-xl border border-border bg-surface-white/95 backdrop-blur-md px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Compass className="h-3.5 w-3.5 text-azure-primary shrink-0" />
          <span className="font-semibold text-text-primary">Delhi NCR</span>
          <span className="text-border">|</span>
          <span className="font-mono text-[11px]">28.6139° N, 77.2090° E</span>
        </div>
      </div>

      {/* Floating Top-Right Layer Toggle Controls */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
        <LayerToggle
          activeLayer={activeLayer}
          onLayerChange={handleLayerChange}
        />
      </div>

      {/* Floating Bottom-Right Metric Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-auto">
        <MapLegend activeLayer={activeLayer} />
      </div>

      {/* Interactive Map Surface */}
      <div className="w-full h-full">
        <LeafletMapInner
          activeLayer={activeLayer}
          selectedWardId={selectedWardId}
          onSelectWard={onSelectWard}
        />
      </div>

    </div>
  );
}
