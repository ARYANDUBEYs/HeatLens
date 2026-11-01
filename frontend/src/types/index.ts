/**
 * HeatLens × Microsoft Imagine Cup 2026
 * Core TypeScript Schema Definitions
 * File: src/types/index.ts
 */

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type MapMetricLayer = 'priority' | 'lst' | 'ndvi' | 'aqi';

export type DelhiZone =
  | 'East Delhi'
  | 'North-East Delhi'
  | 'North Delhi'
  | 'Central Delhi'
  | 'South Delhi'
  | 'West Delhi'
  | 'South-West Delhi';

export interface HistoricalLSTPoint {
  date: string;       // ISO date e.g. "2025-06-25"
  temp: number;       // Observed LST in °C
  baseline: number;   // 10-year Landsat climatological baseline in °C
}

export interface WardMetrics {
  id: string;                                   // e.g., "DEL-001"
  name: string;                                 // e.g., "Seelampur"
  zone: DelhiZone | string;                     // Municipal zone
  lst: number;                                  // Land Surface Temperature in °C (Landsat-8/9 Band 10)
  ndvi: number;                                 // Normalized Difference Vegetation Index (Sentinel-2 MSI)
  fvc: number;                                  // Fractional Vegetation Cover (Sobrino et al.)
  aqi: number;                                  // PM2.5 Air Quality Index (CPCB sensor telemetry)
  vulnerabilityScore: number;                   // Socioeconomic baseline vulnerability (0.0 to 1.0)
  priorityScore: number;                        // Composite AHP Index (0.0 to 1.0, Saaty CR = 0.023)
  riskLevel: RiskLevel;                         // Categorical tier
  recommendedActions: string[];                 // Concrete municipal intervention directives
  centerCoordinates: [number, number];          // [latitude, longitude]
  historicalLST: HistoricalLSTPoint[];          // 14-day temporal trajectory
}

// ─────────────────────────────────────────────────────────────
// GeoJSON Schema Types
// ─────────────────────────────────────────────────────────────

export interface GeoJSONPolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][]; // Array of linear rings: [[lng, lat], [lng, lat], ...]
}

export interface WardFeature {
  type: 'Feature';
  id: string;
  properties: WardMetrics;
  geometry: GeoJSONPolygonGeometry;
}

export interface WardFeatureCollection {
  type: 'FeatureCollection';
  metadata: {
    city: string;
    region: string;
    date: string;
    satelliteSources: string[];
    totalWards: number;
    crs: string;
  };
  features: WardFeature[];
}

// ─────────────────────────────────────────────────────────────
// Chat & Agent Types (Azure OpenAI Tool Calling)
// ─────────────────────────────────────────────────────────────

export interface AgentToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: AgentToolCall[];
  source?: string;
  relatedWardIds?: string[];
}

export interface SuggestedQuery {
  id: string;
  query: string;
  category: 'emergency' | 'analysis' | 'comparison' | 'recommendation';
  previewLabel: string;
}

// ─────────────────────────────────────────────────────────────
// Citywide Analytics Summary
// ─────────────────────────────────────────────────────────────

export interface CitywideHeatStats {
  city: string;
  date: string;
  totalWards: number;
  maxLst: number;
  minLst: number;
  avgLst: number;
  thermalDisparity: number;
  avgNdvi: number;
  hottestWard: {
    id: string;
    name: string;
    lst: number;
  };
  coolestWard: {
    id: string;
    name: string;
    lst: number;
  };
  riskBreakdown: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}
