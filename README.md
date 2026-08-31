# 🛰️ HeatLens: Urban Heat & Air Equity Oracle (Powered by x402 on Algorand)

> **Build With Bharat 2.0 (National Level Hackathon — NIT Delhi)**  
> **Track:** 🔥 *Agentic Solutions: Powered by x402 on Algorand Blockchain*  
> **Team Name:** `eco builders`  
> **Team Members:** Aryan, Rohit, Astha, Saumya & Shivam (ABES Engineering College)  

---

## 📌 1. The Core Problem & Social Impact

Indian cities face severe, unequally distributed urban heat and air pollution burdens. A low-income informal settlement full of tin roofs and concrete can run **8°C to 10°C hotter** and breathe far worse air than an affluent green neighborhood just 3 km away.

**HeatLens** makes this invisible climate inequality visible, rankable, and actionable:
1. **Satellite Land Surface Temperature (LST):** Derived from Landsat-8/9 thermal bands.
2. **Green Canopy Cover (NDVI):** 10m resolution vegetation density from Sentinel-2.
3. **Real-Time Air Quality (AQI PM2.5):** Central Pollution Control Board (CPCB) station grid.
4. **Informal Settlement Vulnerability Layer:** Surfacing tin-roof density and informal clusters.
5. **NDMA Heat Action Plan (HAP) AI Simulator:** Actionable cooling interventions (cool roofs, misting stations, shade trees) mapped directly to government relief guidelines.

---

## ⛓️ 2. The Agentic x402 Integration on Algorand Testnet

**HeatLens** operates as a decentralized **Climate Intelligence Micro-Oracle**:
* **HTTP 402 Standard:** External clients, NGOs, carbon auditors, or autonomous AI agents query deep satellite climate audits.
* **Algorand Testnet Settlement:** Micro-payments (**$0.005 to $0.010 USDC**) are verified and settled on-chain via the **GoPlausible Facilitator** (`facilitator.goplausible.xyz`).
* **Verifiable Attestations:** Every audit and HAP simulation generates an immutable cryptographic receipt verifiable on **Lora Algorand Explorer** (`https://lora.algokit.io/testnet`).

---

## 🛠️ 3. Technology Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Leaflet.js (Choropleth GIS), `@txnlab/use-wallet` (Pera Wallet / Defly).
* **Backend & Oracle:** Hono TypeScript, `@x402-avm` Protocol suite (`@x402/core`, `@x402/hono`, `@x402/avm`, `@x402-avm/extensions`), GoPlausible Facilitator.
* **Geospatial & Climate Processing:** GeoJSON Delhi NCR Ward Boundaries, Landsat TIRS LST algorithm, Sentinel-2 NDVI index, CPCB NAQI formula.
* **Blockchain:** Algorand Testnet + Lora Block Explorer.

---

## 🚀 4. How to Run Locally

### Prerequisites:
* **Node.js** 18+ and npm
* **Pera Algo Wallet** (configured to Algorand Testnet)

### Step 1: Start Backend (Hono x402 Server)
```bash
cd backend
npm install
npm start
# Server starts on http://localhost:4021
```

### Step 2: Start Frontend (Interactive GIS Portal)
```bash
cd frontend
npm install
npm run dev
# Portal starts on http://localhost:5173
```

---

## 📜 5. Verified API Endpoints

| Endpoint | Method | Cost | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/heat-equity/ward-summary` | `GET` | **FREE** | Public overview of Delhi NCR ward outlines & baseline metrics. |
| `/api/v1/heat-equity/ward-audit` | `GET` | **$0.005 USDC** | x402-protected deep satellite LST, NDVI & inequality gap audit. |
| `/api/v1/agent/hap-recommendation` | `POST` | **$0.010 USDC** | x402-protected NDMA Heat Action Plan cooling ROI simulation. |

---

*Built with ❤️ for Bharat by Team eco builders at ABES Engineering College.*
