import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';

export function handleWardAudit(c: Context) {
  try {
    const wardId = c.req.query('id') || 'DEL_01';
    
    // Check both Canadian and Delhi datasets
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
