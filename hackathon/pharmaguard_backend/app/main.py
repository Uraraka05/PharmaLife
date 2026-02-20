from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from .drug_rules import map_drug_to_gene
from .llm_service import generate_explanation
from .models import (
    AnalysisResponse,
    ClinicalRecommendation,
    DetectedVariant,
    LLMExplanation,
    PharmacogenomicProfile,
    QualityMetrics,
    RiskAssessment,
)
from .phenotype_mapper import determine_gene_phenotype
from .risk_engine import assess_risk
from .utils import (
    generate_patient_id,
    get_current_timestamp,
    normalize_drug_input,
    read_and_validate_vcf_file,
)
from .vcf_parser import ParsedVariant, parse_vcf_contents


load_dotenv()

app = FastAPI(
    title="PharmaGuard Backend",
    description="Rule-based pharmacogenomic risk prediction API",
    version="1.0.0",
)

# CORS configuration: allow local frontends and future production domain
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pharmaguard.example.com",  # placeholder for future production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not os.getenv("ALLOW_ALL_ORIGINS") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post(
    "/analyze",
    response_model=AnalysisResponse,
    response_model_exclude_none=True,
)
async def analyze(
    file: UploadFile = File(...),
    drug: str = Form(...),
) -> AnalysisResponse:
    """
    Analyze a VCF file and a target drug to return a structured
    pharmacogenomic risk assessment.
    """
    if not file.filename.lower().endswith(".vcf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Uploaded file must be a VCF file"},
        )

    # Normalize and validate drug input
    normalized_drugs = normalize_drug_input(drug)
    if not normalized_drugs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "No drug specified"},
        )

    primary_drug = None
    primary_gene = None
    for d in normalized_drugs:
        gene = map_drug_to_gene(d)
        if gene:
            primary_drug = d
            primary_gene = gene
            break

    if not primary_drug or not primary_gene:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Unsupported drug"},
        )

    # Read and validate VCF contents
    vcf_text = await read_and_validate_vcf_file(file)

    try:
        vcf_parsing_success, variants = parse_vcf_contents(vcf_text)
    except HTTPException:
        # Propagate HTTPExceptions as-is
        raise
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Internal VCF parsing error"},
        ) from exc

    if vcf_parsing_success and not variants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "No pharmacogenomic variants found"},
        )

    # Filter variants for primary gene
    primary_gene_variants = [v for v in variants if v.gene == primary_gene]
    if not primary_gene_variants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": f"No pharmacogenomic variants found for {primary_gene}"},
        )

    # Determine diplotype and phenotype
    phenotype_result = determine_gene_phenotype(primary_gene, variants)
    diplotype = phenotype_result["diplotype"]
    phenotype = phenotype_result["phenotype"]

    # Assess risk using deterministic rules
    risk = assess_risk(primary_drug, phenotype)

    # Clinical recommendation text (simple deterministic mapping)
    recommendation_text = _build_clinical_recommendation(primary_drug, phenotype, risk)

    # LLM explanation (optional)
    llm_result_dict = await generate_explanation(
        gene=primary_gene,
        diplotype=diplotype,
        phenotype=phenotype,
        drug=primary_drug,
    )

    llm_explanation = LLMExplanation(**llm_result_dict)

    detected_variant_models = [
        DetectedVariant(rsid=v.rsid) for v in primary_gene_variants
    ]

    response = AnalysisResponse(
        patient_id=generate_patient_id(),
        drug=drug,
        timestamp=get_current_timestamp(),
        risk_assessment=RiskAssessment(
            risk_label=risk["risk_label"],
            confidence_score=risk["confidence_score"],
            severity=risk["severity"],
        ),
        pharmacogenomic_profile=PharmacogenomicProfile(
            primary_gene=primary_gene,
            diplotype=diplotype,
            phenotype=phenotype,
            detected_variants=detected_variant_models,
        ),
        clinical_recommendation=ClinicalRecommendation(
            recommendation=recommendation_text,
        ),
        llm_generated_explanation=llm_explanation,
        quality_metrics=QualityMetrics(
            vcf_parsing_success=vcf_parsing_success,
            variants_detected_count=len(variants),
        ),
    )

    return response


def _build_clinical_recommendation(
    drug: str, phenotype: str, risk: dict
) -> str:
    """
    Deterministic generation of a short clinical recommendation string.
    """
    drug = drug.upper()
    phenotype = phenotype or "Unknown"
    risk_label = risk.get("risk_label", "Unknown")

    # Very simple rule-based phrases.
    if risk_label == "Safe":
        return f"For {drug}, the {phenotype} phenotype suggests standard dosing is appropriate."
    if risk_label == "Adjust Dosage":
        return (
            f"For {drug}, the {phenotype} phenotype suggests dose adjustment "
            "or alternative therapy following CPIC guidelines."
        )
    if risk_label == "Toxic":
        return (
            f"For {drug}, the {phenotype} phenotype indicates an increased toxicity "
            "risk; consider alternative therapy or substantial dose reduction."
        )
    if risk_label == "Ineffective":
        return (
            f"For {drug}, the {phenotype} phenotype predicts reduced effectiveness; "
            "consider an alternative agent not primarily metabolized by this pathway."
        )
    return (
        f"For {drug}, the pharmacogenomic impact is uncertain based on the "
        f"{phenotype} phenotype; follow standard clinical practice and consider "
        "consulting detailed CPIC guidelines."
    )


@app.get("/health")
async def health() -> dict:
    """
    Simple health check endpoint.
    """
    return {"status": "ok", "env": "development" if os.getenv("DEBUG") else "production"}

