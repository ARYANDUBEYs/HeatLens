import axios from 'axios';

/**
 * HeatLens Geospatial & Web3 API Client
 * Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (TRU)
 * Lead Researcher: Rohit Singh
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 1. Fetch Downscaled GeoJSON Grid Feature Collection
 * Calls GET /api/v1/{corridorId}/grid
 * @param {string} corridorId - 'kamloops' | 'delhi'
 * @param {number} [gridDim=40] - Client mesh resolution across axis
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function fetchCorridorGrid(corridorId = 'kamloops', gridDim = 40) {
  const res = await apiClient.get(`/${corridorId}/grid`, {
    params: { grid_dim: gridDim }
  });
  return res.data;
}

// Backward-compatible alias
export const fetchGrid = fetchCorridorGrid;

/**
 * 2. Trigger Full Two-Stage Downscaling Pipeline
 * Calls POST /api/v1/{corridorId}/downscale
 * @param {string} corridorId - 'kamloops' | 'delhi'
 * @param {object|number} [options] - Options object or stepMeters number
 * @returns {Promise<object>} Execution metadata and SHA-256 state digest
 */
export async function triggerDownscale(corridorId = 'kamloops', options = {}) {
  const payload = typeof options === 'number'
    ? { step_meters: options, save_geotiff: true }
    : {
        step_meters: options.step_meters || 350.0,
        save_geotiff: options.save_geotiff !== undefined ? options.save_geotiff : true
      };

  const res = await apiClient.post(`/${corridorId}/downscale`, payload);
  return res.data;
}

/**
 * 3. Municipal Clean-Air Shelter & Sensor Allocation ILP Optimizer
 * Calls POST /api/v1/{corridorId}/shelters/optimize
 * @param {string} corridorId - 'kamloops' | 'delhi'
 * @param {object|number} payload - { budget_cad, shelter_cost, sensor_cost, candidate_zones } or budget_cad number
 * @returns {Promise<object>} Optimal integer linear programming allocation result
 */
export async function optimizeShelters(corridorId = 'kamloops', payload = {}) {
  const body = typeof payload === 'number'
    ? {
        budget_cad: payload,
        shelter_cost: 7500.0,
        sensor_cost: 850.0
      }
    : {
        budget_cad: payload.budget_cad ?? 35000.0,
        shelter_cost: payload.shelter_cost ?? 7500.0,
        sensor_cost: payload.sensor_cost ?? 850.0,
        ...(payload.candidate_zones ? { candidate_zones: payload.candidate_zones } : {})
      };

  const res = await apiClient.post(`/${corridorId}/shelters/optimize`, body);
  return res.data;
}

/**
 * 4. Record Cryptographic Attestation Proof on Algorand Testnet
 * Calls POST /api/v1/attestation/stamp
 * @param {object|string} payload - { raster_hash, corridor_id, metadata } or raster_hash string
 * @returns {Promise<object>} Transaction ID and Algorand explorer URL
 */
export async function stampAttestation(payload) {
  const body = typeof payload === 'string'
    ? {
        raster_hash: payload,
        corridor_id: 'kamloops'
      }
    : {
        raster_hash: payload.raster_hash,
        corridor_id: payload.corridor_id || 'kamloops',
        ...(payload.metadata ? { metadata: payload.metadata } : {})
      };

  const res = await apiClient.post('/attestation/stamp', body);
  return res.data;
}

/**
 * 5. Verify Algorand Attestation Proof
 * Calls GET /api/v1/attestation/verify/{txId}
 * @param {string} txId - Algorand transaction ID
 * @param {string} [expectedHash] - Optional SHA-256 hash to assert parity
 * @returns {Promise<object>} Verification report and confirmed state note
 */
export async function verifyAttestation(txId, expectedHash = null) {
  const res = await apiClient.get(`/attestation/verify/${txId}`, {
    params: expectedHash ? { expected_hash: expectedHash } : {}
  });
  return res.data;
}

/**
 * Pipeline Health Check
 * @returns {Promise<object>}
 */
export async function fetchHealth() {
  const res = await apiClient.get('/health');
  return res.data;
}

export default apiClient;
