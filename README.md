# 🛰️ HeatLens: Autonomous Satellite Geospatial & Urban Heat Equity Oracle

[![Build with Bharat 2.0](https://img.shields.io/badge/Hackathon-Build_with_Bharat_2.0_(NIT_Delhi)-FF6B6B?style=for-the-badge)](https://heat-lens-ecobuilders.vercel.app/)
[![Algorand x402](https://img.shields.io/badge/Blockchain-Algorand_x402_AVM-000000?style=for-the-badge&logo=algorand)](https://lora.algokit.io/testnet)
[![React 18](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript Hono](https://img.shields.io/badge/Backend-Hono_TypeScript-E36002?style=for-the-badge&logo=typescript)](https://hono.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Autonomous Satellite Remote Sensing, Climate Inequality Auditing, and Decentralized Oracle Infrastructure**  
> *Developed for Build With Bharat 2.0 (National Hackathon — NIT Delhi)*  
> 🌐 **Live Interactive Portal:** [https://heat-lens-ecobuilders.vercel.app/](https://heat-lens-ecobuilders.vercel.app/)  
> 📜 **Original Team Submission:** [ARYANDUBEYs/HeatLens](https://github.com/ARYANDUBEYs/HeatLens)

---

## 👥 Collaborative Provenance & Engineering Roles

* **Hackathon Track:** *Agentic Solutions: Powered by x402 on Algorand Blockchain*
* **Team:** `eco builders` (ABES Engineering College, Ghaziabad)
* **Team Members:** Rohit Singh, Aryan Dubey, Astha, Saumya, Shivam
* **Architectural Leadership & Core Implementation (Rohit Singh):**
  1. **Satellite Remote Sensing Engine:** Mathematical pipeline translating raw Landsat-8/9 Band 10 Thermal Infrared Radiance to Land Surface Temperature ($LST$) using Planck's Radiation Law.
  2. **Vegetation & Emissivity Modeling:** Sentinel-2 Band 8 (NIR) & Band 4 (Red) Normalized Difference Vegetation Index ($NDVI$) and land surface emissivity ($\varepsilon$).
  3. **Multi-Criteria Optimization Engine:** Formulated the Composite Priority Index ($P$) integrating thermal load, vegetative deficit, CPCB AQI PM2.5, and informal settlement vulnerability.
  4. **Decentralized Climate Oracle:** Integration of HTTP 402 payment protocol with `@x402-avm` on Algorand Testnet.

---

## 📌 1. The Problem: Invisible Climate Inequality

Indian metropolises suffer from severe micro-climatic thermal disparity. Low-income informal settlements characterized by high-density tin roofing and sparse canopy cover experience localized ambient temperatures **8°C to 10°C higher** than affluent, tree-lined sectors located less than 3 kilometers away.

**HeatLens** transforms multi-spectral satellite telemetry and ground pollution sensors into verifiable, rankable intelligence:
1. **High-Resolution Thermal Mapping:** Uncovering micro-heat islands down to ward and slum boundaries.
2. **Vegetation Equity Auditing:** 10-meter spatial resolution canopy density from Copernicus Sentinel-2.
3. **Air Quality Index Synthesis:** Live particulate sensor feeds from Central Pollution Control Board (CPCB) monitoring stations.
4. **Autonomous NDMA Simulator:** Algorithmic recommendation engine simulating cooling interventions (cool roofs, misting stations, reflective barriers, urban forestry) adhering to National Disaster Management Authority (NDMA) Heat Action Plan guidelines.

---

## 📐 2. Mathematical Modeling & Scientific Equations

### A. Spectral Radiance to Brightness Temperature ($BT$)
Thermal Infrared Sensor (TIRS) Band 10 digital numbers ($DN$) are converted to top-of-atmosphere spectral radiance ($L_\lambda$), and subsequently inverted to Brightness Temperature ($BT$) via Planck's Law:

$$BT = \frac{K_2}{\ln\left(\frac{K_1}{L_\lambda} + 1\right)} - 273.15$$

*Where:*
* $K_1 = 774.8853 \; \text{W}/(\text{m}^2 \cdot \text{sr} \cdot \mu\text{m})$
* $K_2 = 1321.0789 \; \text{K}$
* $L_\lambda$: Top-of-Atmosphere Spectral Radiance

### B. Land Surface Temperature ($LST$) & Emissivity Correction
Surface emissivity ($\varepsilon$) is computed utilizing the proportional vegetation cover ($P_v$) derived from Sentinel-2 $NDVI$:

$$LST = \frac{BT}{1 + \left(\frac{\lambda \cdot BT}{\rho}\right) \ln(\varepsilon)}$$

*Where:*
* $\lambda$: Emitted radiance wavelength ($\sim 10.895 \; \mu\text{m}$)
* $\rho = h \cdot \frac{c}{\sigma} = 1.438 \times 10^{-2} \; \text{m}\cdot\text{K}$
* $\varepsilon = 0.004 \cdot P_v + 0.986$

### C. Normalized Difference Vegetation Index ($NDVI$)
Computed across 10-meter resolution multi-spectral bands:

$$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}} = \frac{\text{Band 8} - \text{Band 4}}{\text{Band 8} + \text{Band 4}}$$

### D. Composite Priority Index ($P$) for Heat Action Planning
Wards and vulnerable clusters are evaluated across four normalized dimensions:

$$P = 0.35 \cdot \overline{\text{LST}} + 0.25 \cdot (1 - \overline{\text{NDVI}}) + 0.20 \cdot \overline{\text{AQI}} + 0.20 \cdot \text{Risk}_{\text{informal}}$$

---

## ⛓️ 3. Decentralized x402 Oracle Architecture on Algorand

HeatLens operates as an autonomous **Climate Intelligence Micro-Oracle**:

```
 [Client / AI Agent / NGO] 
            │
            ▼
    [GET /ward-audit]
            │
            ▼
 ◄── 402 Payment Required (Price: $0.005 USDC, Algorand Testnet)
            │
    [Pera / Defly Wallet Signs Txn]
            │
            ▼
  [GoPlausible Facilitator Settlement]
            │
            ▼
 ◄── 200 OK + Cryptographic Climate Audit Payload
            │
            ▼
  [Immutable Receipt on Lora Explorer (Algorand Testnet)]
```

* **HTTP 402 Protocol:** AI agents and enterprise auditors pay micro-settlements (**$0.005 to $0.010 USDC**) per satellite audit without centralized API subscription locks.
* **On-Chain Settlement:** Settled via `@x402-avm` smart contracts and verified on **Lora Algorand Explorer**.

---

## 🛠️ 4. Technology Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Leaflet.js (Choropleth Ward Visualizer), `@txnlab/use-wallet` (Pera / Defly Wallet connector).
* **Backend & API:** TypeScript, Hono.js runtime, `@x402-avm` Protocol Suite (`@x402/core`, `@x402/hono`, `@x402/avm`).
* **Geospatial & Remote Sensing:** Landsat-8/9 TIRS Band 10 LST engine, Sentinel-2 NDVI canopy extraction, GeoJSON Delhi NCR administrative boundaries.
* **Data Sources:** NASA USGS EarthExplorer, ESA Copernicus Open Access Hub, Central Pollution Control Board (CPCB) NAQI.

---

## 🚀 5. Local Setup & Reproduction

### Prerequisites:
* Node.js v18.0+
* Pera Algo Wallet (configured to Algorand Testnet with test USDC/ALGO)

### 1. Backend Service
```bash
cd backend
npm install
npm start
# Server boots on http://localhost:4021
```

### 2. Frontend Interface
```bash
cd frontend
npm install
npm run dev
# Interactive GIS portal boots on http://localhost:5173
```

---

## 📜 6. Verified Oracle Endpoints

| Endpoint | Method | Cost | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/heat-equity/ward-summary` | `GET` | **FREE** | Public overview of Delhi NCR ward outlines & baseline metrics. |
| `/api/v1/heat-equity/ward-audit` | `GET` | **$0.005 USDC** | x402-protected deep satellite LST, NDVI & inequality gap audit. |
| `/api/v1/agent/hap-recommendation` | `POST` | **$0.010 USDC** | x402-protected NDMA Heat Action Plan cooling ROI simulation. |

---

## 📄 License & Attribution
Distributed under the MIT License. Developed collaboratively by **Team eco builders** at ABES Engineering College for *Build with Bharat 2.0 (NIT Delhi)*.
