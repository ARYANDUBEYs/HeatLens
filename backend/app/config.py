"""
Centralized Configuration and Dynamic Corridor Registry
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh
"""

from typing import Dict, Tuple, Optional, List
from pathlib import Path
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class CorridorDefinition(BaseModel):
    """
    Geospatial and regulatory configuration for an active atmospheric corridor.
    """
    id: str
    name: str
    country: str
    bounding_box: Tuple[float, float, float, float] = Field(
        ...,
        description="Bounding box in WGS84 coordinates: (min_lon, min_lat, max_lon, max_lat)"
    )
    crs: str = Field(
        ...,
        description="Projected Coordinate Reference System (UTM) for metric distance calculations"
    )
    utm_zone: str
    default_insitu_provider: str
    target_resolution_meters: float = 30.0
    primary_hazards: List[str]


class Settings(BaseSettings):
    """
    Production Application Settings utilizing Pydantic Settings.
    Loads from environment variables and `.env` file automatically.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # Core Application Metadata
    PROJECT_NAME: str = "HeatLens Earth Observation & Spatiotemporal ML Pipeline"
    PROJECT_ID: str = "Mitacs-GRI-53438"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # Directory Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    RAW_DATA_DIR: Path = BASE_DIR / "data" / "raw"
    OUTPUTS_DATA_DIR: Path = BASE_DIR / "data" / "outputs"

    # Satellite & Environmental Data Ingestion APIs
    COPERNICUS_CLIENT_ID: Optional[str] = None
    COPERNICUS_CLIENT_SECRET: Optional[str] = None
    NASA_EARTHDATA_BEARER_TOKEN: Optional[str] = None
    ECCC_DATAMART_BASE_URL: str = "https://dd.weather.gc.ca"
    CPCB_API_KEY: Optional[str] = None

    # Algorand Testnet Oracle Infrastructure
    ALGOD_NODE_URL: str = "https://testnet-api.algonode.cloud"
    ALGOD_PORT: str = ""
    ALGOD_TOKEN: str = ""
    ALGORAND_ORACLE_MNEMONIC: Optional[str] = None
    ALGORAND_ORACLE_ACCOUNT: Optional[str] = None
    USDC_TESTNET_ASA_ID: int = 10458941
    X402_PRICE_PER_QUERY_USDC: float = 0.005

    # Dynamic Corridor Definitions
    CORRIDORS: Dict[str, CorridorDefinition] = {
        "kamloops": CorridorDefinition(
            id="kamloops",
            name="Kamloops (Thompson-Nicola Valley Corridor, BC)",
            country="Canada",
            bounding_box=(-120.55, 50.55, -120.15, 50.80),
            crs="EPSG:32610",
            utm_zone="UTM Zone 10N",
            default_insitu_provider="ECCC_NAPS",
            target_resolution_meters=30.0,
            primary_hazards=["WILDFIRE_SMOG", "VALLEY_INVERSION", "PM2.5_POOLING"]
        ),
        "delhi": CorridorDefinition(
            id="delhi",
            name="Delhi NCR Urban Heat Equity Corridor",
            country="India",
            bounding_box=(76.85, 28.40, 77.40, 28.90),
            crs="EPSG:32643",
            utm_zone="UTM Zone 43N",
            default_insitu_provider="CPCB",
            target_resolution_meters=30.0,
            primary_hazards=["EXTREME_LST_HEATWAVE", "CANOPY_DEFICIT", "WINTER_SMOG"]
        )
    }

    def get_corridor(self, corridor_id: str) -> CorridorDefinition:
        """Retrieves corridor definition by key with case-insensitive fallback."""
        key = corridor_id.lower().strip()
        if key not in self.CORRIDORS:
            raise KeyError(f"Corridor '{corridor_id}' is not registered. Available: {list(self.CORRIDORS.keys())}")
        return self.CORRIDORS[key]


# Global Settings Singleton
settings = Settings()
