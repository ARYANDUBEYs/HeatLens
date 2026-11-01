import React from 'react';
import { ThermometerSun, AlertTriangle, Trees, Users, ArrowUpRight, Flame } from 'lucide-react';

export default function KpiBar({ stats, selectedZone }) {
  const peakLst = stats?.max_lst_celsius || 49.1;
  const avgLst = stats?.avg_lst_celsius || 43.5;
  const disparity = stats?.thermal_disparity_celsius || 12.2;
  const highRiskCount = stats?.risk_breakdown?.high || 4;
  const hottestWard = stats?.hottest_ward?.name || "Okhla Ind. Area";
  const coolestWard = stats?.coolest_ward?.name || "Vasant Kunj Ridge";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      
      {/* Metric 1: Peak Surface Temp */}
      <div className="glass-card p-3 rounded-xl border-l-4 border-l-rose-500 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Peak Surface LST</span>
          <Flame className="w-4 h-4 text-rose-500" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-white font-mono flex items-baseline gap-1">
            {peakLst}°C
            <span className="text-[10px] font-normal text-rose-400">Radiometric</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5" title={hottestWard}>
            {hottestWard}
          </div>
        </div>
      </div>

      {/* Metric 2: Mean Surface Temp */}
      <div className="glass-card p-3 rounded-xl border-l-4 border-l-amber-500 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Mean LST (Citywide)</span>
          <ThermometerSun className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-white font-mono flex items-baseline gap-1">
            {avgLst}°C
            <span className="text-[10px] font-normal text-amber-400">Baseline</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            20 Wards Evaluated
          </div>
        </div>
      </div>

      {/* Metric 3: Microclimate Thermal Disparity */}
      <div className="glass-card p-3 rounded-xl border-l-4 border-l-indigo-500 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Thermal Disparity</span>
          <ArrowUpRight className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-indigo-300 font-mono flex items-baseline gap-1">
            +{disparity}°C
            <span className="text-[10px] font-normal text-slate-400">Δ gap</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5" title={`${hottestWard} vs ${coolestWard}`}>
            Concrete vs. Ridge
          </div>
        </div>
      </div>

      {/* Metric 4: High Vulnerability Wards */}
      <div className="glass-card p-3 rounded-xl border-l-4 border-l-red-500 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Critical Risk Wards</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-red-400 font-mono flex items-baseline gap-1">
            {highRiskCount}
            <span className="text-[10px] font-normal text-slate-400">/ 20 Wards</span>
          </div>
          <div className="text-[11px] text-red-300 font-semibold truncate mt-0.5">
            AHP Score &gt; 70%
          </div>
        </div>
      </div>

      {/* Metric 5: Average NDVI */}
      <div className="glass-card p-3 rounded-xl border-l-4 border-l-emerald-500 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Mean NDVI Greenery</span>
          <Trees className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-emerald-300 font-mono flex items-baseline gap-1">
            {stats?.avg_ndvi || 0.24}
            <span className="text-[10px] font-normal text-slate-400">[-1, 1]</span>
          </div>
          <div className="text-[11px] text-emerald-400 truncate mt-0.5">
            Sentinel-2 MSI (10m)
          </div>
        </div>
      </div>

      {/* Metric 6: Exposed Population */}
      <div className="glass-card p-3 rounded-xl border-l-4 border-l-sky-500 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Exposed Population</span>
          <Users className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-sky-200 font-mono flex items-baseline gap-1">
            50M+
            <span className="text-[10px] font-normal text-slate-400">Residents</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            Delhi NCR Megacity
          </div>
        </div>
      </div>

    </div>
  );
}
