import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Satellite, Radio, Compass, ShieldAlert } from 'lucide-react';

// Controller to smoothly fly the camera between Delhi and Kamloops/BC
function MapController({ activeRegion }) {
  const map = useMap();

  useEffect(() => {
    if (activeRegion === 'canada') {
      // Kamloops, BC center, framed to show BC interior & coastal corridor
      map.flyTo([51.2, -121.2], 6, { duration: 1.8 });
    } else {
      // Delhi NCR center
      map.flyTo([28.630, 77.215], 11, { duration: 1.8 });
    }
  }, [activeRegion, map]);

  return null;
}

export default function MapView({ 
  geoData, 
  activeLayer, 
  onSelectWard, 
  selectedWard, 
  activeRegion = 'delhi',
  radarEnabled = true,
  onToggleRadar
}) {
  if (!geoData || !geoData.features) {
    return (
      <div className="h-full w-full flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
        Loading Earth Observation Geospatial Layers...
      </div>
    );
  }

  // Layer-based color categorization
  const getColor = (feature) => {
    const props = feature.properties;

    // 1. Overall Hazard / Priority Burden
    if (activeLayer === 'priority') {
      const score = props.pvd_priority_score || 50;
      if (score >= 85) return '#E11D48'; // Critical Red
      if (score >= 70) return '#EA580C'; // High Orange
      if (score >= 50) return '#CA8A04'; // Moderate Yellow
      if (score >= 30) return '#2563EB'; // Low Blue
      return '#10B981'; // Benchmark Green
    }

    // 2. Canadian Air Quality Health Index (AQHI)
    if (activeLayer === 'aqhi') {
      const aqhi = props.aqhi_score || 5;
      if (aqhi >= 8) return '#DC2626'; // High/Very High Risk Smog
      if (aqhi >= 6) return '#EA580C'; // Moderate-High
      if (aqhi >= 4) return '#FBBF24'; // Moderate
      return '#10B981'; // Low Risk
    }

    // 3. Sentinel-5P UV Aerosol Index (Wildfire Smoke Plumes)
    if (activeLayer === 'aerosol') {
      const ai = props.tropomi_aerosol_index || 0;
      if (ai >= 3.0) return '#7F1D1D'; // Dense Wildfire Smoke
      if (ai >= 2.0) return '#DC2626'; // Heavy Aerosols
      if (ai >= 1.0) return '#F59E0B'; // Moderate Smoke Inversion
      return '#059669'; // Clean Atmospheric Column
    }

    // 4. Tropospheric NO2 Column (TROPOMI)
    if (activeLayer === 'no2') {
      const no2 = props.tropomi_no2_umol || 30;
      if (no2 >= 75) return '#581C87'; // Severe Urban/Industrial NO2
      if (no2 >= 55) return '#7C3AED'; // High
      if (no2 >= 35) return '#0284C7'; // Moderate
      return '#10B981'; // Background Baseline
    }

    // 5. Ground Sensor Coverage Gap (km)
    if (activeLayer === 'gap') {
      const gap = props.ground_sensor_gap_km || 0;
      if (gap >= 35) return '#E11D48'; // Extreme Gap (>35km void, high ML downscaling need)
      if (gap >= 20) return '#EA580C'; // Moderate Gap
      if (gap >= 10) return '#FBBF24'; // Minor Gap
      return '#10B981'; // Immediate Ground Coverage (<10km)
    }

    // 6. Land Surface Temperature (LST)
    if (activeLayer === 'lst') {
      const temp = props.lst_temp_c || 35;
      if (temp >= 44) return '#DC2626';
      if (temp >= 40) return '#F97316';
      if (temp >= 36) return '#FBBF24';
      if (temp >= 32) return '#34D399';
      return '#059669';
    }

    // 7. Green Canopy (NDVI)
    if (activeLayer === 'ndvi') {
      const ndvi = props.ndvi_vegetation || 0.2;
      if (ndvi >= 0.50) return '#047857';
      if (ndvi >= 0.35) return '#10B981';
      if (ndvi >= 0.20) return '#FBBF24';
      if (ndvi >= 0.12) return '#F97316';
      return '#7F1D1D';
    }

    // 8. Air Quality (AQI PM2.5)
    if (activeLayer === 'aqi') {
      const aqi = props.aqi_pm25 || 200;
      if (aqi >= 380) return '#581C87';
      if (aqi >= 300) return '#7C3AED';
      if (aqi >= 200) return '#EA580C';
      if (aqi >= 150) return '#EAB308';
      return '#10B981';
    }

    // 9. Informal Settlements %
    if (activeLayer === 'informal') {
      const pct = props.informal_settlement_pct || 0;
      if (pct >= 60) return '#E11D48';
      if (pct >= 40) return '#EA580C';
      if (pct >= 20) return '#38BDF8';
      return '#10B981';
    }

    return '#EA580C';
  };

  const style = (feature) => {
    const isSelected = selectedWard && selectedWard.ward_id === feature.properties.ward_id;
    return {
      fillColor: getColor(feature),
      weight: isSelected ? 3.5 : 1.5,
      opacity: 1,
      color: isSelected ? '#FFFFFF' : '#1E293B',
      fillOpacity: isSelected ? 0.85 : 0.65,
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onSelectWard(feature.properties);
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.9,
          weight: 2.5
        });
      },
      mouseout: (e) => {
        const l = e.target;
        const isSelected = selectedWard && selectedWard.ward_id === feature.properties.ward_id;
        l.setStyle({
          fillOpacity: isSelected ? 0.85 : 0.65,
          weight: isSelected ? 3.5 : 1.5
        });
      }
    });
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* Sci-Fi Radar Sweep Overlay Animation */}
      {radarEnabled && (
        <div className="radar-sweep-beam opacity-25" />
      )}

      {/* Top HUD Telemetry Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={onToggleRadar}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border backdrop-blur-md transition-all shadow-lg ${
            radarEnabled 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10'
              : 'bg-slate-900/80 text-slate-400 border-slate-700'
          }`}
        >
          <Radio className={`h-3.5 w-3.5 ${radarEnabled ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '8s' }} />
          <span>{radarEnabled ? 'Radar Sweep ON' : 'Radar Sweep OFF'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] font-mono backdrop-blur-md">
          <Satellite className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>{activeRegion === 'canada' ? 'Sentinel-5P TROPOMI Orbit' : 'Landsat-9 Band 10 TIRS'}</span>
        </div>
      </div>

      <MapContainer
        center={activeRegion === 'canada' ? [51.2, -121.2] : [28.630, 77.215]}
        zoom={activeRegion === 'canada' ? 6 : 11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapController activeRegion={activeRegion} />

        {/* Clean OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key={`${activeRegion}-${activeLayer}-${selectedWard?.ward_id || 'none'}`}
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Dynamic Map Legend Floating Tag */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-xl px-3 py-2 text-[11px] text-slate-300 space-y-1 shadow-lg border border-slate-800 backdrop-blur-md">
        <p className="font-semibold text-white uppercase tracking-wider text-[10px]">
          {activeRegion === 'canada' ? '🇨🇦 Mitacs Layer: ' : 'Layer: '}
          <span className="text-amber-400">{activeLayer.toUpperCase()}</span>
        </p>

        {activeRegion === 'canada' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-600"></span>
              <span>Critical Wildfire Smog / Large Sensor Gap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
              <span>Low AQHI / Continuous Ground Station Monitored</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-600"></span>
              <span>Critical Burden (Informal Slum / Extreme Heat)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
              <span>Benchmark Safe (High Canopy / Affluent Green Belt)</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
