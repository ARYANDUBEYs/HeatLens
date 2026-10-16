import React from 'react';
import { X, ExternalLink, Cpu, Satellite, ShieldCheck, Flame, Trees, Sparkles } from 'lucide-react';

export default function WorkflowModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Satellite className="h-5 w-5 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">HeatLens Multi-Sensor System Architecture</h3>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🇨🇦 Mitacs GRI #53438 Aligned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-End Radiative Physics, Sentinel-5P Spatiotemporal ML, and Algorand x402 Oracle Workflow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="/docs/heatlens_system_workflow.html" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition border border-slate-700"
            >
              <span>Full Screen SVG</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Interactive Architecture Grid */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          
          {/* Stage 1: Spaceborne Constellation Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-orange-500/30 relative overflow-hidden group hover:border-orange-500/60 transition">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-1">
                <Satellite className="h-4 w-4" />
                <h4>NASA Landsat-8/9 (TIRS)</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">Band 10 (10.6–11.19 µm) • 30m Resampled</p>
              <p className="text-[11px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 text-amber-300">
                L_λ = M_L · Q_cal + A_L<br/>
                K1 = 774.8853, K2 = 1321.0789 K
              </p>
              <span className="text-[10px] text-slate-500 block mt-1.5">USGS Single-Channel (Band 11 Stray Light Avoided)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/40 relative overflow-hidden group hover:border-cyan-500/70 transition shadow-lg shadow-cyan-500/5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                <Sparkles className="h-4 w-4" />
                <h4>ESA Sentinel-5P (TROPOMI)</h4>
              </div>
              <p className="text-[11px] text-cyan-300 font-medium mb-2">Mitacs GRI #53438 (Thompson Rivers Univ)</p>
              <p className="text-[11px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 text-cyan-300">
                Tropospheric NO₂ + UV Aerosol Index<br/>
                Continuous Wildfire Smoke Plume Tracking
              </p>
              <span className="text-[10px] text-slate-400 block mt-1.5">Daily Canadian Valley Passes (Kamloops/Kelowna)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-500/60 transition">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Trees className="h-4 w-4" />
                <h4>ESA Sentinel-2 (MSI)</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">Band 8 (NIR) & Band 4 (Red) • 10m High Res</p>
              <p className="text-[11px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 text-emerald-300">
                NDVI = (B8 - B4) / (B8 + B4)<br/>
                Fractional Vegetation Cover (FVC)
              </p>
              <span className="text-[10px] text-slate-500 block mt-1.5">Canopy Shade Deficit in Informal Settlements</span>
            </div>
          </div>

          {/* Stage 2: Radiative Transfer & Spatiotemporal ML Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Cpu className="h-4 w-4" />
                <span>1. Radiative Transfer Physics</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-amber-400 font-bold">Planck Law Inversion (BT):</span>
                  <p className="font-mono text-white text-[10px] mt-0.5">BT = K₂ / ln(K₁ / L_λ + 1) - 273.15 [°C]</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-emerald-400 font-bold">Sobrino Emissivity Correction (ε):</span>
                  <p className="font-mono text-white text-[10px] mt-0.5">ε = ε_v · FVC + ε_s · (1 - FVC) + C_λ (roughness cavity)</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-cyan-400 font-bold">Land Surface Temperature (LST):</span>
                  <p className="font-mono text-white text-[10px] mt-0.5">LST = BT / [ 1 + (λ · BT / ρ) · ln(ε) ]</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>2. Spatiotemporal ML & Smog Forecasting (Mitacs)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-purple-300 font-bold">STARFM Multitemporal Fusion:</span>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">Fuses 1km daily MODIS thermal observation with 30m Landsat-9 TIRS to overcome 16-day revisit latency during acute heatwaves.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-cyan-300 font-bold">Spatio-Temporal Kriging:</span>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">Interpolates sparse ground station readings across unmonitored valley sectors in Kamloops & Interior British Columbia.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-rose-400 font-bold">Wildfire AQHI Forecasting:</span>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">Generates 24-hr advance smog warnings based on Sentinel-5P UV aerosol index and planetary boundary layer dynamics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 3: Decision Engine & Web3 Micro-Settlement */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Multi-Criteria Vulnerability Priority Index (P)</span>
              <p className="font-mono text-sm font-bold text-white">
                P = 0.35 · LST_norm + 0.25 · (1 - NDVI_norm) + 0.20 · AQI_norm + 0.20 · Risk_informal
              </p>
              <p className="text-[11px] text-slate-400">Validated with 1,000-trial Monte Carlo sensitivity analysis (Spearman rank correlation r_s = 0.982)</p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
              <ShieldCheck className="h-6 w-6 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Algorand AVM x402 Protocol</p>
                <p className="text-xs font-bold text-cyan-300">0.005 USDC / Audit</p>
                <p className="text-[10px] text-emerald-400">Instant 3.3s Fast Finality</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400">
          <span>Developed by Rohit Singh • Candidate for Mitacs Globalink Research Internship 2027</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
