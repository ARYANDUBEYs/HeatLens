"use client";

import React, { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MapViewport } from "@/components/map/MapViewport";
import { WardDetailModal } from "@/components/analytics/WardDetailModal";
import { MapMetricLayer, WardMetrics } from "@/types";
import { getMockWardById, mockWards } from "@/data/mockWards";

export default function HomePage() {
  const [selectedWardId, setSelectedWardId] = useState<string | null>("DEL-001");
  const [activeLayer, setActiveLayer] = useState<MapMetricLayer>("priority");
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const selectedWard = useMemo(
    () => (selectedWardId ? getMockWardById(selectedWardId) ?? null : null),
    [selectedWardId]
  );

  const handleSelectWard = (id: string) => {
    setSelectedWardId(id);
    setIsDetailDrawerOpen(true);
  };

  return (
    <main className="flex-1 h-[calc(100vh-4rem)] flex overflow-hidden bg-canvas relative">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: 420px Fixed Width Control & AI Decision Suite
          ───────────────────────────────────────────────────────────── */}
      <Sidebar
        selectedWardId={selectedWardId}
        onSelectWard={handleSelectWard}
      />

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: Flexible Viewport Interactive Geospatial Map
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 min-w-0 self-stretch bg-canvas relative flex flex-col overflow-hidden">
        <MapViewport
          selectedWardId={selectedWardId}
          onSelectWard={handleSelectWard}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SLIDE-OVER DRAWER: Ward Detailed Telemetry & 14-Day Chart
          ───────────────────────────────────────────────────────────── */}
      <WardDetailModal
        ward={selectedWard}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
      />
    </main>
  );
}
