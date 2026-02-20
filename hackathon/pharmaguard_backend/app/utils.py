from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status, UploadFile


MAX_VCF_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def get_current_timestamp() -> datetime:
    return datetime.now(timezone.utc)


def generate_patient_id() -> str:
    return str(uuid.uuid4())


def normalize_drug_input(drug_input: str) -> List[str]:
    """
    Normalize comma-separated drug input into a list of uppercase names.
    """
    if not drug_input:
        return []
    return [d.strip().upper() for d in drug_input.split(",") if d.strip()]


async def read_and_validate_vcf_file(upload_file: UploadFile) -> str:
    """
    Read uploaded VCF file contents and enforce size/security constraints.
    """
    try:
        content = await upload_file.read()
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Failed to read uploaded file"},
        ) from exc

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Empty VCF file"},
        )

    if len(content) > MAX_VCF_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "VCF file exceeds 5MB limit"},
        )

    # Decode as UTF-8, replacing invalid bytes to avoid crashes
    try:
        text = content.decode("utf-8", errors="replace")
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Unable to decode VCF file as UTF-8"},
        ) from exc

    return text

