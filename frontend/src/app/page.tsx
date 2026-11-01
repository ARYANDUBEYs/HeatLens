import React from "react";
import {
  Layers,
  Sparkles,
  MapPin,
  Flame,
  ShieldCheck,
  Compass,
  Cpu,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

export default function HomePage() {
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

        {/* Panel Body Skeleton */}
        <div className="p-4 space-y-4 flex-1">
          
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

          {/* Strict Light-Mode Heat Risk Palette Preview */}
          <div className="rounded-xl border border-border bg-surface-white p-3.5 space-y-2.5">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Heat Risk Classification Tokens
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Low Risk */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted p-2">
                <span className="h-3 w-3 rounded-full bg-heat-low shrink-0 ring-2 ring-emerald-200"></span>
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary text-[11px]">Low</span>
                  <span className="font-mono text-[10px] text-text-secondary">&lt; 40% (#34D399)</span>
                </div>
              </div>

              {/* Moderate Risk */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted p-2">
                <span className="h-3 w-3 rounded-full bg-heat-moderate shrink-0 ring-2 ring-amber-200"></span>
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary text-[11px]">Moderate</span>
                  <span className="font-mono text-[10px] text-text-secondary">40-70% (#FBBF24)</span>
                </div>
              </div>

              {/* High Risk */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted p-2">
                <span className="h-3 w-3 rounded-full bg-heat-high shrink-0 ring-2 ring-orange-200"></span>
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary text-[11px]">High</span>
                  <span className="font-mono text-[10px] text-text-secondary">70-85% (#FB923C)</span>
                </div>
              </div>

              {/* Critical Risk */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted p-2">
                <span className="h-3 w-3 rounded-full bg-heat-critical shrink-0 ring-2 ring-rose-200"></span>
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary text-[11px]">Critical</span>
                  <span className="font-mono text-[10px] text-text-secondary">&gt; 85% (#F43F5E)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Reserved Shell: Upcoming Ward Inspector & Decision Assistant */}
          <div className="rounded-xl border border-dashed border-border bg-surface-muted/60 p-5 text-center flex flex-col items-center justify-center space-y-2 min-h-[220px]">
            <div className="h-10 w-10 rounded-xl bg-surface-white border border-border flex items-center justify-center text-azure-primary shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-text-primary">
                Control &amp; AI Decision Panel
              </h3>
              <p className="text-[11px] text-text-secondary max-w-[280px]">
                Ward inspector diagnostics, Planck LST telemetry gauge, and Azure OpenAI conversational interface will attach here in subsequent steps.
              </p>
            </div>
          </div>

        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-text-secondary">
          <span className="font-medium">Region: Central India (Mumbai)</span>
          <span className="font-mono font-semibold text-azure-primary">Azure Maps SDK Ready</span>
        </div>

      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: Flexible Viewport Interactive Map Shell
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 h-full bg-canvas relative flex flex-col overflow-hidden">
        
        {/* Viewport Top Bar */}
        <div className="h-12 border-b border-border bg-surface-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <Layers className="h-4 w-4 text-azure-primary" />
              <span>Delhi NCR Ward Boundary Matrix</span>
            </div>
            <span className="h-3.5 w-[1px] bg-border"></span>
            <span className="text-xs text-text-secondary font-mono">
              250+ Administrative Zones • 50M+ Residents
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-text-secondary bg-surface-muted px-2.5 py-1 rounded-md border border-border">
              <Compass className="h-3.5 w-3.5 text-azure-primary" />
              28.6139° N, 77.2090° E
            </span>
          </div>
        </div>

        {/* Viewport Canvas Skeleton */}
        <div className="flex-1 relative bg-surface-muted/40 p-4 flex items-center justify-center">
          
          {/* Subtle Map Coordinate Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Reserved Map Viewport Shell Card */}
          <div className="relative z-10 max-w-lg w-full rounded-2xl border border-border bg-surface-white p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-azure-soft text-azure-primary border border-sky-200">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary">
                Interactive Geospatial Map Viewport
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Dedicated container for the Azure Maps Atlas Web SDK choropleth layer, Planck radiometric LST overlays, and cooling center vector markers.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-text-secondary">
              <span className="rounded bg-surface-muted px-2 py-0.5 border border-border">
                Atlas Control v3.0
              </span>
              <span>•</span>
              <span className="rounded bg-surface-muted px-2 py-0.5 border border-border">
                GeoJSON FeatureCollection
              </span>
              <span>•</span>
              <span className="rounded bg-surface-muted px-2 py-0.5 border border-border">
                Choropleth Interpolation
              </span>
            </div>
          </div>

          {/* Floating Map Legend Skeleton Placeholder */}
          <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-border bg-surface-white/95 backdrop-blur-sm p-3 shadow-sm text-xs">
            <span className="text-[11px] font-bold text-text-secondary block mb-1.5 uppercase tracking-wider">
              Heat Vulnerability Scale
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-heat-low"></span>
                <span className="text-[11px] text-text-secondary">&lt; 40% Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-heat-moderate"></span>
                <span className="text-[11px] text-text-secondary">40-70% Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-heat-high"></span>
                <span className="text-[11px] text-text-secondary">70-85% High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-heat-critical"></span>
                <span className="text-[11px] text-text-secondary">&gt; 85% Critical</span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </main>
  );
}
