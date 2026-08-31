import fallbackData from '../data/delhi_wards.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4021';

export async function fetchWardsSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/heat-equity/ward-summary`);
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend offline, using fallback dataset for zero-fail demo safety:', err);
    return fallbackData;
  }
}

export async function requestWardAudit(wardId, paymentSignature = null) {
  const headers = {};
  if (paymentSignature) {
    headers['X-Payment-Signature'] = paymentSignature;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/heat-equity/ward-audit?id=${wardId}`, { headers });
  
  if (res.status === 402) {
    const invoice = await res.json();
    return { is402: true, invoice };
  }

  const data = await res.json();
  return { is402: false, data };
}

export async function requestHapSimulation(wardId, budgetLakhs = 25, paymentSignature = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (paymentSignature) {
    headers['X-Payment-Signature'] = paymentSignature;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/agent/hap-recommendation`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ward_id: wardId, budget_inr_lakhs: budgetLakhs })
  });

  if (res.status === 402) {
    const invoice = await res.json();
    return { is402: true, invoice };
  }

  const data = await res.json();
  return { is402: false, data };
}
