from __future__ import annotations

from typing import Dict


# Deterministic confidence scores by phenotype
PHENOTYPE_CONFIDENCE: Dict[str, float] = {
    "PM": 0.95,
    "IM": 0.85,
    "NM": 0.90,
    "Unknown": 0.60,
}


def _base_confidence_for_phenotype(phenotype: str) -> float:
    phenotype_norm = phenotype or "Unknown"
    return PHENOTYPE_CONFIDENCE.get(phenotype_norm, PHENOTYPE_CONFIDENCE["Unknown"])


def assess_risk(drug: str, phenotype: str) -> Dict[str, object]:
    """
    Deterministic rule-based risk engine.

    Returns:
        {
          "risk_label": "...",
          "severity": "...",
          "confidence_score": float,
        }
    """
    drug = drug.upper()
    phenotype_norm = phenotype or "Unknown"
    confidence = _base_confidence_for_phenotype(phenotype_norm)

    risk_label = "Unknown"
    severity = "low"

    # Example detailed logic for CLOPIDOGREL (CYP2C19)
    if drug == "CLOPIDOGREL":
        if phenotype_norm == "PM":
            risk_label = "Ineffective"
            severity = "high"
        elif phenotype_norm == "IM":
            risk_label = "Adjust Dosage"
            severity = "moderate"
        elif phenotype_norm == "NM":
            risk_label = "Safe"
            severity = "none"
        else:
            risk_label = "Unknown"
            severity = "low"

    # CODEINE (CYP2D6)
    elif drug == "CODEINE":
        if phenotype_norm == "PM":
            risk_label = "Ineffective"
            severity = "high"
        elif phenotype_norm in ("URM", "RM"):
            risk_label = "Toxic"
            severity = "critical"
        elif phenotype_norm == "IM":
            risk_label = "Adjust Dosage"
            severity = "moderate"
        elif phenotype_norm == "NM":
            risk_label = "Safe"
            severity = "none"
        else:
            risk_label = "Unknown"
            severity = "low"

    # WARFARIN (CYP2C9)
    elif drug == "WARFARIN":
        if phenotype_norm == "PM":
            risk_label = "Toxic"
            severity = "high"
        elif phenotype_norm == "IM":
            risk_label = "Adjust Dosage"
            severity = "moderate"
        elif phenotype_norm == "NM":
            risk_label = "Safe"
            severity = "none"
        else:
            risk_label = "Unknown"
            severity = "low"

    # SIMVASTATIN (SLCO1B1)
    elif drug == "SIMVASTATIN":
        if phenotype_norm == "PM":
            risk_label = "Toxic"
            severity = "high"
        elif phenotype_norm == "IM":
            risk_label = "Adjust Dosage"
            severity = "moderate"
        elif phenotype_norm == "NM":
            risk_label = "Safe"
            severity = "none"
        else:
            risk_label = "Unknown"
            severity = "low"

    # AZATHIOPRINE (TPMT)
    elif drug == "AZATHIOPRINE":
        if phenotype_norm == "PM":
            risk_label = "Toxic"
            severity = "critical"
        elif phenotype_norm == "IM":
            risk_label = "Adjust Dosage"
            severity = "high"
        elif phenotype_norm == "NM":
            risk_label = "Safe"
            severity = "none"
        else:
            risk_label = "Unknown"
            severity = "low"

    # FLUOROURACIL (DPYD)
    elif drug == "FLUOROURACIL":
        if phenotype_norm == "PM":
            risk_label = "Toxic"
            severity = "critical"
        elif phenotype_norm == "IM":
            risk_label = "Adjust Dosage"
            severity = "high"
        elif phenotype_norm == "NM":
            risk_label = "Safe"
            severity = "none"
        else:
            risk_label = "Unknown"
            severity = "low"

    # For RM/URM phenotypes, reuse NM confidence level when known
    if phenotype_norm in ("RM", "URM"):
        confidence = PHENOTYPE_CONFIDENCE.get("NM", confidence)

    return {
        "risk_label": risk_label,
        "severity": severity,
        "confidence_score": float(confidence),
    }

