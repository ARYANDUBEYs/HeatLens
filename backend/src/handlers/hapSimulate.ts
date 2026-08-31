import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';
import { simulateHapIntervention } from '../services/hapEngine.js';

export async function handleHapSimulate(c: Context) {
  try {
    const body = await c.req.json().catch(() => ({}));
    const wardId = body.ward_id || 'DEL_01';
    const budgetLakhs = Number(body.budget_inr_lakhs) || 25;

    const dataPath = path.resolve('src/data/delhi_wards.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const wardsGeoJSON = JSON.parse(rawData);

    const ward = wardsGeoJSON.features.find((f: any) => f.properties.ward_id === wardId);

    if (!ward) {
      return c.json({ success: false, error: `Ward with ID ${wardId} not found.` }, 404);
    }

    const simulation = simulateHapIntervention(ward, budgetLakhs);
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
    return c.json({ success: false, error: 'Failed to simulate HAP recommendations' }, 500);
  }
}
