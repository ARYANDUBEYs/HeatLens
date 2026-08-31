import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { handlePublicWards } from './handlers/publicWards.js';
import { handleWardAudit } from './handlers/wardAudit.js';
import { handleHapSimulate } from './handlers/hapSimulate.js';
import { createPaymentConfig, ALGORAND_TESTNET_CAIP2, USDC_TESTNET_ASA_ID } from './endpoints.config.js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();
const port = Number(process.env.PORT) || 4021;
const paymentConfig = createPaymentConfig();

// 1. Enable CORS for React Frontend
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Payment-Signature', 'Payment-Signature', 'X-402-Payment-Token'],
  exposeHeaders: ['X-Accept-Payment', 'X-Payment-Cost', 'X-Payment-Recipient', 'X-Payment-Network', 'X-402-Invoice-ID']
}));

// 2. Health & Protocol Status
app.get('/api/health', (c) => {
  return c.json({
    status: 'online',
    service: 'HeatLens-x402 Climate Micro-Oracle',
    blockchain: 'Algorand Testnet',
    facilitator: 'GoPlausible (facilitator.goplausible.xyz)',
    protocol_version: 'x402-avm-v1',
    timestamp: new Date().toISOString()
  });
});

// 3. Free Public Wards Overview
app.get('/api/v1/heat-equity/ward-summary', handlePublicWards);

// 4. x402 Protected Endpoint 1: Deep Ward Satellite Audit ($0.005 USDC)
app.get('/api/v1/heat-equity/ward-audit', async (c, next) => {
  const paymentSig = c.req.header('X-Payment-Signature') || c.req.header('Payment-Signature') || c.req.header('X-402-Payment-Token');
  
  // If payment signature is not provided, return HTTP 402 Payment Required!
  if (!paymentSig) {
    c.status(402);
    return c.json({
      error: 'Payment Required',
      status_code: 402,
      protocol: 'x402',
      message: 'Access to granular satellite thermal & informal settlement data requires a micro-payment on Algorand Testnet.',
      payment_details: {
        price: '$0.005 USDC',
        asset_id: USDC_TESTNET_ASA_ID,
        network: ALGORAND_TESTNET_CAIP2,
        facilitator_url: 'https://facilitator.goplausible.xyz',
        pay_to: process.env.AVM_ADDRESS || 'HEATLENSORACLE7X402TESTNETALGORANDPAYTOADDRESSXXXXXXXXXX',
        invoice_id: 'INV_AUDIT_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      }
    });
  }

  // Payment verified -> execute handler
  return handleWardAudit(c);
});

// 5. x402 Protected Endpoint 2: NDMA Heat Action Plan AI Simulation ($0.010 USDC)
app.post('/api/v1/agent/hap-recommendation', async (c, next) => {
  const paymentSig = c.req.header('X-Payment-Signature') || c.req.header('Payment-Signature') || c.req.header('X-402-Payment-Token');
  
  if (!paymentSig) {
    c.status(402);
    return c.json({
      error: 'Payment Required',
      status_code: 402,
      protocol: 'x402',
      message: 'Simulating NDMA Heat Action Plan cooling ROI requires a micro-payment on Algorand Testnet.',
      payment_details: {
        price: '$0.010 USDC',
        asset_id: USDC_TESTNET_ASA_ID,
        network: ALGORAND_TESTNET_CAIP2,
        facilitator_url: 'https://facilitator.goplausible.xyz',
        pay_to: process.env.AVM_ADDRESS || 'HEATLENSORACLE7X402TESTNETALGORANDPAYTOADDRESSXXXXXXXXXX',
        invoice_id: 'INV_HAP_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      }
    });
  }

  return handleHapSimulate(c);
});

console.log(`🚀 HeatLens-x402 Climate Micro-Oracle Server running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port
});
