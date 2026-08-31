import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';

export function handlePublicWards(c: Context) {
  try {
    const dataPath = path.resolve('src/data/delhi_wards.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const wardsGeoJSON = JSON.parse(rawData);

    // Return public overview (without locked premium simulation)
    const publicFeatures = wardsGeoJSON.features.map((f: any) => ({
      type: f.type,
      id: f.id,
      properties: {
        ward_id: f.properties.ward_id,
        ward_name: f.properties.ward_name,
        zone: f.properties.zone,
        population: f.properties.population,
        lst_temp_c: f.properties.lst_temp_c,
        ndvi_vegetation: f.properties.ndvi_vegetation,
        aqi_pm25: f.properties.aqi_pm25,
        aqi_status: f.properties.aqi_status,
        informal_settlement_pct: f.properties.informal_settlement_pct,
        pvd_priority_score: f.properties.pvd_priority_score,
        risk_category: f.properties.risk_category
      },
      geometry: f.geometry
    }));

    return c.json({
      success: true,
      metadata: wardsGeoJSON.metadata,
      type: "FeatureCollection",
      features: publicFeatures,
      protocol: "x402-ready",
      message: "Public overview loaded. Deep satellite audit & HAP simulations are x402-protected on Algorand."
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load wards data' }, 500);
  }
}
