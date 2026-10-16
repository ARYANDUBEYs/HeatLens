"""
HeatLens Production FastAPI Server
Mitacs Globalink Research Internship Project #53438 - Thompson Rivers University (Kamloops, BC)
Lead Researcher: Rohit Singh
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import air_quality, simulation, attestation

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("heatlens.server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🛰️ Initializing HeatLens Earth Observation & Spatiotemporal ML Pipeline...")
    logger.info(f"🍁 Active Project: {settings.PROJECT_NAME} ({settings.PROJECT_ID})")
    logger.info(f"📍 Registered Corridors: {list(settings.CORRIDORS.keys())}")
    
    # Ensure raw and outputs storage directories exist
    settings.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.OUTPUTS_DATA_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"📂 Output GeoTIFF Cache: {settings.OUTPUTS_DATA_DIR}")

    yield
    logger.info("🛑 Shutting down HeatLens ML Engine.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production Earth Observation, Atmospheric Inversion Physics, Spatiotemporal "
        "Regression-Kriging, and Algorand Attestation Oracle Backend "
        "(Mitacs Globalink Research Internship Project #53438 — Dr. Vijal Jain, Thompson Rivers University)."
    ),
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration: allow localhost frontend ports (React Vite, Next.js, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://heat-lens-ecobuilders.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Assemble Routers
app.include_router(air_quality.router)
app.include_router(simulation.router)
app.include_router(attestation.router)


@app.get("/health", tags=["Health & Status"])
@app.get("/api/v1/health", tags=["Health & Status"])
def health_check():
    """
    Returns pipeline health status, corridor profiles, and active ML model configurations.
    """
    corridor_profiles = {}
    for cid, defn in settings.CORRIDORS.items():
        corridor_profiles[cid] = {
            "name": defn.name,
            "crs": defn.crs,
            "utm_zone": defn.utm_zone,
            "bounding_box": defn.bounding_box,
            "default_provider": defn.default_insitu_provider,
            "hazards": defn.primary_hazards
        }

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "project_id": settings.PROJECT_ID,
        "institution": "Thompson Rivers University (Kamloops, BC)",
        "version": settings.VERSION,
        "pipeline_stages": [
            "1. Radiative Transfer (Landsat-9 TIRS Band 10 & Sobrino Emissivity LST)",
            "2. Atmospheric Boundary Layer Inversion Severity Index (ISI)",
            "3. Two-Stage XGBoost + Ordinary Residual Kriging",
            "4. Epistemic Uncertainty & Sensor Void Vulnerability Index (SVVI)",
            "5. Municipal Clean-Air Shelter Integer Linear Programming (PuLP)",
            "6. Algorand Web3 SHA-256 State Proof Attestation"
        ],
        "active_corridors": corridor_profiles,
        "algorand_network": "Algorand Testnet (AVM)",
        "docs_url": "/docs"
    }


@app.get("/", tags=["Health & Status"])
def root():
    return {
        "message": "HeatLens Spatiotemporal ML Engine & Algorand Oracle Online",
        "health": "/health",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
