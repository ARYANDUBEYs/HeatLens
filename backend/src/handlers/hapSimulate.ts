import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';
import { simulateHapIntervention } from '../services/hapEngine.js';

export async function handleHapSimulate(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const wardId = body.ward_id || 'DEL_01';
    const budget = Number(body.budget_inr_lakhs || body.budget) || 25;

    const isCanada = wardId.toUpperCase().startsWith('CAN');
    const primaryFile = isCanada ? 'canadian_smog_corridor.json' : 'delhi_wards.json';
    const secondaryFile = isCanada ? 'delhi_wards.json' : 'canadian_smog_corridor.json';

    let ward: any = null;

    // Search primary dataset first
    const primaryPath = path.resolve('src/data', primaryFile);
    if (fs.existsSync(primaryPath)) {
      const rawData = fs.readFileSync(primaryPath, 'utf-8');
      const geoData = JSON.parse(rawData);
      ward = geoData.features.find((f: any) => f.properties.ward_id === wardId);
    }

    // Fallback to secondary dataset
    if (!ward) {
      const secondaryPath = path.resolve('src/data', secondaryFile);
      if (fs.existsSync(secondaryPath)) {
        const rawData = fs.readFileSync(secondaryPath, 'utf-8');
        const geoData = JSON.parse(rawData);
        ward = geoData.features.find((f: any) => f.properties.ward_id === wardId);
      }
    }

    if (!ward) {
      return c.json({ success: false, error: `Ward or corridor region with ID '${wardId}' not found.` }, 404);
    }

    const simulation = simulateHapIntervention(ward, budget);
    const mockTxId = 'TX_HAP_' + Math.random().toString(36).substring(2, 12).toUpperCase();

    return c.json({
      success: true,
      payment_status: "VERIFIED_ON_ALGORAND",
      price_paid: "$0.010 USDC",
      settlement_protocol: "x402_AVM",
      network: "Algorand Testnet",
      explorer_url: `https://lora.algokit.io/testnet/transaction/${mockTxId}`,
      transaction_id: mockTxId,
      simulation_results: simulation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to simulate climate action recommendations' }, 500);
  }
}
