import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

export default function MapView({ geoData, activeLayer, onSelectWard, selectedWard }) {
  if (!geoData || !geoData.features) {
    return (
      <div className="h-full w-full flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
        Loading Delhi NCR Geospatial Layers...
      </div>
    );
  }

  // Color functions based on active layer
  const getColor = (feature) => {
    const props = feature.properties;

    if (activeLayer === 'priority') {
      const score = props.pvd_priority_score || 50;
      if (score >= 85) return '#E11D48'; // Critical Red
      if (score >= 70) return '#EA580C'; // High Orange
      if (score >= 50) return '#CA8A04'; // Moderate Yellow
      if (score >= 30) return '#2563EB'; // Low Blue
      return '#10B981'; // Benchmark Green
    }

    if (activeLayer === 'lst') {
      const temp = props.lst_temp_c || 38;
      if (temp >= 44) return '#DC2626';
      if (temp >= 41) return '#F97316';
      if (temp >= 38) return '#FBBF24';
      if (temp >= 35) return '#34D399';
      return '#059669';
    }

    if (activeLayer === 'ndvi') {
      const ndvi = props.ndvi_vegetation || 0.2;
      if (ndvi >= 0.50) return '#047857'; // High green
      if (ndvi >= 0.35) return '#10B981';
      if (ndvi >= 0.20) return '#FBBF24';
      if (ndvi >= 0.12) return '#F97316';
      return '#7F1D1D'; // Deficit
    }

    if (activeLayer === 'aqi') {
      const aqi = props.aqi_pm25 || 200;
      if (aqi >= 380) return '#581C87'; // Severe Maroon/Purple
      if (aqi >= 300) return '#7C3AED'; // Very Poor
      if (aqi >= 200) return '#EA580C'; // Poor
      if (aqi >= 150) return '#EAB308'; // Moderate
      return '#10B981'; // Good
    }

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
      <MapContainer
        center={[28.630, 77.215]} // Delhi NCR Center
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Clean OpenStreetMap Tiles (100% Free, No API Key Watermark!) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key={`${activeLayer}-${selectedWard?.ward_id || 'none'}`}
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Map Legend Floating Tag */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-xl px-3 py-2 text-[11px] text-slate-300 space-y-1 shadow-lg border border-slate-800">
        <p className="font-semibold text-white uppercase tracking-wider text-[10px]">Layer: {activeLayer.toUpperCase()}</p>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-600"></span>
          <span>Critical Burden (Informal Slum / Extreme Heat)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
          <span>Benchmark Safe (High Canopy / Affluent)</span>
        </div>
      </div>
    </div>
  );
}
