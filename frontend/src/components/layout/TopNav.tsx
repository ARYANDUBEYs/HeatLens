"use client";

import React, { useState } from "react";
import { Flame, Satellite, Globe2, SunMedium, Eye } from "lucide-react";

export function TopNav() {
  const [language, setLanguage] = useState<"EN" | "HI">("EN");
  const [highContrast, setHighContrast] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-surface-white px-4 md:px-6 shadow-sm">
      <div className="flex h-full items-center justify-between gap-4">
        
        {/* Left: Brand & Climate Edition */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-azure-soft text-azure-primary shadow-sm border border-sky-200">
            <Flame className="h-5 w-5 fill-azure-primary text-azure-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-text-primary">
                HeatLens
              </span>
              <span className="inline-flex items-center rounded-md bg-azure-soft px-2 py-0.5 text-[11px] font-semibold text-azure-primary border border-sky-200">
                Climate Intelligence
              </span>
            </div>
            <span className="text-xs font-medium text-text-secondary">
              Urban Heat Equity &amp; Resilience Platform
            </span>
          </div>
        </div>

        {/* Center: Live Satellite Telemetry Pill */}
        <div className="hidden lg:flex items-center">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface-muted px-4 py-1.5 text-xs text-text-secondary shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-heat-low opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-heat-low"></span>
            </span>
            <div className="flex items-center gap-1.5 font-medium">
              <Satellite className="h-3.5 w-3.5 text-azure-primary" />
              <span className="font-semibold text-text-primary">Active:</span>
              <span>Landsat-9 &amp; Sentinel-2</span>
              <span className="text-border">|</span>
              <span className="font-semibold text-text-primary">Cloud Cover:</span>
              <span className="font-mono text-emerald-600 font-semibold">&lt;5%</span>
            </div>
          </div>
        </div>

        {/* Right: Language & High-Contrast Toggles */}
        <div className="flex items-center gap-3">
          
          {/* Language Toggle (EN | HI) */}
          <div className="flex items-center rounded-lg border border-border bg-surface-muted p-0.5 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setLanguage("EN")}
              aria-label="Switch to English"
              className={`rounded-md px-2.5 py-1 transition-all ${
                language === "EN"
                  ? "bg-surface-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("HI")}
              aria-label="Switch to Hindi"
              className={`rounded-md px-2.5 py-1 transition-all ${
                language === "HI"
                  ? "bg-surface-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              HI
            </button>
          </div>

          {/* High-Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title={highContrast ? "Disable High Contrast" : "Enable High Contrast"}
            className={`flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-all ${
              highContrast
                ? "bg-text-primary text-surface-white border-text-primary shadow-sm"
                : "bg-surface-white text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {highContrast ? "Contrast: High" : "High Contrast"}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
