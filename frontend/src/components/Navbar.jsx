import React from 'react';
import { Flame, Satellite, Cpu, ShieldCheck, ExternalLink, Sparkles, Activity } from 'lucide-react';

export default function Navbar({ onOpenScience, azureStatus }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[2px] shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                HeatLens
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                Climate AI
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Geospatial AI for Urban Heat Equity</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-sky-400 font-medium">Urban Resilience</span>
            </p>
          </div>
        </div>

        {/* Telemetry & Azure badges */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <Satellite className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Landsat-9 TIRS &amp; Sentinel-2 MSI</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono">10m Res</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">Azure OpenAI</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {azureStatus?.azure_openai_configured ? 'GPT-4o Live' : 'Active'}
            </span>
          </div>

          <button
            onClick={onOpenScience}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>IEEE Science Validation</span>
          </button>
        </div>

        {/* External Links */}
        <div className="flex items-center gap-2">
          <a
            href="https://heat-lens-ecobuilders.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <span>Live Vercel</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href="https://huggingface.co/spaces/rohitsinghudi1372008/heatlens-satellite-lst-oracle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">HuggingFace Space</span>
            <span className="sm:hidden">HF</span>
          </a>
        </div>

      </div>
    </header>
  );
}
