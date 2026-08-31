import React from 'react';
import { Thermometer, Trees, Wind, Home, AlertCircle, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import HapRecommender from './HapRecommender';

export default function WardDrawer({ selectedWard, onClose, onRequestAudit, isAuditing, auditData, onSimulateHap, isSimulatingHap, simulationData }) {
  if (!selectedWard) return null;

  const getRiskBadge = (category) => {
    switch (category) {
      case 'CRITICAL_RED':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Critical Priority (Tier 1)</span>;
      case 'HIGH_ORANGE':
        return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">High Risk (Tier 2)</span>;
      case 'MEDIUM_YELLOW':
      case 'MODERATE_YELLOW':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Moderate Vulnerability</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Benchmark Green Belt</span>;
    }
  };

  return (
    <div className="glass-panel w-full h-full rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 overflow-y-auto max-h-[650px] shadow-xl">
      
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">{selectedWard.zone} • ID: {selectedWard.ward_id}</span>
          <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{selectedWard.ward_name}</h3>
          <div className="mt-1.5">{getRiskBadge(selectedWard.risk_category)}</div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-amber-400 mb-0.5">
            <Thermometer className="h-3.5 w-3.5" />
            <span className="text-slate-400">Surface (LST)</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{selectedWard.lst_temp_c}°C</p>
          <p className="text-[10px] text-slate-500">Air: {selectedWard.air_temp_c}°C</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-purple-400 mb-0.5">
            <Wind className="h-3.5 w-3.5" />
            <span className="text-slate-400">AQI (PM2.5)</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{selectedWard.aqi_pm25}</p>
          <p className="text-[10px] text-rose-400 font-semibold">{selectedWard.aqi_status}</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mb-0.5">
            <Trees className="h-3.5 w-3.5" />
            <span className="text-slate-400">Canopy (NDVI)</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{selectedWard.ndvi_vegetation}</p>
          <p className="text-[10px] text-slate-500">Sentinel-2 10m</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 mb-0.5">
            <Home className="h-3.5 w-3.5" />
            <span className="text-slate-400">Informal Pop.</span>
          </div>
          <p className="text-base font-bold font-mono text-white">{selectedWard.informal_settlement_pct}%</p>
          <p className="text-[10px] text-slate-500">Tin Roof: {selectedWard.tin_roof_coverage_pct || 0}%</p>
        </div>
      </div>

      {/* Formal vs Informal Inequality Gap Card (THE USP!) */}
      <div className="rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-900/90 border border-rose-500/30 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Formal vs. Informal Gap</span>
        </div>
        <p className="text-[10px] text-slate-300">
          Inequality gap vs. Delhi green-belt benchmark (Chanakyapuri):
        </p>
        <div className="space-y-1 text-xs font-mono pt-0.5">
          <div className="flex justify-between text-slate-300">
            <span className="text-[11px]">Heat Disparity:</span>
            <span className="font-bold text-rose-400">+{selectedWard.formal_vs_informal_gap?.temp_diff_c || (selectedWard.lst_temp_c - 34.6).toFixed(1)}°C Hotter</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-[11px]">AQI Disparity:</span>
            <span className="font-bold text-purple-400">+{selectedWard.formal_vs_informal_gap?.aqi_diff || (selectedWard.aqi_pm25 - 110)} Higher</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-[11px]">Canopy Deficit:</span>
            <span className="font-bold text-amber-400">{selectedWard.formal_vs_informal_gap?.tree_cover_diff_pct || -35}%</span>
          </div>
        </div>
      </div>

      {/* x402 Deep Satellite Audit Trigger */}
      {!auditData ? (
        <button
          onClick={() => onRequestAudit(selectedWard.ward_id)}
          disabled={isAuditing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Unlock x402 Deep Audit ($0.005 USDC)</span>
        </button>
      ) : (
        <div className="rounded-xl bg-slate-900 border border-emerald-500/40 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified On Algorand
            </span>
            <a 
              href={auditData.explorer_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>Lora Explorer</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <p className="text-[10px] text-slate-400">TX: <span className="font-mono text-slate-300">{auditData.transaction_id}</span></p>
        </div>
      )}

      {/* NDMA Heat Action Plan Simulator */}
      <HapRecommender 
        selectedWard={selectedWard}
        onSimulate={onSimulateHap}
        isSimulating={isSimulatingHap}
        simulationData={simulationData}
      />

    </div>
  );
}
