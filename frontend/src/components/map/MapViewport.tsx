"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Compass, Layers, Globe, Loader2 } from "lucide-react";
import { MapMetricLayer } from "@/types";
import { LayerToggle } from "./LayerToggle";
import { MapLegend } from "./MapLegend";
import { VectorMapFallback } from "./VectorMapFallback";

// Dynamically import LeafletMapInner with SSR disabled to prevent window/document errors
const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-surface-muted/60 text-text-secondary space-y-3">
      <div className="h-10 w-10 rounded-xl bg-surface-white border border-border shadow-sm flex items-center justify-center text-azure-primary">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <span className="text-xs font-semibold text-text-primary block">
          Initializing CartoDB Positron Basemap &amp; GeoJSON Choropleth...
        </span>
        <span className="text-[10px] text-text-secondary font-mono">
          NASA Landsat-9 Band 10 • Copernicus Sentinel-2 Telemetry
        </span>
      </div>
    </div>
  ),
});

// Resilient Error Boundary to ensure zero blank maps
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("[HeatLens Map Catch]: Falling back to Vector Projection", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

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
  const [basemapStyle, setBasemapStyle] = useState<"light" | "osm" | "satellite" | "vector">("light");

  const activeLayer = externalActiveLayer ?? internalLayer;
  const handleLayerChange = externalOnLayerChange ?? setInternalLayer;

  return (
    <div className="relative w-full h-full min-h-0 flex-1 flex flex-col overflow-hidden bg-canvas select-none">
      
      {/* Floating Responsive Top Control Bar (Prevents Overlapping) */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Cluster: Coordinates & View Engine Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="rounded-xl border border-border bg-surface-white/95 backdrop-blur-md px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2 text-xs font-medium text-text-secondary">
            <Compass className="h-3.5 w-3.5 text-azure-primary shrink-0" />
            <span className="font-semibold text-text-primary">Delhi NCR</span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="font-mono text-[11px] hidden sm:inline">28.61° N, 77.21° E</span>
          </div>

          {/* Clean Watermark-Free Basemap Style Switcher */}
          <div className="rounded-xl border border-border bg-surface-white/95 backdrop-blur-md p-0.5 shadow-sm flex items-center">
            <button
              onClick={() => setBasemapStyle("light")}
              title="Enterprise Light GIS Canvas (Zero watermark / No API key required)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                basemapStyle === "light"
                  ? "bg-azure-soft text-azure-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Globe className="h-3 w-3" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setBasemapStyle("osm")}
              title="OpenStreetMap Street Network (Zero watermark / No API key required)"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                basemapStyle === "osm"
                  ? "bg-azure-soft text-azure-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>Streets</span>
            </button>
            <button
              onClick={() => setBasemapStyle("satellite")}
              title="NASA Landsat & Sentinel Satellite True-Color Imagery"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                basemapStyle === "satellite"
                  ? "bg-azure-soft text-azure-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setBasemapStyle("vector")}
              title="High-Precision SVG Vector Grid Engine"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                basemapStyle === "vector"
                  ? "bg-azure-soft text-azure-primary shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Vector</span>
            </button>
          </div>
        </div>

        {/* Right Cluster: Metric Layer Selector */}
        <div className="pointer-events-auto shrink-0">
          <LayerToggle
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
          />
        </div>
      </div>

      {/* Floating Bottom-Right Metric Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-auto">
        <MapLegend activeLayer={activeLayer} />
      </div>

      {/* Interactive Map Surface */}
      <div className="relative w-full h-full flex-1 self-stretch overflow-hidden">
        {basemapStyle === "vector" ? (
          <VectorMapFallback
            activeLayer={activeLayer}
            selectedWardId={selectedWardId}
            onSelectWard={onSelectWard}
          />
        ) : (
          <MapErrorBoundary
            fallback={
              <VectorMapFallback
                activeLayer={activeLayer}
                selectedWardId={selectedWardId}
                onSelectWard={onSelectWard}
              />
            }
          >
            <LeafletMapInner
              activeLayer={activeLayer}
              selectedWardId={selectedWardId}
              onSelectWard={onSelectWard}
              basemapStyle={basemapStyle}
            />
          </MapErrorBoundary>
        )}
      </div>

    </div>
  );
}
