import dotenv from 'dotenv';
dotenv.config();

export const ALGORAND_TESTNET_CAIP2 = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
export const USDC_TESTNET_ASA_ID = 10458941; // Algorand Testnet USDC ASA ID
export const DEFAULT_AVM_ADDRESS = process.env.AVM_ADDRESS || 'HEATLENSORACLE7X402TESTNETALGORANDPAYTOADDRESSXXXXXXXXXX';

export interface PaymentEndpointConfig {
  accepts: Array<{
    scheme: string;
    price: string;
    network: string;
    payTo: string;
    extra?: {
      asset?: number;
      decimals?: number;
    };
  }>;
  description: string;
}

export function createPaymentConfig(): Record<string, PaymentEndpointConfig> {
  const payTo = process.env.AVM_ADDRESS || DEFAULT_AVM_ADDRESS;

  return {
    'GET /api/v1/heat-equity/ward-audit': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.005',
          network: ALGORAND_TESTNET_CAIP2,
          payTo: payTo,
          extra: { asset: USDC_TESTNET_ASA_ID, decimals: 6 },
        },
      ],
      description: 'Granular Satellite Thermal & Formal vs Informal Heat Gap Audit',
    },
    'POST /api/v1/agent/hap-recommendation': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.010',
          network: ALGORAND_TESTNET_CAIP2,
          payTo: payTo,
          extra: { asset: USDC_TESTNET_ASA_ID, decimals: 6 },
        },
      ],
      description: 'NDMA Heat Action Plan AI Intervention Simulation & Resource Allocation',
    },
  };
}
