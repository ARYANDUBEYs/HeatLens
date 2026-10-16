"""
Algorand Web3 Attestation & State Proof Router
Mitacs Globalink Research Internship Project #53438 - Dr. Vijal Jain (Thompson Rivers University)
Lead Researcher: Rohit Singh
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.services.algorand_oracle import AlgorandAttestationOracle

router = APIRouter(prefix="/api/v1/attestation", tags=["Algorand Web3 Attestation"])

oracle = AlgorandAttestationOracle()


class AttestationStampRequest(BaseModel):
    raster_hash: str = Field(..., min_length=64, max_length=64, description="64-character SHA-256 raster digest")
    corridor_id: str = Field(default="kamloops", description="Target corridor identifier")
    metadata: Optional[Dict[str, Any]] = None


@router.post("/stamp")
def record_attestation_proof(payload: AttestationStampRequest):
    """
    Submits a cryptographic state proof carrying the raster SHA-256 hash to Algorand Testnet.
    Embeds the payload in the transaction Note field.
    """
    try:
        tx_id = oracle.record_attestation_on_chain(
            raster_hash=payload.raster_hash,
            corridor_id=payload.corridor_id,
            custom_metadata=payload.metadata
        )

        return {
            "success": True,
            "status": "ATTESTED_ON_ALGORAND_TESTNET",
            "transaction_id": tx_id,
            "network": "Algorand Testnet (AVM)",
            "raster_sha256": payload.raster_hash,
            "corridor_id": payload.corridor_id,
            "explorer_url": f"https://lora.algokit.io/testnet/transaction/{tx_id}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record attestation on Algorand: {str(e)}"
        )


@router.get("/verify/{tx_id}")
def verify_attestation_proof(
    tx_id: str,
    expected_hash: Optional[str] = Query(None, description="Optional SHA-256 hash to assert parity")
):
    """
    Queries the Algorand Testnet transaction, extracts the note field,
    and asserts cryptographic parity against the expected raster hash.
    """
    try:
        verification = oracle.verify_transaction(
            tx_id=tx_id,
            expected_hash=expected_hash or ""
        )
        return verification
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify transaction on Algorand: {str(e)}"
        )
