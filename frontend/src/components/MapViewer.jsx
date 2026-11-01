import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layers, MapPin, ZoomIn, ZoomOut, RotateCcw, AlertCircle, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export default function MapViewer({
  wardGeoJSON,
  selectedWard,
  onSelectWard,
  highlightedWards = [],
  activeLayer = 'vulnerability', // 'vulnerability' | 'lst' | 'ndvi' | 'cooling'
  onChangeLayer
}) {
  const [hoveredWard, setHoveredWard] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Compute bounding box for Delhi NCR features
  const { minLng, maxLng, minLat, maxLat } = useMemo(() => {
    if (!wardGeoJSON || !wardGeoJSON.features || wardGeoJSON.features.length === 0) {
      return { minLng: 76.9, maxLng: 77.4, minLat: 28.45, maxLat: 28.9 };
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    wardGeoJSON.features.forEach(f => {
      const coords = f.geometry.coordinates[0];
      coords.forEach(([lng, lat]) => {
        if (lng < minX) minX = lng;
        if (lng > maxX) maxX = lng;
        if (lat < minY) minY = lat;
        if (lat > maxY) maxY = lat;
      });
    });
    // Add 10% padding
    const pX = (maxX - minX) * 0.08;
    const pY = (maxY - minY) * 0.08;
    return { minLng: minX - pX, maxLng: maxX + pX, minLat: minY - pY, maxLat: maxY + pY };
  }, [wardGeoJSON]);

  // Project geographic coordinates [lng, lat] to SVG viewBox [800 x 600]
  const project = (lng, lat) => {
    const svgW = 800;
    const svgH = 600;
    const x = ((lng - minLng) / (maxLng - minLng)) * svgW;
    // Invert Y for screen coordinates
    const y = svgH - (((lat - minLat) / (maxLat - minLat)) * svgH);
    return [x, y];
  };

  // Color functions based on active layer
  const getFeatureColor = (feature) => {
    const p = feature.properties;

    if (activeLayer === 'vulnerability') {
      const score = p.vulnerability_score || 0;
      if (score >= 0.70) return '#ef4444'; // High Risk (Red)
      if (score >= 0.40) return '#f59e0b'; // Medium Risk (Yellow/Orange)
      return '#10b981'; // Low Risk (Green)
    }

    if (activeLayer === 'lst') {
      const lst = p.lst_celsius || 40;
      // 36°C (coolest) to 50°C (hottest)
      const ratio = Math.max(0, Math.min(1, (lst - 36) / 14));
      if (ratio > 0.8) return '#b91c1c'; // extreme dark red
      if (ratio > 0.6) return '#ef4444'; // red
      if (ratio > 0.4) return '#f97316'; // orange
      if (ratio > 0.2) return '#eab308'; // yellow
      return '#22c55e'; // green
    }

    if (activeLayer === 'ndvi') {
      const ndvi = p.ndvi || 0.2;
      // High NDVI is good/green, low NDVI is concrete/grey-brown
      if (ndvi >= 0.45) return '#059669'; // dense green
      if (ndvi >= 0.30) return '#10b981'; // moderate green
      if (ndvi >= 0.18) return '#d97706'; // sparse
      return '#78350f'; // bare soil / concrete
    }

    if (activeLayer === 'cooling') {
      const needed = p.recommended_cooling_centers || 0;
      if (needed >= 2) return '#dc2626'; // critical deficit
      if (needed === 1) return '#f59e0b'; // moderate deficit
      return '#3b82f6'; // well-covered
    }

    return '#3b82f6';
  };

  // Drag pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl flex flex-col">
      
      {/* Top Map Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-300">Layer:</span>
          <select
            value={activeLayer}
            onChange={(e) => onChangeLayer(e.target.value)}
            className="bg-slate-800 text-xs font-semibold text-slate-100 rounded-lg px-2 py-1 outline-none border border-slate-700 cursor-pointer hover:border-slate-500"
          >
            <option value="vulnerability">Composite AHP Vulnerability</option>
            <option value="lst">Radiometric LST (°C)</option>
            <option value="ndvi">Sentinel-2 NDVI (Vegetation)</option>
            <option value="cooling">Cooling Center Deficit</option>
          </select>
        </div>

        <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg hidden sm:flex items-center gap-2 text-xs text-slate-300">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Delhi NCR (28.61° N, 77.20° E)</span>
        </div>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
          title="Zoom In"
          className="p-2 rounded-xl glass-panel hover:bg-slate-800 border border-slate-700 text-slate-200 transition shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
          title="Zoom Out"
          className="p-2 rounded-xl glass-panel hover:bg-slate-800 border border-slate-700 text-slate-200 transition shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset Center"
          className="p-2 rounded-xl glass-panel hover:bg-slate-800 border border-slate-700 text-slate-200 transition shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Visualizer */}
      <div
        className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden bg-slate-950 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          className="w-full h-full"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <defs>
            {/* Grid pattern for background */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            {/* Radial glow around selected ward */}
            <radialGradient id="highRiskGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Ward Polygon Features */}
          {wardGeoJSON?.features?.map((feature) => {
            const coords = feature.geometry.coordinates[0];
            const pathData = coords
              .map(([lng, lat], i) => {
                const [x, y] = project(lng, lat);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ') + ' Z';

            const isSelected = selectedWard?.ward_id === feature.properties.ward_id;
            const isHovered = hoveredWard?.ward_id === feature.properties.ward_id;
            const isHighlighted = highlightedWards.some(
              hw => hw.ward_name === feature.properties.ward_name || hw.ward_id === feature.properties.ward_id || hw.ward === feature.properties.ward_name
            );

            const fillColor = getFeatureColor(feature);

            return (
              <g key={feature.properties.ward_id}>
                <path
                  d={pathData}
                  fill={fillColor}
                  fillOpacity={isSelected ? 0.9 : isHighlighted ? 0.85 : isHovered ? 0.8 : 0.6}
                  stroke={isSelected ? '#38bdf8' : isHighlighted ? '#facc15' : isHovered ? '#ffffff' : '#1e293b'}
                  strokeWidth={isSelected ? 3 : isHighlighted ? 2.5 : isHovered ? 2 : 1}
                  className="transition-all duration-150 cursor-pointer hover:filter hover:brightness-125"
                  onMouseEnter={() => setHoveredWard(feature.properties)}
                  onMouseLeave={() => setHoveredWard(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWard(feature.properties);
                  }}
                />

                {/* Ward Label */}
                {(() => {
                  // Centroid approximation
                  let sumX = 0, sumY = 0;
                  coords.forEach(([lng, lat]) => {
                    const [px, py] = project(lng, lat);
                    sumX += px;
                    sumY += py;
                  });
                  const cx = sumX / coords.length;
                  const cy = sumY / coords.length;

                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? '#38bdf8' : '#ffffff'}
                      fontSize={isSelected ? '11' : '9'}
                      fontWeight={isSelected ? '700' : '600'}
                      className="pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                    >
                      {feature.properties.ward_name}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* AI Recommended Intervention Pins */}
          {highlightedWards.map((hw, idx) => {
            const matchedFeature = wardGeoJSON?.features?.find(
              f => f.properties.ward_name === (hw.ward_name || hw.ward) || f.properties.ward_id === hw.ward_id
            );
            if (!matchedFeature) return null;

            const coords = matchedFeature.geometry.coordinates[0];
            let sumX = 0, sumY = 0;
            coords.forEach(([lng, lat]) => {
              const [px, py] = project(lng, lat);
              sumX += px;
              sumY += py;
            });
            const cx = sumX / coords.length;
            const cy = sumY / coords.length - 12;

            return (
              <g key={`pin-${idx}`} className="animate-bounce pointer-events-none">
                <circle cx={cx} cy={cy} r="14" fill="rgba(239, 68, 68, 0.3)" />
                <circle cx={cx} cy={cy} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="10"
                  fontWeight="bold"
                  className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                >
                  #{idx + 1} Needed
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredWard && (
          <div
            className="absolute bottom-16 left-6 z-30 glass-panel p-3.5 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-none animate-in fade-in duration-150 max-w-xs"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 mb-2">
              <span className="font-bold text-slate-100 text-sm">{hoveredWard.ward_name}</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  hoveredWard.risk_tier === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : hoveredWard.risk_tier === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {hoveredWard.risk_tier} RISK
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-slate-400">Surface LST:</span>
              <span className="font-mono font-semibold text-rose-400">{hoveredWard.lst_celsius}°C</span>

              <span className="text-slate-400">Vegetation (NDVI):</span>
              <span className="font-mono font-semibold text-emerald-400">{hoveredWard.ndvi}</span>

              <span className="text-slate-400">Vulnerability Score:</span>
              <span className="font-mono font-semibold text-sky-400">{((hoveredWard.vulnerability_score || 0) * 100).toFixed(1)}%</span>

              <span className="text-slate-400">Cooling Centers:</span>
              <span className="font-mono font-semibold text-slate-200">{hoveredWard.existing_cooling_centers || 0} active</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Legend */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Choropleth Scale:</span>
          {activeLayer === 'vulnerability' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Low (&lt;40%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500"></span> Medium (40-70%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-500"></span> Critical High (&gt;70%)</span>
            </div>
          )}
          {activeLayer === 'lst' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500"></span> &lt;38°C (Green Belt)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500"></span> 42-45°C (Dense Urban)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-700"></span> &gt;48°C (Industrial Core)</span>
            </div>
          )}
          {activeLayer === 'ndvi' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-stone-700"></span> Bare Soil / Built-up</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-600"></span> Sparse</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-600"></span> Dense Canopy</span>
            </div>
          )}
          {activeLayer === 'cooling' && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500"></span> Sufficient</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500"></span> +1 Needed</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-600"></span> +2 to +3 Critical Need</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px]">Powered by Azure Maps Atlas Geospatial Standard</span>
        </div>
      </div>

    </div>
  );
}
