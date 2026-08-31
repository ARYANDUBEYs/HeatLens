import React from 'react';
import { Thermometer, Trees, Wind, Home, AlertTriangle } from 'lucide-react';

export default function LayerControls({ activeLayer, setActiveLayer }) {
  const layers = [
    { id: 'priority', label: 'Priority Burden Score', icon: AlertTriangle, color: 'text-rose-400', border: 'border-rose-500/30' },
    { id: 'lst', label: 'Land Surface Temp (LST)', icon: Thermometer, color: 'text-amber-400', border: 'border-amber-500/30' },
    { id: 'ndvi', label: 'Green Canopy (NDVI)', icon: Trees, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { id: 'aqi', label: 'Air Quality (AQI PM2.5)', icon: Wind, color: 'text-purple-400', border: 'border-purple-500/30' },
    { id: 'informal', label: 'Informal Settlements %', icon: Home, color: 'text-cyan-400', border: 'border-cyan-500/30' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-3.5 shadow-xl border border-slate-800">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 px-1">Geospatial Environmental Layers</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? `bg-slate-800 text-white shadow-md border ${layer.border} ring-1 ring-white/10`
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? layer.color : 'text-slate-500'}`} />
              <span className="truncate">{layer.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
