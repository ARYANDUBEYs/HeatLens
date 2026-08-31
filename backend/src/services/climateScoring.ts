// Multi-Factor Climate Vulnerability Scoring Engine
export interface WardProperties {
  ward_id: string;
  ward_name: string;
  zone: string;
  population: number;
  area_sqkm: number;
  lst_temp_c: number;
  air_temp_c: number;
  ndvi_vegetation: number;
  aqi_pm25: number;
  aqi_status: string;
  informal_settlement_pct: number;
  tin_roof_coverage_pct: number;
  pvd_priority_score?: number;
  risk_category?: string;
  [key: string]: any;
}

export function calculatePriorityScore(ward: WardProperties): { score: number; category: string } {
  // 1. Normalized LST (Baseline: 34°C = 0, Max: 48°C = 1.0)
  const normLST = Math.max(0, Math.min(1, (ward.lst_temp_c - 34) / (48 - 34)));

  // 2. Inverted Vegetation (NDVI 0.6 = 0, NDVI 0.05 = 1.0)
  const normNDVI = Math.max(0, Math.min(1, (0.60 - ward.ndvi_vegetation) / (0.60 - 0.05)));

  // 3. Normalized AQI (100 = 0, 450 = 1.0)
  const normAQI = Math.max(0, Math.min(1, (ward.aqi_pm25 - 100) / (450 - 100)));

  // 4. Normalized Informal Settlement Vulnerability (0% = 0, 80% = 1.0)
  const normInformal = Math.max(0, Math.min(1, ward.informal_settlement_pct / 80.0));

  // Weighted Composite Climate Vulnerability Formula
  // R = 0.35 * LST + 0.25 * (1-NDVI) + 0.20 * AQI + 0.20 * Informal
  const rawScore = (0.35 * normLST + 0.25 * normNDVI + 0.20 * normAQI + 0.20 * normInformal) * 100;
  const score = Number(rawScore.toFixed(1));

  let category = "LOW_BLUE";
  if (score >= 85) category = "CRITICAL_RED";
  else if (score >= 70) category = "HIGH_ORANGE";
  else if (score >= 50) category = "MODERATE_YELLOW";
  else if (score >= 30) category = "LOW_BLUE";
  else category = "BENCHMARK_GREEN";

  return { score, category };
}
