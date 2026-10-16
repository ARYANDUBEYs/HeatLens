import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MapViewer from './components/MapViewer';
import LayerControls from './components/LayerControls';
import ShelterSimulator from './components/ShelterSimulator';
import AttestationModal from './components/AttestationModal';
import { 
  fetchCorridorGrid, 
  triggerDownscale, 
  stampAttestation, 
  fetchHealth 
} from './services/api';
import { 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Loader2, 
  Satellite, 
  Layers, 
  Cpu, 
  Globe2, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

/**
 * HeatLens Master Single-Page GIS Application
 * Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (TRU Kamloops)
 * Lead Researcher: Rohit Singh
 */
export default function App() {
  // Global Application State
  const [activeCorridor, setActiveCorridor] = useState('kamloops');
  const [activeLayer, setActiveLayer] = useState('aqhi');
  const [gridData, setGridData] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Overlays State (Stations, Radar Sweep, Shelters)
  const [overlays, setOverlays] = useState({
    stations: true,
    radar: true,
    shelters: true
  });

  // Municipal Shelter Allocation Results for Map Rendering
  const [allocatedShelters, setAllocatedShelters] = useState([]);

  // Pipeline Loading, Backend State, & Web3 Modal
  const [loading, setLoading] = useState(true);
  const [isDownscaling, setIsDownscaling] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [lastAttestation, setLastAttestation] = useState(null);
  const [isAttestationOpen, setIsAttestationOpen] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Overlay Toggle Handler
  const handleToggleOverlay = (key) => {
    setOverlays((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check Backend Health on Mount
  useEffect(() => {
    async function checkHealth() {
      try {
        await fetchHealth();
        setBackendConnected(true);
      } catch (err) {
        console.warn("Backend health check failed:", err);
        setBackendConnected(false);
      }
    }
    checkHealth();
  }, []);

  // Fetch corridor GeoJSON grid on mount and corridor switch
  useEffect(() => {
    let isMounted = true;

    async function loadGrid() {
      setLoading(true);
      try {
        const data = await fetchCorridorGrid(activeCorridor, 35);
        if (isMounted) {
          setGridData(data);
          setBackendConnected(true);
          if (data.features && data.features.length > 0) {
            setSelectedCell(data.features[0].properties);
          }
        }
      } catch (err) {
        console.error("Failed to load corridor grid:", err);
        if (isMounted) {
          setErrorToast(`Unable to load ${activeCorridor.toUpperCase()} grid. Ensure FastAPI backend is running on port 8000.`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGrid();
    return () => { isMounted = false; };
  }, [activeCorridor]);

  // Execute full two-stage downscaling pipeline & Algorand state proof stamping
  const handleTriggerDownscale = async () => {
    setIsDownscaling(true);
    setErrorToast(null);
    try {
      // 1. Run Two-Stage Downscaler
      const result = await triggerDownscale(activeCorridor, {
        step_meters: 350.0,
        save_geotiff: true
      });
      
      // 2. Stamp State Proof on Algorand Testnet
      const stamp = await stampAttestation({
        raster_hash: result.raster_metadata.sha256_digest,
        corridor_id: activeCorridor,
        metadata: {
          peak_aqhi: result.downscaled_metrics.peak_aqhi_score,
          mean_pm25: result.downscaled_metrics.pm25_mean_ug_m3
        }
      });
      setLastAttestation(stamp);

      // 3. Refresh Interactive Map Grid
      const updatedGrid = await fetchCorridorGrid(activeCorridor, 35);
      setGridData(updatedGrid);
      if (updatedGrid.features && updatedGrid.features.length > 0) {
        setSelectedCell(updatedGrid.features[0].properties);
      }

      setSuccessToast(`30m Downscaling and Algorand Attestation succeeded for ${activeCorridor === 'kamloops' ? 'Kamloops Basin' : 'Delhi NCR'}!`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error("Downscale pipeline execution error:", err);
      setErrorToast("Downscale pipeline run encountered an error. Check backend logs.");
    } finally {
      setIsDownscaling(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1d] text-slate-100 relative selection:bg-cyan-500 selection:text-white">
      
      {/* 1. Header Navigation Bar */}
      <Header 
        activeCorridor={activeCorridor}
        onSelectCorridor={(cid) => {
          setActiveCorridor(cid);
          setSelectedCell(null);
          setAllocatedShelters([]);
        }}
        onOpenAttestation={() => setIsAttestationOpen(true)}
        isDownscaling={isDownscaling}
        onTriggerDownscale={handleTriggerDownscale}
        backendConnected={backendConnected}
      />

      {/* 2. Error & Success Toast Floating Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {errorToast && (
          <div className="pointer-events-auto p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-xs text-rose-200 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorToast}</span>
            </div>
            <button onClick={() => setErrorToast(null)} className="p-1 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {successToast && (
          <div className="pointer-events-auto p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-xs text-emerald-200 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="p-1 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-7xl mx-auto w-full">
        
        {/* Top Research Corridor Context Banner */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${activeCorridor === 'kamloops' ? 'bg-cyan-400' : 'bg-amber-400'} animate-ping`}></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeCorridor === 'kamloops'
                  ? '🇨🇦 Kamloops Basin Wildfire Smog & Valley Inversion Corridor'
                  : '🇮🇳 Delhi NCR Informal Urban Heat Equity Corridor'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {activeCorridor === 'kamloops'
                ? 'Mitacs GRI Project #53438 (TRU Kamloops): Fusing Copernicus Sentinel-5P TROPOMI & Landsat-9 TIRS Band 10 with Two-Stage Regression-Kriging downscaling to map 30m wildfire smoke entrapment.'
                : 'National Urban Resilience: Mapping micro-level 8°C–10°C thermal burdens and particulate sensor voids across dense informal wards.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Target CRS</p>
              <p className="font-bold text-cyan-400 text-xs sm:text-sm">{activeCorridor === 'kamloops' ? 'EPSG:32610' : 'EPSG:32643'}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Resolution</p>
              <p className="font-bold text-emerald-400 text-xs sm:text-sm">30m Grid</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400">Verification</p>
              <p className="font-bold text-purple-400 text-xs sm:text-sm">Algorand AVM</p>
            </div>
          </div>
        </div>

        {/* Floating Layer Controls HUD */}
        <LayerControls 
          activeLayer={activeLayer} 
          setActiveLayer={setActiveLayer}
          activeCorridor={activeCorridor}
          overlays={overlays}
          onToggleOverlay={handleToggleOverlay}
        />

        {/* Interactive GIS Map & Decision Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[670px] relative">
          
          {/* Left Column: Leaflet GIS Map Container (8 cols) */}
          <div className="lg:col-span-8 h-full relative">
            
            {/* Loading Overlay Spinner */}
            {(loading || isDownscaling) && (
              <div className="absolute inset-0 z-[500] rounded-3xl bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 text-center animate-in fade-in duration-200">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                  <Satellite className="h-6 w-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {isDownscaling ? 'Executing Two-Stage Regression-Kriging...' : 'Fetching Spatiotemporal Mesh...'}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm">
                    {isDownscaling 
                      ? 'Fitting XGBoost Deterministic Trend & Ordinary Kriging Semivariogram at 30m continuous ground resolution.'
                      : 'Rendering client quad polygons and overlay telemetry.'}
                  </p>
                </div>
              </div>
            )}

            <MapViewer 
              geoData={gridData}
              activeLayer={activeLayer}
              activeCorridor={activeCorridor}
              overlays={overlays}
              onToggleRadar={() => handleToggleOverlay('radar')}
              onSelectFeature={(props) => setSelectedCell(props)}
              selectedFeature={selectedCell}
              allocatedShelters={allocatedShelters}
            />
          </div>

          {/* Right Column: Telemetry Inspector & Municipal Planning Simulator (4 cols) */}
          <div className="lg:col-span-4 h-full space-y-4 overflow-y-auto max-h-[670px] pr-1">
            
            {/* Selected Cell Telemetry Card */}
            {selectedCell && (
              <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">Selected Mesh Quad #{selectedCell.cell_id}</span>
                    <h3 className="text-sm font-bold text-white">{selectedCell.risk_tier || 'MONITORED ZONE'}</h3>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    selectedCell.aqhi >= 7 
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' 
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    AQHI: {selectedCell.aqhi} / 10
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Ground PM2.5</p>
                    <p className="text-base font-bold font-mono text-white">
                      {selectedCell.pm25} <span className="text-[10px] font-normal text-slate-500">µg/m³</span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Inversion Lid (ISI)</p>
                    <p className="text-base font-bold font-mono text-amber-400">
                      {selectedCell.isi}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Sensor Void (SVVI)</p>
                    <p className="text-base font-bold font-mono text-purple-400">
                      {selectedCell.svvi}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Terrain Elevation</p>
                    <p className="text-base font-bold font-mono text-cyan-400">
                      {selectedCell.elevation || 350} m
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
                  <span>Regulatory Monitor Proximity:</span>
                  <span className="font-bold text-slate-200">{selectedCell.distance_km || 3.8} km away</span>
                </div>
              </div>
            )}

            {/* Municipal Decision Simulator (PuLP Mixed Integer Linear Program) */}
            <ShelterSimulator 
              activeCorridor={activeCorridor}
              onOptimized={(allocations) => setAllocatedShelters(allocations)}
            />

          </div>

        </div>

      </main>

      {/* 4. Algorand Cryptographic Attestation Modal */}
      <AttestationModal 
        isOpen={isAttestationOpen}
        onClose={() => setIsAttestationOpen(false)}
        lastAttestation={lastAttestation}
        activeCorridor={activeCorridor}
      />

    </div>
  );
}
