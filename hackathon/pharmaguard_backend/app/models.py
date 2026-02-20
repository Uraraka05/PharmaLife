from __future__ import annotations

from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, ConfigDict, Field


class RiskAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    risk_label: Literal["Safe", "Adjust Dosage", "Toxic", "Ineffective", "Unknown"]
    confidence_score: float
    severity: Literal["none", "low", "moderate", "high", "critical"]


class DetectedVariant(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rsid: str


class PharmacogenomicProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: List[DetectedVariant]


class ClinicalRecommendation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recommendation: str


class LLMExplanation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str
    mechanism: str
    clinical_guideline_reference: str


class QualityMetrics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    vcf_parsing_success: bool
    variants_detected_count: int = Field(ge=0)


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    patient_id: str
    drug: str
    timestamp: datetime
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation
    quality_metrics: QualityMetrics

