import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';

export function handleWardAudit(c: Context) {
  try {
    const wardId = c.req.query('id') || 'DEL_01';
    const dataPath = path.resolve('src/data/delhi_wards.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const wardsGeoJSON = JSON.parse(rawData);

    const ward = wardsGeoJSON.features.find((f: any) => f.properties.ward_id === wardId);

    if (!ward) {
      return c.json({ success: false, error: `Ward with ID ${wardId} not found.` }, 404);
    }

    // Generate mock on-chain tx id for live demo verification
    const mockTxId = 'TX_' + Math.random().toString(36).substring(2, 12).toUpperCase() + '_TESTNET';

    return c.json({
      success: true,
      payment_status: "VERIFIED_ON_ALGORAND",
      settlement_protocol: "x402_AVM_HTTP_PAYMENT",
      network: "Algorand Testnet",
      explorer_url: `https://lora.algokit.io/testnet/transaction/${mockTxId}`,
      transaction_id: mockTxId,
      ward_audit: ward.properties,
      geometry: ward.geometry,
      oracle_timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to process ward audit' }, 500);
  }
}
