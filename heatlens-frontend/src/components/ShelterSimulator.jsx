import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Home, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Users, 
  Cpu, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { optimizeShelters } from '../services/api';

/**
 * Collapsible Municipal Clean-Air Shelter & IoT Sensor Planning HUD
 * Mitacs Globalink Research Internship Project #53438 - TRU Kamloops
 */
export default function ShelterSimulator({ activeCorridor = 'kamloops', onOptimized }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [budget, setBudget] = useState(50000);
  const [shelterCost, setShelterCost] = useState(7500);
  const [sensorCost, setSensorCost] = useState(850);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    setErrorMessage(null);
    try {
      const data = await optimizeShelters(activeCorridor, {
        budget_cad: Number(budget),
        shelter_cost: Number(shelterCost),
        sensor_cost: Number(sensorCost)
      });
      setResults(data);
      if (onOptimized && data.optimal_placements) {
        onOptimized(data.optimal_placements);
      }
    } catch (err) {
      console.error("Optimization failed:", err);
      setErrorMessage("Optimization failed. Backend CBC solver unreachable or budget constraints exceeded.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      
      {/* Header with Collapsible Toggle */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {activeCorridor === 'kamloops'
                  ? 'Municipal Clean-Air Planning Engine'
                  : 'NDMA Heat Action Shelter Simulator'}
              </h3>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                PuLP ILP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeCorridor === 'kamloops'
                ? 'Integer Linear Programming for HEPA Hubs & IoT Sensor Mesh'
                : 'Optimizing Cool-Roofs, Hydration Points & Ambient Sensors'}
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800/80 animate-in fade-in duration-200">
          
          <p className="text-xs text-slate-400 leading-relaxed">
            {activeCorridor === 'kamloops'
              ? 'Maximize population vulnerability protection under municipal budget constraints during valley inversion and wildfire smoke entrapment episodes.'
              : 'Allocate shade shelters, cool hydration zones, and hyper-local temperature monitors across dense informal settlements.'}
          </p>

          {/* Budget Slider */}
          <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-cyan-400" /> Municipal Budget Ceiling:
              </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                ${budget.toLocaleString()} CAD
              </span>
            </div>
            
            <input 
              type="range" 
              min="10000" 
              max="250000" 
              step="5000"
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$10,000</span>
              <span>$125,000</span>
              <span>$250,000 CAD</span>
            </div>
          </div>

          {/* Unit Cost Parameter Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Home className="h-3 w-3 text-cyan-400" />
                <span>HEPA Shelter Cost</span>
              </label>
              <div className="flex items-center gap-1 font-mono text-slate-200">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  min="1000"
                  max="50000"
                  step="500"
                  value={shelterCost}
                  onChange={(e) => setShelterCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[10px] text-slate-500">CAD</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-amber-400" />
                <span>IoT Sensor Cost</span>
              </label>
              <div className="flex items-center gap-1 font-mono text-slate-200">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="50"
                  value={sensorCost}
                  onChange={(e) => setSensorCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500">CAD</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Solving Mixed-Integer Program (CBC)...' : 'Run Municipal ILP Optimization'}</span>
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Results Summary Cards */}
          {results && (
            <div className="rounded-xl bg-slate-950/90 border border-cyan-500/30 p-3.5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Optimal Resource Allocation
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Surplus: <b className="text-emerald-300">${results.budget_summary?.unspent_surplus_cad?.toLocaleString() || 0} CAD</b>
                </span>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                
                {/* 1. Shelters */}
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>HEPA Shelters</span>
                    <Home className="h-3 w-3 text-cyan-400" />
                  </div>
                  <p className="font-bold text-cyan-400 text-sm mt-0.5">
                    {results.equipment_breakdown?.hepa_shelters_deployed || 0} Hubs
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    ${results.equipment_breakdown?.hepa_shelters_total_cost_cad?.toLocaleString() || 0} CAD
                  </p>
                </div>

                {/* 2. IoT Sensor Mesh */}
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>IoT Sensor Mesh</span>
                    <Radio className="h-3 w-3 text-amber-400" />
                  </div>
                  <p className="font-bold text-amber-400 text-sm mt-0.5">
                    {results.equipment_breakdown?.iot_kriging_sensors_deployed || 0} Nodes
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    ${results.equipment_breakdown?.iot_sensors_total_cost_cad?.toLocaleString() || 0} CAD
                  </p>
                </div>

                {/* 3. Budget Utilized */}
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Budget Utilized</span>
                    <DollarSign className="h-3 w-3 text-emerald-400" />
                  </div>
                  <p className="font-bold text-emerald-400 text-sm mt-0.5">
                    ${results.budget_summary?.total_spent_cad?.toLocaleString() || 0} CAD
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {((results.budget_summary?.total_spent_cad / results.budget_summary?.allocated_budget_cad) * 100).toFixed(1)}% of ceiling
                  </p>
                </div>

                {/* 4. Protected Citizens */}
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Protected Citizens</span>
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <p className="font-bold text-purple-400 text-sm mt-0.5">
                    {results.social_impact_metrics?.beneficiaries_served?.toLocaleString() || 0}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    SVVI Impact: {results.social_impact_metrics?.vulnerability_reduction_impact_score || 0}
                  </p>
                </div>

              </div>

              {/* Priority Zones Deployment List */}
              {results.optimal_placements && results.optimal_placements.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <p className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Allocated Sectors Rendered On Map:</span>
                    <span className="text-cyan-400 text-[9px]">{results.optimal_placements.length} Zones</span>
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono pr-1">
                    {results.optimal_placements.map((alloc) => (
                      <div 
                        key={alloc.zone_id} 
                        className="flex justify-between items-center text-slate-300 bg-slate-900/70 hover:bg-slate-900 px-2.5 py-1 rounded border border-slate-800/80 transition"
                      >
                        <span className="font-medium text-slate-200">{alloc.zone_id}</span>
                        <div className="flex items-center gap-2">
                          {alloc.deploy_hepa_shelter && (
                            <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                              HEPA Hub
                            </span>
                          )}
                          {alloc.deploy_iot_sensor && (
                            <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                              IoT Node
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
