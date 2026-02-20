from __future__ import annotations

from typing import Dict, Optional


DRUG_TO_GENE: Dict[str, str] = {
    "CODEINE": "CYP2D6",
    "CLOPIDOGREL": "CYP2C19",
    "WARFARIN": "CYP2C9",
    "SIMVASTATIN": "SLCO1B1",
    "AZATHIOPRINE": "TPMT",
    "FLUOROURACIL": "DPYD",
}


def map_drug_to_gene(drug_name: str) -> Optional[str]:
    """
    Map a (normalized, uppercase) drug name to its primary pharmacogene.
    """
    return DRUG_TO_GENE.get(drug_name.upper())

