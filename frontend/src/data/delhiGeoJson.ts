/**
 * HeatLens × Microsoft Imagine Cup 2026
 * Delhi NCR Administrative Ward Polygonal GeoJSON Engine
 * File: src/data/delhiGeoJson.ts
 *
 * GeoJSON Specification: RFC 7946 (WGS 84 coordinate system)
 * Coordinate order: [longitude, latitude]
 */

import { WardFeatureCollection, WardFeature } from '@/types';
import { mockWards } from '@/data/mockWards';

// Boundary polygons for 10 distinct, non-overlapping municipal wards
const WARD_POLYGONS: Record<string, number[][]> = {
  // DEL-001: Seelampur (North-East Delhi)
  'DEL-001': [
    [77.2580, 28.6620],
    [77.2650, 28.6610],
    [77.2740, 28.6650],
    [77.2780, 28.6720],
    [77.2730, 28.6790],
    [77.2640, 28.6800],
    [77.2570, 28.6740],
    [77.2550, 28.6670],
    [77.2580, 28.6620], // Closed ring
  ],

  // DEL-002: Chandni Chowk (Central Delhi / Old Delhi)
  'DEL-002': [
    [77.2220, 28.6500],
    [77.2320, 28.6490],
    [77.2390, 28.6540],
    [77.2410, 28.6610],
    [77.2360, 28.6660],
    [77.2260, 28.6650],
    [77.2190, 28.6580],
    [77.2220, 28.6500], // Closed ring
  ],

  // DEL-003: Okhla Phase 1 (South-East Delhi Industrial Core)
  'DEL-003': [
    [77.2620, 28.5220],
    [77.2750, 28.5200],
    [77.2880, 28.5260],
    [77.2910, 28.5370],
    [77.2840, 28.5470],
    [77.2710, 28.5480],
    [77.2610, 28.5400],
    [77.2590, 28.5300],
    [77.2620, 28.5220], // Closed ring
  ],

  // DEL-004: Shahdara (East Delhi)
  'DEL-004': [
    [77.2820, 28.6620],
    [77.2950, 28.6600],
    [77.3060, 28.6660],
    [77.3090, 28.6750],
    [77.3020, 28.6840],
    [77.2910, 28.6850],
    [77.2810, 28.6770],
    [77.2820, 28.6620], // Closed ring
  ],

  // DEL-005: Karol Bagh (Central-West Delhi)
  'DEL-005': [
    [77.1800, 28.6430],
    [77.1920, 28.6410],
    [77.2010, 28.6470],
    [77.2030, 28.6560],
    [77.1960, 28.6630],
    [77.1850, 28.6620],
    [77.1770, 28.6530],
    [77.1800, 28.6430], // Closed ring
  ],

  // DEL-006: Rohini Sector 3 (North-West Delhi)
  'DEL-006': [
    [77.1000, 28.6970],
    [77.1140, 28.6950],
    [77.1250, 28.7020],
    [77.1270, 28.7130],
    [77.1190, 28.7210],
    [77.1070, 28.7200],
    [77.0980, 28.7110],
    [77.1000, 28.6970], // Closed ring
  ],

  // DEL-007: Najafgarh (South-West Peri-Urban Zone)
  'DEL-007': [
    [76.9720, 28.6000],
    [76.9880, 28.5970],
    [77.0010, 28.6050],
    [77.0040, 28.6180],
    [76.9950, 28.6270],
    [76.9810, 28.6250],
    [76.9700, 28.6140],
    [76.9720, 28.6000], // Closed ring
  ],

  // DEL-008: Dwarka Sector 10 (South-West Delhi)
  'DEL-008': [
    [77.0470, 28.5720],
    [77.0600, 28.5700],
    [77.0710, 28.5780],
    [77.0730, 28.5890],
    [77.0650, 28.5970],
    [77.0520, 28.5960],
    [77.0440, 28.5860],
    [77.0470, 28.5720], // Closed ring
  ],

  // DEL-009: Civil Lines (North Delhi Green Cantonment)
  'DEL-009': [
    [77.2170, 28.6720],
    [77.2280, 28.6700],
    [77.2370, 28.6770],
    [77.2390, 28.6870],
    [77.2320, 28.6950],
    [77.2210, 28.6940],
    [77.2130, 28.6840],
    [77.2170, 28.6720], // Closed ring
  ],

  // DEL-010: Lodhi Estate & Chanakyapuri (South-Central Green Belt)
  'DEL-010': [
    [77.2080, 28.5840],
    [77.2210, 28.5820],
    [77.2310, 28.5890],
    [77.2330, 28.5990],
    [77.2250, 28.6070],
    [77.2130, 28.6060],
    [77.2050, 28.5960],
    [77.2080, 28.5840], // Closed ring
  ],
};

// Build typed GeoJSON Features linking each polygon directly to its WardMetrics
const features: WardFeature[] = mockWards.map((ward) => {
  const polygonCoords = WARD_POLYGONS[ward.id] || [
    // Fallback closed square around center coordinates if ever unmatched
    [ward.centerCoordinates[1] - 0.01, ward.centerCoordinates[0] - 0.01],
    [ward.centerCoordinates[1] + 0.01, ward.centerCoordinates[0] - 0.01],
    [ward.centerCoordinates[1] + 0.01, ward.centerCoordinates[0] + 0.01],
    [ward.centerCoordinates[1] - 0.01, ward.centerCoordinates[0] + 0.01],
    [ward.centerCoordinates[1] - 0.01, ward.centerCoordinates[0] - 0.01],
  ];

  return {
    type: 'Feature',
    id: ward.id,
    properties: ward,
    geometry: {
      type: 'Polygon',
      coordinates: [polygonCoords],
    },
  };
});

// Master GeoJSON FeatureCollection
export const delhiWardFeatureCollection: WardFeatureCollection = {
  type: 'FeatureCollection',
  metadata: {
    city: 'Delhi NCR',
    region: 'Central India',
    date: 'July 2025 (Peak Climatological Heat Wave)',
    satelliteSources: [
      'NASA Landsat-8/9 TIRS Band 10 (@30m)',
      'ESA Copernicus Sentinel-2 MSI Bands 4/8 (@10m)',
    ],
    totalWards: features.length,
    crs: 'urn:ogc:def:crs:OGC:1.3:CRS84',
  },
  features,
};
