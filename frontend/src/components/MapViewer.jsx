import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, Satellite, Layers, ShieldCheck, Home, Cpu, Search, MapPin, Crosshair, X } from 'lucide-react';
import RadarSweep from './RadarSweep';

// Regulatory Ground Truth Stations Database (NAPS / ECCC in Kamloops; CPCB in Delhi)
const REGULATORY_STATIONS = {
  kamloops: [
    {
      station_id: 'ECCC_KM_01',
      name: 'Kamloops Downtown Federal Station',
      provider: 'ECCC / NAPS',
      latitude: 50.6745,
      longitude: -120.3273,
      elevation: 348.0,
      pm25: 42.5,
      aqhi: 5.2,
      status: 'ACTIVE_TELEMETRY'
    },
    {
      station_id: 'ECCC_KM_02',
      name: 'Kamloops North Shore Station',
      provider: 'ECCC / NAPS',
      latitude: 50.6912,
      longitude: -120.3541,
      elevation: 352.0,
      pm25: 58.2,
      aqhi: 6.8,
      status: 'ACTIVE_TELEMETRY'
    },
    {
      station_id: 'ECCC_KM_03',
      name: 'Thompson Rivers University Air Lab',
      provider: 'TRU Environmental Science',
      latitude: 50.6701,
      longitude: -120.3650,
      elevation: 435.0,
      pm25: 38.1,
      aqhi: 4.9,
      status: 'RESEARCH_BENCHMARK'
    },
    {
      station_id: 'ECCC_KM_04',
      name: 'Valleyview Inversion Site',
      provider: 'BC Ministry of Environment',
      latitude: 50.6651,
      longitude: -120.2612,
      elevation: 342.0,
      pm25: 84.7,
      aqhi: 8.9,
      status: 'CRITICAL_INVERSION'
    },
    {
      station_id: 'ECCC_KM_05',
      name: 'Rayleigh North Valley Sentinel',
      provider: 'ECCC / NAPS',
      latitude: 50.7812,
      longitude: -120.2981,
      elevation: 360.0,
      pm25: 92.4,
      aqhi: 9.4,
      status: 'WILDFIRE_HOTSPOT'
    }
  ],
  delhi: [
    {
      station_id: 'CPCB_DEL_01',
      name: 'Anand Vihar Monitoring Station',
      provider: 'CPCB NAQI',
      latitude: 28.6469,
      longitude: 77.3160,
      elevation: 215.0,
      pm25: 210.0,
      aqhi: 10.0,
      status: 'SEVERE_HAZARD'
    },
    {
      station_id: 'CPCB_DEL_02',
      name: 'R K Puram NAQI Lab',
      provider: 'CPCB NAQI',
      latitude: 28.5630,
      longitude: 77.1860,
      elevation: 228.0,
      pm25: 165.0,
      aqhi: 8.5,
      status: 'ACTIVE_TELEMETRY'
    },
    {
      station_id: 'CPCB_DEL_03',
      name: 'Punjabi Bagh Urban Sensor',
      provider: 'CPCB NAQI',
      latitude: 28.6740,
      longitude: 77.1310,
      elevation: 218.0,
      pm25: 190.0,
      aqhi: 9.2,
      status: 'ACTIVE_TELEMETRY'
    },
    {
      station_id: 'CPCB_DEL_04',
      name: 'Shadipur Central Feeder',
      provider: 'CPCB NAQI',
      latitude: 28.6510,
      longitude: 77.1580,
      elevation: 216.0,
      pm25: 178.0,
      aqhi: 8.9,
      status: 'ACTIVE_TELEMETRY'
    },
    {
      station_id: 'CPCB_DEL_05',
      name: 'Bawana Industrial Perimeter',
      provider: 'CPCB NAQI',
      latitude: 28.7950,
      longitude: 77.0420,
      elevation: 222.0,
      pm25: 260.0,
      aqhi: 10.5,
      status: 'CRITICAL_HAZARD'
    },
    {
      station_id: 'CPCB_DEL_06',
      name: 'Okhla Phase-II Monitoring',
      provider: 'CPCB NAQI',
      latitude: 28.5310,
      longitude: 77.2710,
      elevation: 214.0,
      pm25: 185.0,
      aqhi: 9.1,
      status: 'ACTIVE_TELEMETRY'
    },
    {
      station_id: 'CPCB_DEL_07',
      name: 'Jahangirpuri Informal Cluster',
      provider: 'CPCB NAQI',
      latitude: 28.7320,
      longitude: 77.1700,
      elevation: 219.0,
      pm25: 235.0,
      aqhi: 10.2,
      status: 'HIGH_THERMAL_BURDEN'
    },
    {
      station_id: 'CPCB_DEL_08',
      name: 'Mandir Marg Central',
      provider: 'CPCB NAQI',
      latitude: 28.6360,
      longitude: 77.1990,
      elevation: 220.0,
      pm25: 142.0,
      aqhi: 7.8,
      status: 'ACTIVE_TELEMETRY'
    }
  ]
};

// Spatial Index of Key Landmarks & Neighborhoods for GIS Quick-Navigation
const CORRIDOR_LANDMARKS = {
  kamloops: [
    { name: 'TRU Air Lab (Thompson Rivers University)', type: 'Mitacs GRI #53438 Research HQ', lat: 50.6701, lon: -120.3650 },
    { name: 'Downtown Kamloops Federal Station', type: 'ECCC NAPS Ground Truth Monitor', lat: 50.6745, lon: -120.3273 },
    { name: 'Kamloops North Shore Station', type: 'ECCC Urban Inversion Sentinel', lat: 50.6912, lon: -120.3541 },
    { name: 'Valleyview Inversion Basin', type: 'Critical Valley Trapping Hotspot', lat: 50.6651, lon: -120.2612 },
    { name: 'Rayleigh North Valley Sentinel', type: 'Wildfire Smoke Entry Gateway', lat: 50.7812, lon: -120.2981 },
    { name: 'Sahali Ridge Plateau', type: 'Elevated Boundary Layer Site (510m)', lat: 50.6580, lon: -120.3520 },
    { name: 'Mount Dufferin High Plains', type: 'Topographical Crest (580m)', lat: 50.6520, lon: -120.3950 },
    { name: 'Dallas East Thompson Corridor', type: 'Downwind Wildfire Accumulation', lat: 50.6500, lon: -120.1800 }
  ],
  delhi: [
    { name: 'Anand Vihar Monitoring Hub', type: 'CPCB NAQI Critical Hazard Zone', lat: 28.6469, lon: 77.3160 },
    { name: 'Bawana Industrial Perimeter', type: 'High Industrial Thermal Burden', lat: 28.7950, lon: 77.0420 },
    { name: 'Jahangirpuri Informal Cluster', type: 'Sensor Void Vulnerability (SVVI 0.89)', lat: 28.7320, lon: 77.1700 },
    { name: 'R K Puram Environmental Station', type: 'CPCB Baseline Ground Truth', lat: 28.5630, lon: 77.1860 },
    { name: 'Punjabi Bagh Urban Node', type: 'CPCB Telemetry Monitor', lat: 28.6740, lon: 77.1310 },
    { name: 'Okhla Phase-II Industrial', type: 'Thermal Island & Particulate Hotspot', lat: 28.5310, lon: 77.2710 },
    { name: 'Shadipur Central Feeder', type: 'High Density Urban Corridor', lat: 28.6510, lon: 77.1580 },
    { name: 'Connaught Place Commercial Core', type: 'Central Urban Benchmark', lat: 28.6315, lon: 77.2167 }
  ]
};

// 1. Custom SVG DivIcon for Regulatory Ground Stations (ECCC / CPCB)
const createStationIcon = (station) => {
  return L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(6, 182, 212, 0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #090e1a; border: 2px solid #06b6d4; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(6, 182, 212, 0.85);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
            <circle cx="12" cy="12" r="2.5" fill="#38bdf8"/>
            <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
            <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

// 2. Custom SVG DivIcon for Allocated Clean-Air HEPA Shelters ($7,500 CAD) - Cyan Shield Icon
const createShelterIcon = () => {
  return L.divIcon({
    className: 'custom-shelter-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 8px; background: rgba(6, 182, 212, 0.35); animation: pulse 2s infinite;"></div>
        <div style="position: relative; width: 24px; height: 24px; border-radius: 8px; background: #082f49; border: 2px solid #06b6d4; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(6, 182, 212, 0.9);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

// 3. Custom SVG DivIcon for Allocated IoT Kriging Sensor Nodes ($850 CAD) - Amber Pulse Icon
const createSensorIcon = () => {
  return L.divIcon({
    className: 'custom-sensor-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
        <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(245, 158, 11, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; background: #451a03; border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" fill="#fcd34d"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Map Controller for smooth corridor transitions and targeted landmark navigation
function MapController({ activeCorridor, flyTarget }) {
  const map = useMap();

  useEffect(() => {
    if (flyTarget && flyTarget.lat && flyTarget.lon) {
      map.flyTo([flyTarget.lat, flyTarget.lon], flyTarget.zoom || 14, { duration: 1.5 });
      return;
    }

    if (activeCorridor === 'kamloops') {
      // Kamloops Corridor: Center [50.6745, -120.3273], zoom 11
      map.flyTo([50.6745, -120.3273], 11, { duration: 1.6 });
    } else {
      // Delhi NCR Corridor: Center [28.6139, 77.2090], zoom 11
      map.flyTo([28.6139, 77.2090], 11, { duration: 1.6 });
    }
  }, [activeCorridor, flyTarget, map]);

  return null;
}

export default function MapViewer({
  geoData,
  activeLayer = 'aqhi',
  activeCorridor = 'kamloops',
  overlays = { stations: true, radar: true, shelters: true },
  radarEnabled = true,
  onToggleRadar,
  onSelectFeature,
  selectedFeature,
  allocatedShelters = []
}) {
  // Support both unified overlays object and fallback direct props
  const isRadarOn = overlays?.radar !== undefined ? overlays.radar : radarEnabled;
  const isStationsOn = overlays?.stations !== undefined ? overlays.stations : true;
  const isSheltersOn = overlays?.shelters !== undefined ? overlays.shelters : true;

  // GIS Search & Landmark Navigator States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchStatus, setSearchStatus] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  // Reset search when corridor changes
  useEffect(() => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setSearchStatus(null);
    setFlyTarget(null);
  }, [activeCorridor]);

  // Current corridor landmarks
  const corridorLandmarks = useMemo(() => {
    return CORRIDOR_LANDMARKS[activeCorridor] || CORRIDOR_LANDMARKS.kamloops;
  }, [activeCorridor]);

  // Filtered landmarks based on user query
  const filteredLandmarks = useMemo(() => {
    if (!searchQuery.trim()) return corridorLandmarks;
    const q = searchQuery.toLowerCase();
    return corridorLandmarks.filter(
      l => l.name.toLowerCase().includes(q) || l.type.toLowerCase().includes(q)
    );
  }, [corridorLandmarks, searchQuery]);

  // Nearest quad feature finder to sync telemetry panel
  const findClosestFeature = (lat, lon) => {
    if (!geoData || !geoData.features || geoData.features.length === 0) return null;
    let closest = null;
    let minDistance = Infinity;
    for (const f of geoData.features) {
      const p = f.properties || {};
      if (p.center_lat && p.center_lon) {
        const d = Math.hypot(p.center_lat - lat, p.center_lon - lon);
        if (d < minDistance) {
          minDistance = d;
          closest = p;
        }
      }
    }
    return closest;
  };

  const handleSelectLandmark = (item) => {
    setFlyTarget({ lat: item.lat, lon: item.lon, zoom: 14 });
    setSearchQuery(item.name);
    setIsSearchOpen(false);

    const closest = findClosestFeature(item.lat, item.lon);
    if (closest && onSelectFeature) {
      onSelectFeature(closest);
    }
    setSearchStatus(`Target Locked: ${item.name}`);
    setTimeout(() => setSearchStatus(null), 4000);
  };

  const handleGlobalSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query matches local landmark
    const match = corridorLandmarks.find(l =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      handleSelectLandmark(match);
      return;
    }

    // Otherwise geocode via OpenStreetMap Nominatim
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setFlyTarget({ lat, lon, zoom: 12 });
        setIsSearchOpen(false);

        const closest = findClosestFeature(lat, lon);
        if (closest && onSelectFeature) {
          onSelectFeature(closest);
          setSearchStatus(`Acquired: ${data[0].display_name.split(',')[0]} (In Corridor)`);
        } else {
          setSearchStatus(`Geocoded: ${data[0].display_name.split(',')[0]} (Outside active corridor)`);
        }
        setTimeout(() => setSearchStatus(null), 5000);
      } else {
        setSearchStatus("Location not found in geospatial index");
        setTimeout(() => setSearchStatus(null), 3000);
      }
    } catch (err) {
      console.warn("Geocoding error:", err);
      setSearchStatus("Geocoding service unavailable");
      setTimeout(() => setSearchStatus(null), 3000);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Active Corridor Stations
  const corridorStations = useMemo(() => {
    return REGULATORY_STATIONS[activeCorridor] || REGULATORY_STATIONS.kamloops;
  }, [activeCorridor]);

  // Color & Opacity classifier based on active physical layer
  const getCellVisuals = (feature) => {
    const props = feature.properties || {};

    // 1. Canadian Air Quality Health Index (AQHI: 1 to 10+)
    if (activeLayer === 'aqhi') {
      const val = props.aqhi ?? 5.0;
      if (val >= 9.0) return { fill: '#7f1d1d', opacity: 0.85 }; // Acute Emergency Maroon
      if (val >= 7.0) return { fill: '#dc2626', opacity: 0.75 }; // High Wildfire Smog
      if (val >= 4.0) return { fill: '#f59e0b', opacity: 0.65 }; // Moderate Amber
      return { fill: '#10b981', opacity: 0.55 };                 // Clean Baseline Emerald
    }

    // 2. Inversion Severity Index (ISI: 0.0 to 1.0)
    if (activeLayer === 'isi') {
      const val = props.isi ?? 0.0;
      if (val >= 0.75) return { fill: '#ef4444', opacity: 0.85 }; // Severe Valley Trapping Cap
      if (val >= 0.50) return { fill: '#f97316', opacity: 0.75 }; // Moderate Inversion
      if (val >= 0.25) return { fill: '#eab308', opacity: 0.60 }; // Weak Inversion
      return { fill: '#06b6d4', opacity: 0.50 };                  // Cool Cyan Free Convection
    }

    // 3. Sensor Void Vulnerability Index (SVVI: 0.0 to 1.0)
    if (activeLayer === 'svvi') {
      const val = props.svvi ?? 0.0;
      if (val >= 0.80) return { fill: '#c026d3', opacity: 0.85 }; // Critical Epistemic Blindspot
      if (val >= 0.60) return { fill: '#e11d48', opacity: 0.70 }; // High Void Priority
      if (val >= 0.40) return { fill: '#f59e0b', opacity: 0.55 }; // Moderate Void
      return { fill: '#3b82f6', opacity: 0.35 };                  // Dense Station Coverage
    }

    // 4. Downscaled Ground PM2.5 (ug/m3)
    if (activeLayer === 'pm25') {
      const val = props.pm25 ?? 30.0;
      if (val >= 150.0) return { fill: '#581c87', opacity: 0.85 }; // Hazardous Purple
      if (val >= 90.0) return { fill: '#dc2626', opacity: 0.75 };  // Acute Red
      if (val >= 50.0) return { fill: '#ea580c', opacity: 0.65 };  // Unhealthy Orange
      if (val >= 25.0) return { fill: '#f59e0b', opacity: 0.55 };  // Moderate Yellow
      return { fill: '#10b981', opacity: 0.45 };                   // Clean Green
    }

    return { fill: '#06b6d4', opacity: 0.55 };
  };

  // Polygon styling function
  const style = (feature) => {
    const isSelected = selectedFeature && selectedFeature.cell_id === feature.properties.cell_id;
    const { fill, opacity } = getCellVisuals(feature);

    return {
      fillColor: fill,
      fillOpacity: isSelected ? Math.min(opacity + 0.25, 0.95) : opacity,
      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.16)',
      weight: isSelected ? 3.0 : 0.9,
      dashArray: isSelected ? '4 2' : undefined
    };
  };

  // Interaction & Hover Tooltip
  const onEachFeature = (feature, layer) => {
    const p = feature.properties || {};

    layer.on({
      click: () => {
        if (onSelectFeature) onSelectFeature(p);
      },
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: 0.92,
          weight: 2.5,
          color: '#38bdf8'
        });
      },
      mouseout: (e) => {
        const target = e.target;
        const isSelected = selectedFeature && selectedFeature.cell_id === p.cell_id;
        const { opacity } = getCellVisuals(feature);
        target.setStyle({
          fillOpacity: isSelected ? Math.min(opacity + 0.25, 0.95) : opacity,
          weight: isSelected ? 3.0 : 0.9,
          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.16)',
          dashArray: isSelected ? '4 2' : undefined
        });
      }
    });

    // Hover Tooltip with requested metrics
    const coordsStr = `${p.center_lat?.toFixed(4)}, ${p.center_lon?.toFixed(4)}`;
    layer.bindTooltip(`
      <div style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; color: #f1f5f9; background: #0b1120; padding: 7px 9px; border-radius: 10px; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.85); min-width: 175px;">
        <div style="font-weight: 700; color: #38bdf8; margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
          <span>Quad Cell #${p.cell_id}</span>
          <span style="font-size: 9px; padding: 1px 4px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3);">${p.risk_tier || 'MONITORED'}</span>
        </div>
        <div style="color: #64748b; font-size: 10px; margin-bottom: 5px;">📍 ${coordsStr}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
          <div><span style="color: #94a3b8;">AQHI:</span> <b style="color: ${p.aqhi >= 7 ? '#f43f5e' : '#10b981'};">${p.aqhi} / 10</b></div>
          <div><span style="color: #94a3b8;">PM2.5:</span> <b style="color: #38bdf8;">${p.pm25} µg</b></div>
          <div><span style="color: #94a3b8;">Inversion:</span> <b style="color: #fbbf24;">${p.isi}</b></div>
          <div><span style="color: #94a3b8;">Void (SVVI):</span> <b style="color: #c084fc;">${p.svvi}</b></div>
        </div>
        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #1e293b; font-size: 10px; color: #cbd5e1; display: flex; justify-content: space-between;">
          <span style="color: #94a3b8;">Nearest Station:</span>
          <b>${p.distance_km ?? 3.5} km away</b>
        </div>
      </div>
    `, { sticky: true, className: 'heatlens-custom-tooltip' });
  };

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl relative bg-[#060a14]">
      
      {/* High-Tech Animated Radar Sweep & Satellite Swath Overlay */}
      <RadarSweep active={isRadarOn} corridor={activeCorridor} />

      {/* Top Left: Smart GIS Landmark & Geocoding Search HUD */}
      <div className="absolute top-4 left-4 z-[1000] w-72 sm:w-80">
        <form onSubmit={handleGlobalSearch} className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl focus-within:border-cyan-500/80 transition-all">
            <Search className="h-4 w-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={activeCorridor === 'kamloops' ? "Search Kamloops (e.g. TRU, Valleyview)..." : "Search Delhi (e.g. Anand Vihar, Bawana)..."}
              className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {isGeocoding && (
              <div className="h-3.5 w-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
            )}
          </div>
        </form>

        {/* Search Status Toast */}
        {searchStatus && (
          <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span className="truncate">{searchStatus}</span>
          </div>
        )}

        {/* Dropdown Suggestions */}
        {isSearchOpen && (
          <div className="mt-2 rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1">
            <div className="p-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>CORRIDOR LANDMARKS & STATIONS</span>
              <span className="text-cyan-400">{filteredLandmarks.length} nodes</span>
            </div>
            <div className="p-1 space-y-0.5">
              {filteredLandmarks.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLandmark(item)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-500/10 flex items-start justify-between gap-2 transition group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span>{item.name}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.type}</p>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 shrink-0 mt-0.5">
                    {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                  </span>
                </button>
              ))}
              {filteredLandmarks.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400">
                  <p>No local landmark match.</p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-1">Press [Enter] to geocode globally via OSM</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Map HUD Controls Badges */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <button
          onClick={onToggleRadar}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-lg border ${
            isRadarOn
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10'
              : 'bg-slate-900/85 text-slate-400 border-slate-800'
          }`}
        >
          <Radio className={`h-3.5 w-3.5 ${isRadarOn ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '7s' }} />
          <span>{isRadarOn ? 'Radar Active' : 'Radar Off'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono backdrop-blur-md shadow-lg">
          <Satellite className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>{activeCorridor === 'kamloops' ? 'Sentinel-5P TROPOMI & Landsat-9' : 'Landsat-8 & TROPOMI'}</span>
        </div>
      </div>

      {/* Core Leaflet Container */}
      <MapContainer
        center={activeCorridor === 'kamloops' ? [50.6745, -120.3273] : [28.6139, 77.2090]}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapController activeCorridor={activeCorridor} flyTarget={flyTarget} />

        {/* High-Performance CartoDB Dark Matter Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* 1. Downscaled GeoJSON Polygon Grid Layer */}
        {geoData && geoData.features && (
          <GeoJSON
            key={`${activeCorridor}-${activeLayer}-${geoData.features.length}`}
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}

        {/* 2. Ground Regulatory Stations (ECCC / CPCB) */}
        {isStationsOn && corridorStations.map((station) => (
          <Marker
            key={station.station_id}
            position={[station.latitude, station.longitude]}
            icon={createStationIcon(station)}
          >
            <Popup className="heatlens-custom-popup">
              <div className="p-1 font-mono text-xs text-slate-200 min-w-[200px] space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                  <span className="font-bold text-cyan-400">{station.station_id}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{station.status}</span>
                </div>
                <p className="font-sans font-bold text-slate-100 text-[13px]">{station.name}</p>
                <p className="text-[11px] text-slate-400">{station.provider}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Current PM2.5</span>
                    <p className="font-bold text-cyan-300">{station.pm25} µg/m³</p>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">AQHI Score</span>
                    <p className="font-bold text-rose-400">{station.aqhi} / 10</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">Elevation: {station.elevation} m MSL</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Allocated Clean-Air Shelters & IoT Mesh (PuLP ILP Output) */}
        {isSheltersOn && allocatedShelters && allocatedShelters.map((alloc) => {
          const isShelter = alloc.deploy_hepa_shelter;
          const isSensor = alloc.deploy_iot_sensor;
          if (!isShelter && !isSensor) return null;

          return (
            <Marker
              key={`alloc-${alloc.zone_id}`}
              position={[alloc.latitude, alloc.longitude]}
              icon={isShelter ? createShelterIcon() : createSensorIcon()}
            >
              <Popup className="heatlens-custom-popup">
                <div className="p-1 font-mono text-xs text-slate-200 min-w-[200px] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold border-b border-slate-700 pb-1">
                    {isShelter ? <ShieldCheck className="h-4 w-4 text-cyan-400" /> : <Radio className="h-4 w-4 text-amber-400" />}
                    <span>{isShelter ? 'Municipal HEPA Shelter' : 'IoT Sensor Node'}</span>
                  </div>
                  <p className="text-white font-bold">{alloc.zone_id}</p>
                  <p className="text-slate-400 text-[11px]">Population: {alloc.population?.toLocaleString()} residents</p>
                  <p className="text-purple-400 text-[11px]">Vulnerability SVVI: {alloc.svvi_score}</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded border ${
                    isShelter 
                      ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' 
                      : 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    {isShelter ? '$7,500 CAD Filtration Hub' : '$850 CAD IoT Node'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>

    </div>
  );
}
