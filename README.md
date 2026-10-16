# 🛰️ HeatLens: Autonomous Earth Observation & Spatiotemporal ML Downscaling Platform

[![Mitacs GRI 2027](https://img.shields.io/badge/Mitacs_GRI_2027-Project_%2353438-D32F2F?style=for-the-badge&logo=canada&logoColor=white)](https://www.mitacs.ca/our-programs/globalink-research-internship-students/)
[![Thompson Rivers University](https://img.shields.io/badge/Host_Institution-Thompson_Rivers_University_(Kamloops,_BC)-004B87?style=for-the-badge)](https://www.tru.ca/)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18 Leaflet](https://img.shields.io/badge/Frontend-React_18_+_Leaflet_GIS-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Algorand AVM](https://img.shields.io/badge/State_Proof-Algorand_Testnet-000000?style=for-the-badge&logo=algorand&logoColor=white)](https://lora.algokit.io/testnet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Predicting Urban Air Quality & Smog Episodes in Canadian Cities Using Satellite Imagery, Radiative Transfer Physics, and Geostatistical Machine Learning**  
> **Lead Researcher:** Rohit Singh (B.Tech Computer Science & Engineering - AI/ML)  
> **Faculty Mentor / Supervisor:** Dr. Vijal Jain (Department of Computing Science, Thompson Rivers University, Kamloops, BC, Canada)  
> **Research Focus:** Atmospheric Boundary Layer Dynamics, Land Surface Temperature Radiative Inversion, Two-Stage Regression-Kriging, and Mixed-Integer Municipal Resource Allocation.

---

## 🍁 Abstract & Core Problem Statement

Mountain valley communities across British Columbia—most acutely the **Kamloops Thompson Valley basin** (Bounding Box: WGS84 `[-120.55, 50.55, -120.15, 50.80]`, projected to UTM Zone 10N / `EPSG:32610`)—suffer from severe, recurring air quality degradation during summer wildfire seasons and winter residential heating episodes. This vulnerability is governed by unique topographical and micrometeorological phenomena:

1. **Mountain Valley Thermal Inversions:** Cold, dense air drains into valley troughs ($340\,\text{m}\,\text{MSL}$) overnight, while warm air aloft creates an impenetrable atmospheric capping lid ($400\,\text{m}$ to $800\,\text{m}$ Boundary Layer Height). Smoke and combustion particulates become trapped in the breathable human zone.
2. **Epistemic Ground Monitor Voids:** Ground stations operated by Environment and Climate Change Canada (ECCC) and the National Air Pollution Surveillance (NAPS) program provide gold-standard accuracy but are geographically sparse, leaving $25\,\text{km}$ to $45\,\text{km}$ voids across peri-urban settlements, indigenous reserves, and agricultural valleys.
3. **Spaceborne Spatial Resolution Mismatch:** Spaceborne radiometers like **Copernicus Sentinel-5P TROPOMI** provide synoptic global coverage of Tropospheric $\text{NO}_2$ and UV Aerosol Index ($\text{UVAI}$), but operate at coarse footprints ($3.5 \times 5.5\,\text{km}$). High-resolution thermal platforms like **Landsat-8/9 TIRS Band 10** ($100\,\text{m}$) capture thermal surface signatures but do not directly measure ground particulate concentrations.

**HeatLens** resolves this fundamental disconnect. By coupling physical radiative transfer models (Planck's Radiation Law, Sobrino fractional vegetation emissivity) with an atmospheric boundary layer Inversion Severity Index ($\text{ISI}$) and a **Two-Stage Regression-Kriging** pipeline, HeatLens downscales spaceborne radiances to a continuous **30-meter ground-level air quality grid** ($\text{PM}_{2.5}$ and $\text{AQHI}$).

Furthermore, HeatLens incorporates a **PuLP Mixed-Integer Linear Programming (ILP)** solver for municipal clean-air shelter allocation and an **Algorand Testnet Oracle** that records immutable SHA-256 state proofs of downscaled matrices for municipal public health compliance audits.

---

## 🏛️ System Architecture Workflow

```
       SPACEBORNE EARTH OBSERVATION & METEOROLOGICAL TELEMETRY
  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
  │  Sentinel-5P (TROPOMI) │  │  Landsat-8/9 (TIRS-10) │  │  ERA5 Boundary Layer   │
  │  NO2 & UV Aerosol Idx  │  │  Digital Numbers Q_cal │  │  BLH, Geopotential Ht  │
  └───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘
              │                           │                           │
              └─────────────────────┐     │     ┌─────────────────────┘
                                    ▼     ▼     ▼
  ===================================================================================
                       STAGE 1: PHYSICS & RADIATIVE TRANSFER ENGINE
                                 (app/core/physics.py)
  -----------------------------------------------------------------------------------
   • Planck Spectral Radiance Inversion:  L_λ = M_L * Q_cal + A_L
   • Top-of-Atmosphere Brightness Temp:   BT = K2 / ln(K1 / L_λ + 1) - 273.15
   • Sobrino Fractional Vegetation Cover: P_v = ((NDVI - NDVI_min)/(NDVI_max - NDVI_min))^2
   • Emissivity & Land Surface Temp:      LST = BT / (1 + (λ * BT / ρ) * ln(ε)) - 273.15
   • Valley Thermal Inversion Index:      ISI = σ(α * max(0, ∇_z T) + β * (BLH_crit - BLH))
  ===================================================================================
                                          │
                                          ▼
  ===================================================================================
                  STAGE 2: TWO-STAGE GEOSTATISTICAL REGRESSION-DOWNSCALER
                                (app/core/downscaler.py)
  -----------------------------------------------------------------------------------
   [Stage 2A: Deterministic Gradient-Boosted Non-Linear Environmental Mapping]
     Train XGBoost Regressor: Z(s) ~ f(TROPOMI_NO2, UVAI, LST, DEM, Slope, Wind, BLH, ISI)
     Compute Deterministic Trend Field: Trend_hat(s_0) across 30m grid.

   [Stage 2B: Stochastic Residual Modeling via PyInterpolate]
     Compute In-Situ Residuals: e(s_i) = Z(s_i) - Trend_hat(s_i)
     Fit Theoretical Semivariogram γ(h) (Spherical / Exponential model)
     Execute Ordinary Kriging over 30m spatial grid: e_hat(s_0) + Kriging Variance σ^2_E(s_0)

   [Reconstruction & Uncertainty Synthesis]
     Final 30m Prediction: Z_hat(s_0) = Trend_hat(s_0) + e_hat(s_0)
     Calculate Sensor Void Vulnerability Index (SVVI): D_norm(s) * σ^2_E_norm(s) * AQHI(s)
  ===================================================================================
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
  =====================================       =====================================
    STAGE 3: MUNICIPAL ILP OPTIMIZER            STAGE 4: ALGORAND WEB3 ATTESTATION
          (app/core/optimizer.py)                  (app/services/algorand_oracle.py)
  -------------------------------------       -------------------------------------
   • PuLP Integer Linear Program (CBC)         • Deterministic SHA-256 Raster Matrix
   • Variables: x_j (HEPA Hub, $7,500 CAD)       Digest Computation
     z_j (IoT Sensor Node, $850 CAD)           • Transaction Note Encoding on Testnet
   • Maximize: ∑ Pop_j * SVVI_j * (x_j+0.3z_j) • Immutable Verification & Non-
   • Budget Constraint: Total Spend ≤ Ceiling    Repudiation for Health Audits
  =====================================       =====================================
                    │                                           │
                    └─────────────────────┬─────────────────────┘
                                          ▼
  ===================================================================================
                        STAGE 5: INTERACTIVE GIS COMMAND CENTER
                     (heatlens-frontend: React 18 + Leaflet + Vite)
  -----------------------------------------------------------------------------------
   • Aerospace CartoDB Dark Matter Basemap with smooth corridor auto-fly
   • Continuous Quad Mesh Choropleth: AQHI, PM2.5 (30m), Inversion Lid (ISI), SVVI
   • High-Tech Orbital Satellite Radar Swath Sweep Simulation Overlay
   • Live Telemetry Popups & Custom SVG Markers: Regulatory Monitors, Shelters, IoT
  ===================================================================================
```

---

## 📐 Mathematical Formulations & Scientific Formulations

### 1. Landsat-8/9 TIRS Band 10 Radiative Transfer to Brightness Temperature ($BT$)
Raw quantized Digital Numbers ($Q_{cal}$) are converted to Top-of-Atmosphere (TOA) spectral radiance ($L_\lambda$), and inverted to Brightness Temperature ($BT$) using Planck's Radiation Law:

$$L_\lambda = M_L \cdot Q_{cal} + A_L$$

$$BT = \frac{K_2}{\ln\left(\frac{K_1}{L_\lambda} + 1\right)} - 273.15$$

*Calibration Constants for Landsat-8/9 Band 10:*
* Radiance Mult Band ($M_L$): $0.0003342$
* Radiance Add Band ($A_L$): $0.1$
* Thermal Conversion Constant $K_1$: $774.8853\,\text{W}/(\text{m}^2 \cdot \text{sr} \cdot \mu\text{m})$
* Thermal Conversion Constant $K_2$: $1321.0789\,\text{K}$

### 2. Sobrino Fractional Vegetation Cover & Land Surface Temperature ($LST$)
To correct for emissivity variations across diverse terrain (coniferous forests, urban asphalt, river valleys), land surface emissivity ($\varepsilon$) is calculated via fractional vegetation cover ($P_v$):

$$P_v = \left(\frac{\text{NDVI} - \text{NDVI}_{min}}{\text{NDVI}_{max} - \text{NDVI}_{min}}\right)^2, \quad \text{with } \text{NDVI}_{min}=0.05, \; \text{NDVI}_{max}=0.70$$

$$\varepsilon = 0.004 \cdot P_v + 0.986$$

$$LST = \frac{BT}{1 + \left(\frac{\lambda \cdot (BT + 273.15)}{\rho}\right) \ln(\varepsilon)} - 273.15$$

*Where:*
* Emitted center wavelength ($\lambda$): $10.895\,\mu\text{m} = 10.895 \times 10^{-6}\,\text{m}$
* Physical constant $\rho = \frac{h \cdot c}{\sigma_B} \approx 1.438 \times 10^{-2}\,\text{m}\cdot\text{K}$

### 3. Atmospheric Boundary Layer (ABL) & Thermal Inversion Severity Index ($ISI$)
Valley air stagnation occurs when nocturnal radiative cooling produces a positive vertical temperature lapse rate ($\nabla_z T > 0$) capped beneath a compressed Boundary Layer Height ($BLH$):

$$\nabla_z T = \frac{\Delta T}{\Delta z} = \frac{T_{ridge} - T_{valley}}{z_{ridge} - z_{valley}} \quad \left[\frac{^\circ\text{C}}{100\,\text{m}}\right]$$

$$ISI = \frac{1}{1 + \exp\left(-\left(w_{temp} \cdot \max(0, \nabla_z T) + w_{blh} \cdot \max\left(0, \frac{BLH_{crit} - BLH}{BLH_{crit}}\right)\right)\right)}$$

*Where $BLH_{crit} = 800\,\text{m}$, $w_{temp} = 0.60$, and $w_{blh} = 0.40$. High $ISI \to 1.0$ flags acute valley particulate stagnation.*

### 4. Two-Stage Regression-Kriging (Deterministic + Stochastic Residuals)
The spatial distribution of target concentration $Z(s)$ is modeled as the sum of a non-linear deterministic environmental trend and a spatially correlated stochastic residual:

$$Z(s) = \text{Trend}(s) + e(s)$$

**Deterministic Stage (XGBoost Regressor):**
$$\widehat{\text{Trend}}(s) = f\big(\text{TROPOMI}_{\text{NO}_2}(s), \text{UVAI}(s), LST(s), \text{Elevation}(s), \text{Slope}(s), \vec{u}(s), \vec{v}(s), BLH(s), ISI(s)\big)$$

**Stochastic Stage (Experimental Semivariogram & Ordinary Kriging):**
At regulatory monitoring stations $s_i$, residuals are computed as $e(s_i) = Z(s_i) - \widehat{\text{Trend}}(s_i)$. The experimental semivariogram is fitted:

$$\gamma(h) = \frac{1}{2 N(h)} \sum_{i=1}^{N(h)} \big(e(s_i) - e(s_i + h)\big)^2$$

Residuals $\widehat{e}(s_0)$ and estimation error variance $\sigma^2_E(s_0)$ at unmonitored 30m grid locations $s_0$ are derived by solving the Ordinary Kriging linear system with Lagrange multiplier $\mu$:

$$\sum_{j=1}^n \lambda_j \gamma(s_i, s_j) + \mu = \gamma(s_i, s_0) \quad \forall i, \quad \text{s.t.} \sum_{j=1}^n \lambda_j = 1$$

$$\widehat{Z}(s_0) = \widehat{\text{Trend}}(s_0) + \sum_{i=1}^n \lambda_i e(s_i), \qquad \sigma^2_E(s_0) = \sum_{i=1}^n \lambda_i \gamma(s_i, s_0) + \mu$$

### 5. Sensor Void Vulnerability Index ($SVVI$)
Quantifies both public health hazard and epistemic monitoring uncertainty across the spatial grid:

$$SVVI(s) = 0.40 \cdot \widetilde{D}(s) + 0.35 \cdot \widetilde{\sigma}_E^2(s) + 0.25 \cdot \widetilde{AQHI}(s)$$

*Where $\widetilde{D}(s)$ is min-max normalized Euclidean distance to the nearest regulatory ground monitor, $\widetilde{\sigma}_E^2(s)$ is normalized Kriging variance, and $\widetilde{AQHI}(s)$ is predicted health risk.*

### 6. Municipal Integer Linear Programming (ILP) Resource Allocation
Optimizes allocation of municipal clean-air interventions under budgetary ceilings using the CBC branch-and-cut solver:

$$\max \sum_{j=1}^M \text{Population}_j \cdot SVVI_j \cdot \big(x_j + 0.30 \cdot z_j\big)$$

$$\text{subject to:} \quad \sum_{j=1}^M \big(C_{\text{shelter}} \cdot x_j + C_{\text{sensor}} \cdot z_j\big) \le \text{Budget}_{\text{CAD}}, \quad x_j, z_j \in \{0, 1\}$$

*Where $x_j=1$ indicates deployment of a Municipal HEPA Clean-Air Shelter ($C_{\text{shelter}} = \$7,500\,\text{CAD}$), and $z_j=1$ deploys a Solar IoT Kriging Sensor Node ($C_{\text{sensor}} = \$850\,\text{CAD}$).*

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Spatiotemporal ML & Physics** | Python 3.10+, GDAL, Rasterio, Rioxarray, PyProj, XGBoost, Scikit-Learn, PyInterpolate, NumPy, SciPy |
| **Optimization & Solvers** | PuLP 2.9 (COIN-OR CBC Mixed-Integer Linear Programming Solver) |
| **Backend Framework** | FastAPI 0.110+, Uvicorn (ASGI), Pydantic v2, Pydantic-Settings |
| **Web3 Cryptographic Attestation** | Py-Algorand-SDK, Algorand Testnet (AVM Note Field), SHA-256 Hash Tree |
| **Frontend GIS Client** | React 18, Vite 6, Tailwind CSS, Leaflet 1.9, React-Leaflet, Lucide Icons, Axios |
| **Basemap & Vector Cartography** | CartoDB Dark Matter, GeoJSON Polygons, UTM 10N / UTM 43N Projections |

---

## 🚀 Quickstart Guide

### Option A: Local Development Setup

#### 1. Clone & Set Up Backend
```powershell
# Navigate to backend directory
cd D:\plan\buildwithbharat\ml_engine

# Create & activate virtual environment (Python 3.10+)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install pinned production dependencies
pip install -r requirements.txt

# Run the end-to-end integration test suite
python -m pytest tests/test_pipeline_e2e.py -v

# Launch the FastAPI ASGI server with auto-reload
uvicorn app.main:app --reload --port 8000
```
> **Backend Swagger UI:** `http://localhost:8000/docs`  
> **OpenAPI Schema:** `http://localhost:8000/openapi.json`

#### 2. Set Up & Launch Frontend
```powershell
# Navigate to frontend client workspace
cd D:\plan\buildwithbharat\heatlens-frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start local development server
npm run dev
```
> **Interactive GIS Dashboard:** `http://localhost:5173`

---

### Option B: Docker Containerized Deployment

```dockerfile
# Build backend container using OSGeo GDAL base
cd D:\plan\buildwithbharat\ml_engine
docker build -t heatlens-backend:2.0 .
docker run -d -p 8000:8000 --name heatlens-api heatlens-backend:2.0
```

---

## 📜 Verified API Reference & Sample Payloads

### 1. Execute Downscaling Pipeline
* **Endpoint:** `POST /api/v1/{corridor_id}/downscale`
* **Path Parameter:** `corridor_id` (`kamloops` | `delhi`)
* **Request Payload:**
```json
{
  "step_meters": 350.0,
  "save_geotiff": true
}
```
* **Sample 200 OK Response:**
```json
{
  "success": true,
  "corridor": {
    "id": "kamloops",
    "name": "Kamloops Mountain Basin (British Columbia, Canada)",
    "crs": "EPSG:32610"
  },
  "raster_metadata": {
    "resolution_meters": 350.0,
    "dimensions": { "height": 39, "width": 41 },
    "total_pixels": 1599,
    "geotiff_file": "D:\\plan\\buildwithbharat\\ml_engine\\data\\outputs\\kamloops_downscaled_20261016_221015.tif",
    "sha256_digest": "5a833cad3b9851906f3be2c168be5243b47b11349c7056b8075a834db50c9d20"
  },
  "downscaled_metrics": {
    "pm25_min_ug_m3": 18.25,
    "pm25_max_ug_m3": 89.40,
    "pm25_mean_ug_m3": 44.15,
    "peak_aqhi_score": 9.4,
    "peak_svvi_score": 0.9421,
    "max_sensor_void_km": 14.82
  }
}
```

---

### 2. Fetch Downscaled GeoJSON Mesh
* **Endpoint:** `GET /api/v1/{corridor_id}/grid?grid_dim=35`
* **Sample 200 OK Response:**
```json
{
  "type": "FeatureCollection",
  "metadata": {
    "corridor": "Kamloops Mountain Basin (British Columbia, Canada)",
    "crs": "EPSG:32610",
    "grid_dimensions": { "height": 35, "width": 35 },
    "total_polygons": 1225,
    "step_meters": 390.5
  },
  "features": [
    {
      "type": "Feature",
      "id": "KAMLOOPS_QUAD_0",
      "properties": {
        "cell_id": 0,
        "center_lon": -120.5421,
        "center_lat": 50.7951,
        "pm25": 41.2,
        "aqhi": 5.4,
        "isi": 0.724,
        "svvi": 0.812,
        "elevation": 415.2,
        "distance_km": 11.4,
        "risk_tier": "HIGH_INVERSION_RISK"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-120.5448, 50.7933],
          [-120.5394, 50.7933],
          [-120.5394, 50.7969],
          [-120.5448, 50.7969],
          [-120.5448, 50.7933]
        ]]
      }
    }
  ]
}
```

---

### 3. Municipal Shelter & Sensor Optimization (PuLP ILP)
* **Endpoint:** `POST /api/v1/{corridor_id}/shelters/optimize`
* **Request Payload:**
```json
{
  "budget_cad": 50000.0,
  "shelter_cost": 7500.0,
  "sensor_cost": 850.0
}
```
* **Sample 200 OK Response:**
```json
{
  "success": true,
  "budget_summary": {
    "allocated_budget_cad": 50000.0,
    "total_spent_cad": 49950.0,
    "unspent_surplus_cad": 50.0
  },
  "equipment_breakdown": {
    "hepa_shelters_deployed": 6,
    "hepa_shelters_total_cost_cad": 45000.0,
    "iot_kriging_sensors_deployed": 5,
    "iot_sensors_total_cost_cad": 4250.0
  },
  "social_impact_metrics": {
    "beneficiaries_served": 68700,
    "vulnerability_reduction_impact_score": 58.42
  },
  "optimal_placements": [
    {
      "zone_id": "KM_DOWNTOWN",
      "latitude": 50.6745,
      "longitude": -120.3273,
      "deploy_hepa_shelter": true,
      "deploy_iot_sensor": true,
      "population": 18500,
      "svvi_score": 0.88
    }
  ]
}
```

---

### 4. Algorand Cryptographic Attestation
* **Endpoint:** `POST /api/v1/attestation/stamp`
* **Request Payload:**
```json
{
  "raster_hash": "5a833cad3b9851906f3be2c168be5243b47b11349c7056b8075a834db50c9d20",
  "corridor_id": "kamloops"
}
```
* **Sample 200 OK Response:**
```json
{
  "success": true,
  "status": "ATTESTED_ON_ALGORAND_TESTNET",
  "transaction_id": "HD7577DIIHXBVHIRB2JL42U4XMVXBWUEPEHPWQVR4X2ZZLRFHDAA",
  "network": "Algorand Testnet (AVM)",
  "raster_sha256": "5a833cad3b9851906f3be2c168be5243b47b11349c7056b8075a834db50c9d20",
  "explorer_url": "https://lora.algokit.io/testnet/transaction/HD7577DIIHXBVHIRB2JL42U4XMVXBWUEPEHPWQVR4X2ZZLRFHDAA"
}
```

---

## 👥 Lead Author & Research Contact

* **Lead Researcher:** Rohit Singh
* **Academic Profile:** B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)
* **Institution:** ABES Engineering College, Ghaziabad (AKTU) | CGPA: 8.8 / 10.0
* **Target Program:** Mitacs Globalink Research Internship (GRI 2027)
* **Proposed Research Host:** Dr. Vijal Jain, Thompson Rivers University, Kamloops, BC, Canada (Project #53438)

---

## 📄 License
This repository is licensed under the [MIT License](LICENSE).
