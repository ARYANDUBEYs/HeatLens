import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';

export function handlePublicWards(c: Context) {
  try {
    const region = c.req.query('region') || 'delhi';
    const filename = region.toLowerCase() === 'canada' ? 'canadian_smog_corridor.json' : 'delhi_wards.json';
    const dataPath = path.resolve('src/data', filename);
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const wardsGeoJSON = JSON.parse(rawData);

    // Return public features overview
    const publicFeatures = wardsGeoJSON.features.map((f: any) => ({
      type: f.type,
      id: f.id,
      properties: {
        ward_id: f.properties.ward_id,
        ward_name: f.properties.ward_name,
        zone: f.properties.zone,
        population: f.properties.population,
        lst_temp_c: f.properties.lst_temp_c,
        air_temp_c: f.properties.air_temp_c,
        ndvi_vegetation: f.properties.ndvi_vegetation,
        aqi_pm25: f.properties.aqi_pm25,
        aqi_status: f.properties.aqi_status,
        aqhi_score: f.properties.aqhi_score,
        tropomi_no2_umol: f.properties.tropomi_no2_umol,
        tropomi_aerosol_index: f.properties.tropomi_aerosol_index,
        wildfire_smoke_flag: f.properties.wildfire_smoke_flag,
        ground_sensor_gap_km: f.properties.ground_sensor_gap_km,
        informal_settlement_pct: f.properties.informal_settlement_pct,
        pvd_priority_score: f.properties.pvd_priority_score,
        risk_category: f.properties.risk_category
      },
      geometry: f.geometry
    }));

    return c.json({
      success: true,
      region: region.toLowerCase(),
      metadata: wardsGeoJSON.metadata,
      type: "FeatureCollection",
      features: publicFeatures,
      protocol: "x402-ready",
      message: `${region.toUpperCase()} geospatial overview loaded. Deep satellite audit & action simulations are x402-protected on Algorand.`
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load wards data' }, 500);
  }
}
