from __future__ import annotations

from typing import Dict, List, Tuple


SUPPORTED_GENES: List[str] = [
    "CYP2D6",
    "CYP2C19",
    "CYP2C9",
    "SLCO1B1",
    "TPMT",
    "DPYD",
]


# Diplotype → phenotype mappings (minimal, deterministic examples)
# Phenotype codes:
# PM = Poor Metabolizer
# IM = Intermediate Metabolizer
# NM = Normal Metabolizer
# RM = Rapid Metabolizer
# URM = Ultra Rapid Metabolizer

GENE_DIPLOTYPE_TO_PHENOTYPE: Dict[str, Dict[str, str]] = {
    "CYP2C19": {
        "*1/*1": "NM",
        "*1/*2": "IM",
        "*2/*2": "PM",
        "*1/*17": "RM",
        "*17/*17": "URM",
    },
    "CYP2D6": {
        "*1/*1": "NM",
        "*1/*2": "NM",
        "*2/*2": "RM",
        "*4/*4": "PM",
        "*1/*4": "IM",
    },
    "CYP2C9": {
        "*1/*1": "NM",
        "*1/*2": "IM",
        "*1/*3": "IM",
        "*2/*2": "PM",
        "*3/*3": "PM",
    },
    "SLCO1B1": {
        "*1/*1": "NM",
        "*1/*5": "IM",
        "*5/*5": "PM",
    },
    "TPMT": {
        "*1/*1": "NM",
        "*1/*3A": "IM",
        "*3A/*3A": "PM",
    },
    "DPYD": {
        "*1/*1": "NM",
        "*1/*2A": "IM",
        "*2A/*2A": "PM",
    },
}


# Optional full phenotype descriptions if needed elsewhere.
PHENOTYPE_DESCRIPTIONS: Dict[str, str] = {
    "PM": "Poor Metabolizer",
    "IM": "Intermediate Metabolizer",
    "NM": "Normal Metabolizer",
    "RM": "Rapid Metabolizer",
    "URM": "Ultra Rapid Metabolizer",
}


# gene_rules.py - Improved allele selection
def construct_diplotype_from_alleles(alleles: List[str]) -> str:
    if not alleles:
        return "*1/*1"
    
    # Filter out *1 if other variants exist (standard PGx logic)
    variants = [a for a in alleles if a != "*1"]
    if not variants:
        return "*1/*1"
    
    if len(variants) == 1:
        return f"*1/{variants[0]}"
    
    # Sort to ensure *2/*4 is the same as *4/*2
    first_two = sorted(variants[:2])
    return f"{first_two[0]}/{first_two[1]}"


def map_diplotype_to_phenotype(gene: str, diplotype: str) -> Tuple[str, str]:
    """
    Map (gene, diplotype) to a phenotype code.

    Returns:
        (phenotype_code, description)
    """
    gene = gene.upper()
    mapping = GENE_DIPLOTYPE_TO_PHENOTYPE.get(gene, {})
    phenotype = mapping.get(diplotype)

    if phenotype is None:
        # Fallback: assume normal metabolism for default diplotype,
        # otherwise mark as Unknown.
        if diplotype == "*1/*1":
            phenotype = "NM"
        else:
            phenotype = "Unknown"

    description = PHENOTYPE_DESCRIPTIONS.get(phenotype, "Unknown phenotype")
    return phenotype, description

