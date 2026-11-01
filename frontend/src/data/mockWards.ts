/**
 * HeatLens × Microsoft Imagine Cup 2026
 * Delhi NCR Ward Telemetry Ground-Truth Engine
 * File: src/data/mockWards.ts
 */

import { WardMetrics, CitywideHeatStats, RiskLevel } from '@/types';
import {
  calculatePriorityScore,
  calculateFVC,
  getRiskClassification,
} from '@/lib/formulas';

// Helper to generate realistic 14-day temporal LST trajectory
function generate14DayHistory(
  baseTemp: number,
  variance: number
): Array<{ date: string; temp: number; baseline: number }> {
  const dates = [
    '2025-06-18', '2025-06-19', '2025-06-20', '2025-06-21',
    '2025-06-22', '2025-06-23', '2025-06-24', '2025-06-25',
    '2025-06-26', '2025-06-27', '2025-06-28', '2025-06-29',
    '2025-06-30', '2025-07-01',
  ];

  // Deterministic sinusoids to avoid client/server hydration mismatch
  return dates.map((date, idx) => {
    const cycle = Math.sin((idx / 13) * Math.PI) * variance;
    const temp = Number((baseTemp - variance * 0.6 + cycle).toFixed(1));
    const baseline = Number((baseTemp - 3.2 + (idx % 3) * 0.3).toFixed(1));
    return { date, temp, baseline };
  });
}

// Raw ground-truth parameters per ward
interface RawWardData {
  id: string;
  name: string;
  zone: string;
  lst: number;
  ndvi: number;
  aqi: number;
  vulnerabilityScore: number;
  centerCoordinates: [number, number]; // [lat, lng]
  recommendedActions: string[];
}

const RAW_WARDS: RawWardData[] = [
  {
    id: 'DEL-001',
    name: 'Seelampur',
    zone: 'North-East Delhi',
    lst: 48.6,
    ndvi: 0.07,
    aqi: 415,
    vulnerabilityScore: 0.91,
    centerCoordinates: [28.6698, 77.2675],
    recommendedActions: [
      'Deploy 3 Emergency Mobile Hydration Kiosks at GT Road junction',
      'Mandate retrofitting of reflective cool-roof coatings across 22 informal industrial units',
      'Establish high-pressure evaporative misting corridors along Seelampur Market',
    ],
  },
  {
    id: 'DEL-002',
    name: 'Chandni Chowk',
    zone: 'Central Delhi',
    lst: 47.8,
    ndvi: 0.08,
    aqi: 365,
    vulnerabilityScore: 0.85,
    centerCoordinates: [28.6562, 77.2300],
    recommendedActions: [
      'Install shade sails & misting canopies along pedestrianized heritage promenade',
      'Deploy rapid-response heat stroke paramedic bikes during 12:00-16:00 peak hours',
      'Open municipal heritage buildings as designated community air-conditioned cooling shelters',
    ],
  },
  {
    id: 'DEL-003',
    name: 'Okhla Phase 1',
    zone: 'South Delhi',
    lst: 48.8,
    ndvi: 0.06,
    aqi: 395,
    vulnerabilityScore: 0.88,
    centerCoordinates: [28.5350, 77.2750],
    recommendedActions: [
      'Paint high-albedo solar reflective white coating on 45 factory tin roofs',
      'Enforce mandatory thermal work-rest schedule for 14,000 outdoor logistics laborers',
      'Commission 2 solar-powered mobile chiller tankers at industrial container depots',
    ],
  },
  {
    id: 'DEL-004',
    name: 'Shahdara',
    zone: 'East Delhi',
    lst: 46.5,
    ndvi: 0.11,
    aqi: 345,
    vulnerabilityScore: 0.78,
    centerCoordinates: [28.6720, 77.2920],
    recommendedActions: [
      'Activate 2 municipal primary schools as public cooling refuges with water ATMs',
      'Accelerate roadside bioswale urban greening along Grand Trunk Road axis',
      'Distribute oral rehydration salts (ORS) packages to vulnerable informal transit hubs',
    ],
  },
  {
    id: 'DEL-005',
    name: 'Karol Bagh',
    zone: 'Central Delhi',
    lst: 45.7,
    ndvi: 0.14,
    aqi: 310,
    vulnerabilityScore: 0.72,
    centerCoordinates: [28.6515, 77.1895],
    recommendedActions: [
      'Deploy tensile shade fabric structures over Ajmal Khan Road pedestrian plazas',
      'Retrofit high-traffic bus halts with shaded evaporative cooling fans',
      'Subsidize cool roof paints for residential walk-ups lacking HVAC infrastructure',
    ],
  },
  {
    id: 'DEL-006',
    name: 'Rohini Sector 3',
    zone: 'North Delhi',
    lst: 44.2,
    ndvi: 0.22,
    aqi: 280,
    vulnerabilityScore: 0.60,
    centerCoordinates: [28.7050, 77.1120],
    recommendedActions: [
      'Establish green vegetative buffer strips around school recreation perimeters',
      'Expand drip irrigation across community sector parks to preserve active evapotranspiration',
    ],
  },
  {
    id: 'DEL-007',
    name: 'Najafgarh',
    zone: 'South-West Delhi',
    lst: 43.8,
    ndvi: 0.26,
    aqi: 260,
    vulnerabilityScore: 0.58,
    centerCoordinates: [28.6100, 76.9850],
    recommendedActions: [
      'Install shade shelters at agricultural grain collection mandates and tractor depots',
      'Maintain agro-forestry perimeter belts to reduce windborne dust & radiative surface heat',
    ],
  },
  {
    id: 'DEL-008',
    name: 'Dwarka Sector 10',
    zone: 'South-West Delhi',
    lst: 41.5,
    ndvi: 0.32,
    aqi: 235,
    vulnerabilityScore: 0.44,
    centerCoordinates: [28.5820, 77.0580],
    recommendedActions: [
      'Maintain existing sub-city planned green lungs and rainwater detention ponds',
      'Incentivize rooftop terrace garden expansion on cooperative housing societies',
    ],
  },
  {
    id: 'DEL-009',
    name: 'Civil Lines',
    zone: 'North Delhi',
    lst: 39.8,
    ndvi: 0.38,
    aqi: 220,
    vulnerabilityScore: 0.32,
    centerCoordinates: [28.6800, 77.2250],
    recommendedActions: [
      'Protect old-growth heritage banyan & neem canopy from utility pruning',
      'Deploy micro-weather sensors to evaluate baseline microclimate cooling efficiency',
    ],
  },
  {
    id: 'DEL-010',
    name: 'Lodhi Estate & Chanakyapuri',
    zone: 'South Delhi',
    lst: 38.6,
    ndvi: 0.42,
    aqi: 210,
    vulnerabilityScore: 0.22,
    centerCoordinates: [28.5920, 77.2180],
    recommendedActions: [
      'Benchmark dense multi-tier urban forest canopy as reference urban cooling template',
      'Monitor thermal delta between Lodhi Gardens green belt and adjoining paved corridors',
    ],
  },
];

// Transform raw records through mathematical formulas into validated WardMetrics
export const mockWards: WardMetrics[] = RAW_WARDS.map((w, index) => {
  const fvc = calculateFVC(w.ndvi);
  const priorityScore = calculatePriorityScore(
    w.lst,
    w.ndvi,
    w.aqi,
    w.vulnerabilityScore
  );
  const riskLevel = getRiskClassification(priorityScore);
  const historicalLST = generate14DayHistory(w.lst, 2.5 + (index % 3) * 0.4);

  return {
    id: w.id,
    name: w.name,
    zone: w.zone,
    lst: w.lst,
    ndvi: w.ndvi,
    fvc,
    aqi: w.aqi,
    vulnerabilityScore: w.vulnerabilityScore,
    priorityScore,
    riskLevel,
    recommendedActions: w.recommendedActions,
    centerCoordinates: w.centerCoordinates,
    historicalLST,
  };
});

// ─────────────────────────────────────────────────────────────
// Query & Analytics Utilities
// ─────────────────────────────────────────────────────────────

export function getMockWardById(id: string): WardMetrics | undefined {
  return mockWards.find((w) => w.id === id || w.name.toLowerCase() === id.toLowerCase());
}

export function getTopHottestWards(k: number = 5): WardMetrics[] {
  return [...mockWards].sort((a, b) => b.lst - a.lst).slice(0, k);
}

export function getTopPriorityWards(k: number = 5): WardMetrics[] {
  return [...mockWards].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, k);
}

export function getWardsByRisk(risk: RiskLevel): WardMetrics[] {
  return mockWards.filter((w) => w.riskLevel === risk);
}

export function getCitywideStats(): CitywideHeatStats {
  const lsts = mockWards.map((w) => w.lst);
  const ndvis = mockWards.map((w) => w.ndvi);

  const hottest = mockWards.reduce((prev, curr) => (curr.lst > prev.lst ? curr : prev), mockWards[0]);
  const coolest = mockWards.reduce((prev, curr) => (curr.lst < prev.lst ? curr : prev), mockWards[0]);

  const avgLst = Number((lsts.reduce((a, b) => a + b, 0) / lsts.length).toFixed(1));
  const avgNdvi = Number((ndvis.reduce((a, b) => a + b, 0) / ndvis.length).toFixed(2));
  const thermalDisparity = Number((hottest.lst - coolest.lst).toFixed(1));

  return {
    city: 'Delhi NCR',
    date: 'July 2025 (Peak Summer Cycle)',
    totalWards: mockWards.length,
    maxLst: hottest.lst,
    minLst: coolest.lst,
    avgLst,
    thermalDisparity,
    avgNdvi,
    hottestWard: { id: hottest.id, name: hottest.name, lst: hottest.lst },
    coolestWard: { id: coolest.id, name: coolest.name, lst: coolest.lst },
    riskBreakdown: {
      critical: mockWards.filter((w) => w.riskLevel === 'Critical').length,
      high: mockWards.filter((w) => w.riskLevel === 'High').length,
      moderate: mockWards.filter((w) => w.riskLevel === 'Moderate').length,
      low: mockWards.filter((w) => w.riskLevel === 'Low').length,
    },
  };
}
