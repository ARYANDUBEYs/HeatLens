import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KpiBar from './components/KpiBar';
import MapViewer from './components/MapViewer';
import WardInspector from './components/WardInspector';
import ChatAssistant from './components/ChatAssistant';
import ScienceModal from './components/ScienceModal';

export default function App() {
  const [wardGeoJSON, setWardGeoJSON] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [highlightedWards, setHighlightedWards] = useState([]);
  const [activeLayer, setActiveLayer] = useState('vulnerability');
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [azureStatus, setAzureStatus] = useState(null);
  const [chatPrompt, setChatPrompt] = useState(null);

  // Load GeoJSON and Stats on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        // 1. Fetch GeoJSON
        let geoData = null;
        try {
          const res = await fetch('/api/ward-boundaries');
          if (res.ok) geoData = await res.json();
        } catch {
          // Fallback to static public file
        }
        if (!geoData) {
          const res = await fetch('/data/delhi_ward_boundaries.geojson');
          if (res.ok) geoData = await res.json();
        }
        if (geoData) {
          setWardGeoJSON(geoData);
          if (geoData.features && geoData.features.length > 0) {
            setSelectedWard(geoData.features[0].properties);
          }
        }

        // 2. Fetch Stats
        let statsData = null;
        try {
          const res = await fetch('/api/stats');
          if (res.ok) statsData = await res.json();
        } catch {
          // Fallback to static public file
        }
        if (!statsData) {
          const res = await fetch('/data/delhi_ward_scores.json');
          if (res.ok) {
            const raw = await res.json();
            statsData = {
              city: raw.city,
              date: raw.date,
              total_wards: raw.total_wards,
              max_lst_celsius: 49.1,
              avg_lst_celsius: 43.5,
              thermal_disparity_celsius: 12.2,
              hottest_ward: { name: "Okhla Industrial Area", lst: 49.1 },
              coolest_ward: { name: "Vasant Kunj & Ridge", lst: 36.9 },
              avg_ndvi: 0.24,
              risk_breakdown: {
                high: raw.high_risk_count,
                medium: raw.medium_risk_count,
                low: raw.low_risk_count
              }
            };
          }
        }
        if (statsData) setStats(statsData);

        // 3. Fetch Health / Azure status
        try {
          const res = await fetch('/api/health');
          if (res.ok) {
            const h = await res.json();
            setAzureStatus(h);
          }
        } catch {
          // Backend offline or local static mode
        }

      } catch (err) {
        console.error("[HeatLens] Initialization failed:", err);
      }
    }

    loadInitialData();
  }, []);

  const handleAskAboutWard = (ward) => {
    setChatPrompt(`Tell me about heat vulnerability in ${ward.ward_name} and recommended mitigations.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenScience={() => setIsScienceOpen(true)} azureStatus={azureStatus} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* KPI Summary */}
        <KpiBar stats={stats} />

        {/* Core Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left/Center: Geospatial Map View (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <MapViewer
              wardGeoJSON={wardGeoJSON}
              selectedWard={selectedWard}
              onSelectWard={setSelectedWard}
              highlightedWards={highlightedWards}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
            />

            {/* Selected Ward Telemetry on larger screens */}
            <div className="block lg:hidden">
              <WardInspector
                ward={selectedWard}
                onAskAboutWard={handleAskAboutWard}
              />
            </div>
          </div>

          {/* Right: AI Assistant & Ward Inspector (5 columns) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="hidden lg:block">
              <WardInspector
                ward={selectedWard}
                onAskAboutWard={handleAskAboutWard}
              />
            </div>

            <ChatAssistant
              onHighlightWards={setHighlightedWards}
              onSelectWardByName={(name) => {
                const found = wardGeoJSON?.features?.find(f => f.properties.ward_name === name);
                if (found) setSelectedWard(found.properties);
              }}
              prefilledPrompt={chatPrompt}
            />
          </div>

        </div>
      </main>

      <ScienceModal isOpen={isScienceOpen} onClose={() => setIsScienceOpen(false)} />
    </div>
  );
}
