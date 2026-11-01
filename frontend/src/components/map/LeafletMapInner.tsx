"use client";

import "leaflet/dist/leaflet.css";
import React, { useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { Layer, LeafletMouseEvent } from "leaflet";
import { MapMetricLayer, WardMetrics, WardFeature } from "@/types";
import { delhiWardFeatureCollection } from "@/data/delhiGeoJson";
import { getRiskColor } from "@/lib/formulas";

interface LeafletMapInnerProps {
  activeLayer: MapMetricLayer;
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  basemapStyle?: "light" | "osm" | "satellite";
}

// Invalidate Leaflet map size on mount and container layout change
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    // Invalidate size across layout rendering passes
    map.invalidateSize();
    const t1 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 150);
    const t2 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 600);

    const handleResize = () => {
      try {
        map.invalidateSize();
      } catch (_) {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

// Map center adjustment component on selection with zero-size guards
function MapController({ selectedWard }: { selectedWard?: WardMetrics }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (selectedWard && selectedWard.centerCoordinates) {
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          map.flyTo(selectedWard.centerCoordinates, 12.5, {
            duration: 1.2,
          });
        }
      } catch (err) {
        console.warn("[Leaflet MapController flyTo]:", err);
      }
    }
  }, [selectedWard, map]);

  return null;
}

export default function LeafletMapInner({
  activeLayer,
  selectedWardId,
  onSelectWard,
  basemapStyle = "light",
}: LeafletMapInnerProps) {
  // Center of Delhi NCR
  const centerPosition: [number, number] = [28.6139, 77.2090];

  // Helper to compute polygon fill color based on active metric
  const getMetricFillColor = (props: WardMetrics): string => {
    if (activeLayer === "priority") {
      return getRiskColor(props.riskLevel).fill;
    }

    if (activeLayer === "lst") {
      const lst = props.lst;
      // 38°C to 48.8°C
      const ratio = Math.max(0, Math.min(1, (lst - 38.0) / 10.8));
      if (ratio > 0.75) return "#E11D48"; // Crimson (>46.5°C)
      if (ratio > 0.50) return "#FB923C"; // Orange (43.5°C - 46.5°C)
      if (ratio > 0.25) return "#FBBF24"; // Amber (40.5°C - 43.5°C)
      return "#FEF08A"; // Pale yellow (<40.5°C)
    }

    if (activeLayer === "ndvi") {
      const ndvi = props.ndvi;
      // 0.06 to 0.42
      const ratio = Math.max(0, Math.min(1, (ndvi - 0.06) / 0.36));
      if (ratio > 0.75) return "#059669"; // Dense emerald canopy
      if (ratio > 0.45) return "#4ADE80"; // Moderate green
      if (ratio > 0.20) return "#FDE047"; // Sparse yellow-green
      return "#E4E4E7"; // Built-up concrete / bare soil
    }

    if (activeLayer === "aqi") {
      const aqi = props.aqi;
      // 200 to 420
      const ratio = Math.max(0, Math.min(1, (aqi - 200) / 220));
      if (ratio > 0.80) return "#881337"; // Severe Crimson
      if (ratio > 0.55) return "#E11D48"; // Very Poor Red
      if (ratio > 0.30) return "#F97316"; // Poor Orange
      return "#FDE047"; // Moderate Gold
    }

    return "#0284C7";
  };

  // Helper to format tooltip text based on active layer
  const getActiveMetricDisplay = (props: WardMetrics) => {
    switch (activeLayer) {
      case "priority":
        return `AHP Priority: ${(props.priorityScore * 100).toFixed(1)}%`;
      case "lst":
        return `Radiometric LST: ${props.lst.toFixed(1)}°C`;
      case "ndvi":
        return `Vegetation NDVI: ${props.ndvi.toFixed(2)} (FVC: ${(props.fvc * 100).toFixed(0)}%)`;
      case "aqi":
        return `PM2.5 AQI: ${props.aqi} AQI`;
    }
  };

  // GeoJSON style callback
  const styleFeature = (feature: any) => {
    const props = feature.properties as WardMetrics;
    const isSelected = props.id === selectedWardId;

    return {
      fillColor: getMetricFillColor(props),
      fillOpacity: isSelected ? 0.85 : 0.40,
      color: isSelected ? "#0284C7" : "#94A3B8",
      weight: isSelected ? 3.5 : 1.2,
      dashArray: isSelected ? undefined : "2 2",
    };
  };

  // Interaction handlers on each polygon
  const onEachFeature = (feature: any, layer: Layer) => {
    const props = feature.properties as WardMetrics;
    const risk = getRiskColor(props.riskLevel);

    // Bind custom styled light tooltip
    layer.bindTooltip(
      `<div class="flex flex-col gap-1 py-0.5">
        <div class="flex items-center justify-between gap-3">
          <span class="font-bold text-slate-900 text-xs">${props.name}</span>
          <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${risk.badge}">${props.riskLevel}</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-600 text-[11px] font-mono">
          <span class="font-semibold text-slate-800">${getActiveMetricDisplay(props)}</span>
        </div>
        <div class="text-[9px] text-slate-400 font-sans truncate">
          ${props.zone} • Click to inspect
        </div>
      </div>`,
      {
        sticky: true,
        direction: "top",
        className: "heatlens-tooltip",
      }
    );

    // Mouse events
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target;
        if (props.id !== selectedWardId) {
          target.setStyle({
            fillOpacity: 0.75,
            color: "#0284C7",
            weight: 2.5,
            dashArray: undefined,
          });
        }
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target;
        if (props.id !== selectedWardId) {
          target.setStyle({
            fillOpacity: 0.40,
            color: "#94A3B8",
            weight: 1.2,
            dashArray: "2 2",
          });
        }
      },
      click: () => {
        onSelectWard(props.id);
      },
    });
  };

  const selectedWard = useMemo(
    () =>
      delhiWardFeatureCollection.features.find(
        (f) => f.properties.id === selectedWardId
      )?.properties,
    [selectedWardId]
  );

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <MapContainer
        center={centerPosition}
        zoom={11}
        minZoom={10}
        maxZoom={15}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
        className="w-full h-full z-0"
      >
        <ZoomControl position="bottomleft" />
        
        {/* Zero-Watermark High-Resolution Basemap Layers */}
        {basemapStyle === "satellite" ? (
          <TileLayer
            key="satellite-base"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; NASA/USGS Landsat &copy; Copernicus'
            maxZoom={18}
          />
        ) : basemapStyle === "osm" ? (
          <TileLayer
            key="osm-base"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        ) : (
          <>
            {/* Pristine Enterprise Light Gray Canvas (Zero Watermark / No API Key Required) */}
            <TileLayer
              key="light-gray-base"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap'
              maxZoom={16}
            />
            {/* Crisp Reference Labels */}
            <TileLayer
              key="light-gray-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              attribution=""
              maxZoom={16}
            />
          </>
        )}

        {/* Dynamic Choropleth Layer */}
        <GeoJSON
          key={`geojson-${activeLayer}-${selectedWardId}`}
          data={delhiWardFeatureCollection as any}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />

        {/* Dynamic Map Resizer & Size Invalidation */}
        <MapResizer />

        {/* Camera controller for ward fly-to */}
        <MapController selectedWard={selectedWard} />
      </MapContainer>
    </div>
  );
}
