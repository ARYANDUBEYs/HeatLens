import React from 'react';
import { Satellite, Radio, ShieldCheck, Activity, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * High-Tech Aerospace Navigation Header
 * HeatLens | Spaceborne Air Quality Downscaling & Inversion Platform (Mitacs #53438)
 * Dr. Vijal Jain (Thompson Rivers University, Kamloops, BC)
 */
export default function Header({ 
  activeCorridor = 'kamloops', 
  onSelectCorridor, 
  onOpenAttestation, 
  isDownscaling,
  onTriggerDownscale,
  backendConnected = true
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-[#060a14]/90 backdrop-blur-xl px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        
        {/* 1. Brand Logo & Mitacs GRI Research Info */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Satellite className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">Heat<span className="text-cyan-400">Lens</span></span>
                <span className="hidden sm:inline-block rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30 font-mono">
                  Spaceborne ML 30m
                </span>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30 font-mono">
                  Mitacs #53438
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs md:max-w-none">
                Spaceborne Air Quality Downscaling & Inversion Platform • <span className="text-slate-300">TRU Kamloops</span>
              </p>
            </div>
          </div>

          {/* Mobile Quick Action */}
          <button
            onClick={onTriggerDownscale}
            disabled={isDownscaling}
            className="md:hidden p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400"
          >
            <Radio className={`h-4 w-4 ${isDownscaling ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 2. Corridor Toggle Pills */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSelectCorridor('kamloops')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCorridor === 'kamloops'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇨🇦</span>
            <span className="font-medium">Kamloops Mountain Basin (BC)</span>
          </button>

          <button
            onClick={() => onSelectCorridor('delhi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCorridor === 'delhi'
                ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-300 border border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇮🇳</span>
            <span className="font-medium">Delhi NCR Urban Basin</span>
          </button>
        </div>

        {/* 3. Live Status Badges & Action Buttons */}
        <div className="flex items-center gap-2.5">
          
          {/* Live Status Badges */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono">
            
            {/* Backend Connection State */}
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-slate-300">
              <span className={`h-2 w-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-[10px]">
                {backendConnected ? 'Backend Online' : 'Connecting...'}
              </span>
            </div>

            {/* Active Projection */}
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-cyan-300">
              <Globe2 className="h-3 w-3 text-cyan-400" />
              <span className="text-[10px]">
                {activeCorridor === 'kamloops' ? 'EPSG:32610 (UTM 10N)' : 'EPSG:32643 (UTM 43N)'}
              </span>
            </div>

            {/* Simulation Mode */}
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-purple-300">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span className="text-[10px]">PuLP ILP Ready</span>
            </div>

          </div>

          {/* Audit On-Chain Proof Button */}
          <button
            onClick={onOpenAttestation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Audit On-Chain Proof</span>
            <span className="sm:hidden">Audit Proof</span>
          </button>

          {/* Run 30m Downscale Pipeline Button */}
          <button
            onClick={onTriggerDownscale}
            disabled={isDownscaling}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Radio className={`h-3.5 w-3.5 ${isDownscaling ? 'animate-spin' : ''}`} />
            <span>{isDownscaling ? 'Downscaling...' : 'Run 30m Pipeline'}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
