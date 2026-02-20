from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Tuple

from fastapi import HTTPException, status

from .gene_rules import SUPPORTED_GENES


@dataclass
class ParsedVariant:
    gene: str
    rsid: str
    star: str


def _parse_info_field(info: str) -> Dict[str, str]:
    """
    Parse the INFO column of a VCF line into a dict of key → value.
    Example: "GENE=CYP2C19;STAR=*2;RS=rs4244285"
    """
    result: Dict[str, str] = {}
    for item in info.split(";"):
        if not item:
            continue
        if "=" in item:
            key, value = item.split("=", 1)
            result[key.strip().upper()] = value.strip()
    return result


def parse_vcf_contents(vcf_text: str) -> Tuple[bool, List[ParsedVariant]]:
    """
    Parse VCF text and extract pharmacogenomic variants for supported genes.
    Updated to filter by Genotype (GT) to ensure patient actually has the variant.
    """
    if not vcf_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "VCF file is empty"},
        )

    lines = vcf_text.splitlines()
    has_header = any(line.startswith("#CHROM") for line in lines)
    if not has_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid VCF: missing #CHROM header"},
        )

    variants: List[ParsedVariant] = []
    for line in lines:
        if not line or line.startswith("#"):
            continue

        cols = line.split("\t")
        # Ensure line has enough columns for INFO (7) and Sample Data (9)
        if len(cols) < 10:
            continue

        # 1. Extract Genotype (GT) from the last column (Patient Data)
        # Genotype is the first part before the colon, e.g., "0/1:45:99..." -> "0/1"
        genotype = cols[9].split(":")[0]

        # 2. FILTER: Only process variants the patient actually has
        # 0/0 means wild-type (normal/no mutation). We skip these.
        if genotype == "0/0" or genotype == "./.":
            continue

        rsid_col = cols[2].strip()
        info_col = cols[7].strip()

        info_dict = _parse_info_field(info_col)
        gene = info_dict.get("GENE")
        star = info_dict.get("STAR")
        rs_from_info = info_dict.get("RS")

        if not gene or not star:
            continue

        gene = gene.upper()
        if gene not in SUPPORTED_GENES:
            continue

        rsid = rs_from_info or rsid_col
        if not rsid or rsid == ".":
            rsid = "unknown"

        variants.append(ParsedVariant(gene=gene, rsid=rsid, star=star))

    return True, variants