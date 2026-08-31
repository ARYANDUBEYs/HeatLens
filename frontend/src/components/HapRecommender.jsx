import React, { useState } from 'react';
import { Sliders, CheckCircle2, Trees, Droplets, Home, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HapRecommender({ selectedWard, onSimulate, isSimulating, simulationData }) {
  const [budget, setBudget] = useState(25);

  if (!selectedWard) return null;

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">NDMA Heat Action Plan (HAP) AI Simulator</h4>
        </div>
        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">x402 Powered</span>
      </div>

      <p className="text-xs text-slate-400">
        Simulate targeted municipal cooling interventions for <b>{selectedWard.ward_name}</b> based on government NDMA heat action directives.
      </p>

      {/* Budget Slider */}
      <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Intervention Budget:</span>
          <span className="font-mono font-bold text-amber-400 text-sm">₹{budget} Lakhs INR</span>
        </div>
        <input 
          type="range" 
          min="5" 
          max="100" 
          step="5"
          value={budget} 
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>₹5L</span>
          <span>₹50L</span>
          <span>₹100L (₹1 Cr)</span>
        </div>
      </div>

      <button
        onClick={() => onSimulate(budget)}
        disabled={isSimulating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition disabled:opacity-50"
      >
        {isSimulating ? (
          <span>Simulating on-chain ($0.010 USDC)...</span>
        ) : (
          <span>Run AI Simulation (x402 - $0.010 USDC)</span>
        )}
      </button>

      {/* Simulation Output Card */}
      {simulationData && (
        <div className="rounded-xl bg-slate-950/90 border border-emerald-500/30 p-3.5 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Simulation Attested on Algorand
            </span>
            <a 
              href={simulationData.explorer_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>Verify on Lora</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Indoor Temp Relief</p>
              <p className="font-bold text-emerald-400 text-sm">{simulationData.simulation_results?.impact_metrics?.estimated_indoor_cooling}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Cool Roofs Applied</p>
              <p className="font-bold text-slate-200">{simulationData.simulation_results?.impact_metrics?.cool_roof_coatings_applied}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Native Shade Trees</p>
              <p className="font-bold text-emerald-400">{simulationData.simulation_results?.impact_metrics?.shade_trees_plantable}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-slate-400">Beneficiaries Served</p>
              <p className="font-bold text-amber-400">{simulationData.simulation_results?.impact_metrics?.direct_beneficiaries_served}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
