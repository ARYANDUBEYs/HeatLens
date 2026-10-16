import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Crosshair, Activity, Compass } from 'lucide-react';

/**
 * Animated High-Tech Satellite Swath & Radar Sweep Overlay
 * Simulates Copernicus Sentinel-5P TROPOMI & Landsat-9 Overpass
 * Mitacs GRI #53438 - Dr. Vijal Jain (TRU Kamloops)
 */
export default function RadarSweep({ active = true, corridor = 'kamloops' }) {
  const [orbitIndex, setOrbitIndex] = useState(42981);
  const [scanPhase, setScanPhase] = useState('NADIR ACQUISITION COMPLETE');

  // Cycle orbital telemetry status
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setOrbitIndex((prev) => prev + 1);
      setScanPhase((prev) => 
        prev === 'NADIR ACQUISITION COMPLETE' 
          ? 'SPECTRAL BAND 10 RECALIBRATION' 
          : 'NADIR ACQUISITION COMPLETE'
      );
    }, 12000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[400] overflow-hidden">
      
      {/* 1. Conical Radar Sweep Beam */}
      <div className="radar-sweep-beam opacity-40 pointer-events-none" />

      {/* 2. Pushbroom Satellite Scanning Swath Line */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="w-full h-24 bg-gradient-to-b from-cyan-500/0 via-cyan-400/15 to-cyan-500/35 border-b-2 border-cyan-400/90 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-radar-scan pointer-events-none"
        />
      </div>

      {/* 3. Corner Aerospace HUD Targeting Reticles */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 text-cyan-400/60 font-mono text-[10px]">
        <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-400/70"></div>
        <span>CORRIDOR SCAN ZONE</span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 text-cyan-400/60 font-mono text-[10px]">
        <div className="w-3 h-3 border-t-2 border-r-2 border-cyan-400/70"></div>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-cyan-400/60 font-mono text-[10px]">
        <div className="w-3 h-3 border-b-2 border-l-2 border-cyan-400/70"></div>
        <span>SWATH: 30m GROUND RES</span>
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-cyan-400/60 font-mono text-[10px]">
        <div className="w-3 h-3 border-b-2 border-r-2 border-cyan-400/70"></div>
      </div>

      {/* 4. Bottom Orbital Telemetry HUD Readout Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)] text-cyan-300 font-mono text-[11px] whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-bold tracking-wider text-slate-100">
          TELEMETRY SYNC: TROPOMI ORBIT #{orbitIndex}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-cyan-400 font-medium">
          {scanPhase}
        </span>
        <span className="hidden md:inline-block text-slate-500">•</span>
        <span className="hidden md:inline-block text-[10px] text-slate-400">
          ALT: 824 km | INCLINATION: 98.7°
        </span>
      </div>

    </div>
  );
}
