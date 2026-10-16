import React from 'react';
import { Wind, Activity, MapPin, Gauge, Radio, ShieldCheck, Cpu, Layers } from 'lucide-react';

/**
 * Floating Futuristic Glassmorphism HUD Panel
 * Mitacs Globalink Research Internship Project #53438
 */
export default function LayerControls({
  activeLayer = 'aqhi',
  setActiveLayer,
  activeCorridor = 'kamloops',
  overlays = { stations: true, radar: true, shelters: true },
  onToggleOverlay,
  // Fallbacks if individual toggles are passed
  radarEnabled,
  onToggleRadar
}) {
  // Support both unified overlays object and fallback direct props
  const isRadarOn = overlays?.radar !== undefined ? overlays.radar : (radarEnabled ?? true);
  const isStationsOn = overlays?.stations !== undefined ? overlays.stations : true;
  const isSheltersOn = overlays?.shelters !== undefined ? overlays.shelters : true;

  const handleToggle = (key) => {
    if (onToggleOverlay) {
      onToggleOverlay(key);
    } else if (key === 'radar' && onToggleRadar) {
      onToggleRadar();
    }
  };

  // 1. Spatiotemporal Layer Definitions
  const layers = [
    {
      id: 'aqhi',
      name: 'AQHI',
      title: 'Air Quality Health Index',
      subtitle: 'Health Risk (1–10+)',
      icon: Wind,
      color: 'text-rose-400',
      activeRing: 'border-rose-500/50 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
    },
    {
      id: 'pm25',
      name: 'PM2.5',
      title: 'Downscaled PM2.5',
      subtitle: 'Continuous 30m (µg/m³)',
      icon: Gauge,
      color: 'text-cyan-400',
      activeRing: 'border-cyan-500/50 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
    },
    {
      id: 'isi',
      name: 'ISI',
      title: 'Inversion Severity (ISI)',
      subtitle: 'Atmospheric Lid (0.0–1.0)',
      icon: Activity,
      color: 'text-amber-400',
      activeRing: 'border-amber-500/50 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
    },
    {
      id: 'svvi',
      name: 'SVVI',
      title: 'Sensor Void (SVVI)',
      subtitle: 'Kriging Variance & Gap',
      icon: MapPin,
      color: 'text-purple-400',
      activeRing: 'border-purple-500/50 bg-purple-500/15 shadow-[0_0_15px_rgba(192,38,211,0.25)]'
    }
  ];

  // 2. Dynamic Legend Configurations
  const legendConfig = {
    aqhi: {
      title: 'Canadian Air Quality Health Index (AQHI)',
      gradient: 'from-emerald-500 via-amber-400 via-orange-500 via-rose-600 to-purple-900',
      stops: [
        { label: '1 - 3 (Low)', color: 'bg-emerald-500' },
        { label: '4 - 6 (Moderate)', color: 'bg-amber-400' },
        { label: '7 - 8 (High Smog)', color: 'bg-orange-500' },
        { label: '9 - 10+ (Hazard)', color: 'bg-rose-600' }
      ]
    },
    pm25: {
      title: 'Downscaled Ground PM2.5 Concentration (µg/m³)',
      gradient: 'from-emerald-500 via-amber-400 via-orange-500 via-red-600 to-purple-800',
      stops: [
        { label: '< 25 (Clean)', color: 'bg-emerald-500' },
        { label: '25 - 50', color: 'bg-amber-400' },
        { label: '50 - 90', color: 'bg-orange-500' },
        { label: '90 - 150', color: 'bg-red-600' },
        { label: '> 150 (Acute)', color: 'bg-purple-800' }
      ]
    },
    isi: {
      title: 'Atmospheric Inversion Severity Index (ISI)',
      gradient: 'from-cyan-400 via-yellow-400 via-orange-500 to-red-600',
      stops: [
        { label: '0.0 - 0.25 (Dispersive)', color: 'bg-cyan-400' },
        { label: '0.25 - 0.50 (Mild Lid)', color: 'bg-yellow-400' },
        { label: '0.50 - 0.75 (Valley Trap)', color: 'bg-orange-500' },
        { label: '0.75 - 1.0 (Critical Cap)', color: 'bg-red-600' }
      ]
    },
    svvi: {
      title: 'Sensor Void Vulnerability Index (Epistemic Kriging Variance)',
      gradient: 'from-blue-500 via-amber-400 via-rose-500 to-fuchsia-600',
      stops: [
        { label: '0.0 - 0.4 (Monitored)', color: 'bg-blue-500' },
        { label: '0.4 - 0.6 (Sparse)', color: 'bg-amber-400' },
        { label: '0.6 - 0.8 (High Void)', color: 'bg-rose-500' },
        { label: '0.8 - 1.0 (Critical Blindspot)', color: 'bg-fuchsia-600' }
      ]
    }
  };

  const currentLegend = legendConfig[activeLayer] || legendConfig.aqhi;

  return (
    <div className="backdrop-blur-xl bg-slate-900/85 rounded-2xl p-3.5 border border-slate-800/90 shadow-2xl space-y-3.5">
      
      {/* Header & Corridor Context */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Earth Observation & Geostatistical Layers
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Corridor: <b className="text-cyan-400">{activeCorridor === 'kamloops' ? 'Kamloops Basin (BC)' : 'Delhi NCR'}</b>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Resolution: <b>30m Continuous</b>
          </span>
        </div>
      </div>

      {/* Layer Toggle Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                isActive
                  ? `${layer.activeRing} text-white`
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold font-mono tracking-wide">{layer.name}</span>
                <Icon className={`h-4 w-4 ${isActive ? layer.color : 'text-slate-500'}`} />
              </div>
              <p className="text-[11px] font-medium leading-tight text-slate-200 truncate">{layer.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{layer.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Auxiliary GIS Overlays Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span>Active Overlays:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Regulatory Stations Toggle */}
          <button
            onClick={() => handleToggle('stations')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
              isStationsOn
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Radio className={`h-3 w-3 ${isStationsOn ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{activeCorridor === 'kamloops' ? 'ECCC / NAPS Stations' : 'CPCB NAQI Stations'}</span>
          </button>

          {/* Radar Sweep Toggle */}
          <button
            onClick={() => handleToggle('radar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
              isRadarOn
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Activity className={`h-3 w-3 ${isRadarOn ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '6s' }} />
            <span>Satellite Radar Sweep</span>
          </button>

          {/* Allocated Shelters & IoT Mesh Toggle */}
          <button
            onClick={() => handleToggle('shelters')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
              isSheltersOn
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className={`h-3 w-3 ${isSheltersOn ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>Allocated Shelters & IoT</span>
          </button>
        </div>
      </div>

      {/* Dynamic Layer Color Gradient Legend */}
      <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-300">{currentLegend.title}</span>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Continuous Choropleth</span>
        </div>

        {/* Gradient Bar */}
        <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${currentLegend.gradient} shadow-inner`}></div>

        {/* Legend Step Labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          {currentLegend.stops.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${stop.color}`}></span>
              <span>{stop.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
