"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MapViewport } from "@/components/map/MapViewport";
import { MapMetricLayer } from "@/types";

export default function HomePage() {
  const [selectedWardId, setSelectedWardId] = useState<string | null>("DEL-001");
  const [activeLayer, setActiveLayer] = useState<MapMetricLayer>("priority");

  return (
    <main className="flex-1 h-[calc(100vh-4rem)] flex overflow-hidden bg-canvas">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: 420px Fixed Width Control & AI Decision Suite
          ───────────────────────────────────────────────────────────── */}
      <Sidebar
        selectedWardId={selectedWardId}
        onSelectWard={(id) => setSelectedWardId(id)}
      />

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: Flexible Viewport Interactive Geospatial Map
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 h-full bg-canvas relative flex flex-col overflow-hidden">
        <MapViewport
          selectedWardId={selectedWardId}
          onSelectWard={(id) => setSelectedWardId(id)}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />
      </section>
    </main>
  );
}
