import React from 'react';
import { Flame, Trees, Wind, Users, ShieldAlert, CheckCircle2, ArrowRight, Building, Sparkles } from 'lucide-react';

export default function WardInspector({ ward, onAskAboutWard }) {
  if (!ward) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Ward Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Click on any ward on the choropleth map to inspect high-resolution thermal and socio-demographic vulnerability metrics.
        </p>
      </div>
    );
  }

  const scorePct = ((ward.vulnerability_score || 0) * 100).toFixed(1);
  const isHighRisk = ward.risk_tier === 'HIGH';
  const isMedRisk = ward.risk_tier === 'MEDIUM';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between h-full space-y-4">
      
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
              {ward.ward_id} • {ward.zone || 'Delhi NCR'}
            </span>
            <h3 className="text-lg font-extrabold text-white leading-tight mt-0.5">
              {ward.ward_name}
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isHighRisk
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : isMedRisk
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {ward.risk_tier} RISK
          </span>
        </div>

        {/* Composite Priority Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-300">Composite Vulnerability (AHP)</span>
            <span className="font-mono font-extrabold text-white">{scorePct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHighRisk ? 'bg-gradient-to-r from-amber-500 to-rose-600' : isMedRisk ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${scorePct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Low (&lt;40%)</span>
            <span>Med (40-70%)</span>
            <span>High (&gt;70%)</span>
          </div>
        </div>
      </div>

      {/* Grid of Telemetry */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        
        {/* LST */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Surface Temp</span>
          </div>
          <div className="text-base font-extrabold text-white font-mono">
            {ward.lst_celsius}°C
          </div>
          <span className="text-[10px] text-rose-400">Planck Band 10</span>
        </div>

        {/* NDVI */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vegetation Index</span>
          </div>
          <div className="text-base font-extrabold text-white font-mono">
            {ward.ndvi}
          </div>
          <span className="text-[10px] text-emerald-400">Sentinel-2 10m</span>
        </div>

        {/* AQI */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-amber-400" />
            <span>Air Quality</span>
          </div>
          <div className="text-base font-extrabold text-white font-mono">
            {ward.aqi || 210} AQI
          </div>
          <span className="text-[10px] text-amber-400">PM2.5 Factor</span>
        </div>

        {/* Population */}
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Pop. Density</span>
          </div>
          <div className="text-base font-extrabold text-white font-mono">
            {(ward.population_density || 15000).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">people / km²</span>
        </div>

      </div>

      {/* Cooling Centers Action Needed */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Cooling Center Status</span>
          <span className="text-[11px] font-mono text-slate-400">
            {ward.existing_cooling_centers || 0} Established
          </span>
        </div>

        <div className="flex items-center gap-2">
          {ward.recommended_cooling_centers > 0 ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 w-full">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>+{ward.recommended_cooling_centers} Emergency Shelters Required</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 w-full">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Adequate Shelter Capacity</span>
            </div>
          )}
        </div>
      </div>

      {/* Query AI Button */}
      <button
        onClick={() => onAskAboutWard(ward)}
        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ask Azure OpenAI About {ward.ward_name}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

    </div>
  );
}
