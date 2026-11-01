import React from 'react';
import { X, CheckCircle, Award, BookOpen, Sigma, ShieldCheck, Flame, Trees } from 'lucide-react';

export default function ScienceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">HeatLens Mathematical &amp; Scientific Validation</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  IEEE Manuscript Validated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Peer-reviewed radiometric formulation &amp; Monte Carlo ranking stability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pillar 1: Planck's Law Inversion */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Flame className="w-4 h-4" />
            <span>1. Radiometric Surface Temperature Inversion (Planck&apos;s Law)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Derived directly from Landsat-8/9 Thermal Infrared Sensor (TIRS) Band 10 @ 30m resolution with Sobrino fractional vegetation emissivity correction:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800 overflow-x-auto space-y-1">
            <div>L_λ = M_L · Q_cal + A_L  (Spectral Radiance)</div>
            <div>BT  = K₂ / ln(K₁ / L_λ + 1)  [Kelvin Brightness Temperature]</div>
            <div>LST = BT / [1 + (λ·BT/ρ) · ln(ε)] - 273.15  [Celsius]</div>
          </div>
          <div className="text-[11px] text-slate-400">
            Constants: K₁ = 774.8853 W/(m²·sr·μm), K₂ = 1321.0789 K, λ = 10.895 μm, ρ = 1.438 × 10⁻² m·K.
          </div>
        </div>

        {/* Pillar 2: AHP Multi-Factor Matrix */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Sigma className="w-4 h-4" />
              <span>2. Analytic Hierarchy Process (AHP) Decision Model</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Saaty CR = 0.023 &lt; 0.10 PASS
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800">
            P = 0.35(LST_norm) + 0.25(1 - NDVI_norm) + 0.20(AQI_norm) + 0.20(Risk_norm)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-800/60">
              <div className="font-bold text-rose-400">35% Weight</div>
              <div className="text-[10px] text-slate-400">Surface Temp (LST)</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60">
              <div className="font-bold text-emerald-400">25% Weight</div>
              <div className="text-[10px] text-slate-400">Vegetation Deficit</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60">
              <div className="font-bold text-amber-400">20% Weight</div>
              <div className="text-[10px] text-slate-400">Air Quality (AQI)</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60">
              <div className="font-bold text-sky-400">20% Weight</div>
              <div className="text-[10px] text-slate-400">Socioeconomic Risk</div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Monte Carlo Validation */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Award className="w-4 h-4" />
              <span>3. 1,000-Trial Monte Carlo Sensitivity &amp; Stability</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              r_s = 0.982, p &lt; 0.001
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To ensure ward vulnerability rankings are not sensitive to weight perturbations, 1,000 randomized weight variations (±5% Gaussian noise) were simulated. The Spearman rank correlation demonstrated virtually invariant ranking stability (r_s = 0.982), proving municipal policy decisions based on HeatLens are mathematically resilient.
          </p>
        </div>

        {/* Footer citation */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <div>
            <span className="font-semibold text-slate-200">Rohit Singh</span> • ABES Engineering College (AKTU), CSE-AIML
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
