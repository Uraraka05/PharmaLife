from __future__ import annotations

from typing import Dict, List

from .gene_rules import (
    SUPPORTED_GENES,
    construct_diplotype_from_alleles,
    map_diplotype_to_phenotype,
)
from .vcf_parser import ParsedVariant


class PhenotypeResult(Dict[str, str]):
    gene: str
    diplotype: str
    phenotype: str


def build_gene_allele_map(variants: List[ParsedVariant]) -> Dict[str, List[str]]:
    """
    Group star alleles by gene.
    """
    gene_to_alleles: Dict[str, List[str]] = {g: [] for g in SUPPORTED_GENES}
    for var in variants:
        if var.gene in gene_to_alleles:
            gene_to_alleles[var.gene].append(var.star)
    return gene_to_alleles


def determine_gene_phenotype(
    gene: str, variants: List[ParsedVariant]
) -> PhenotypeResult:
    """
    Determine diplotype and phenotype for a given gene based on parsed variants.
    """
    gene = gene.upper()
    gene_to_alleles = build_gene_allele_map(variants)
    alleles = gene_to_alleles.get(gene, [])
    diplotype = construct_diplotype_from_alleles(alleles)
    phenotype, _description = map_diplotype_to_phenotype(gene, diplotype)
    return {
        "gene": gene,
        "diplotype": diplotype,
        "phenotype": phenotype,
    }

