export type RiskLabel = "Safe" | "Adjust Dosage" | "Toxic" | "Ineffective" | "Unknown";

export type SeverityLevel = "none" | "low" | "moderate" | "high" | "critical";

export interface RiskAssessment {
  risk_label: RiskLabel;
  confidence_score: number;
  severity: SeverityLevel;
}

export interface DetectedVariant {
  rsid: string;
}

export interface PharmacogenomicProfile {
  primary_gene: string;
  diplotype: string;
  phenotype: string;
  detected_variants: DetectedVariant[];
}

export interface ClinicalRecommendation {
  recommendation: string;
}

export interface LLMExplanation {
  summary: string;
  mechanism: string;
  clinical_guideline_reference: string;
}

export interface QualityMetrics {
  vcf_parsing_success: boolean;
  variants_detected_count: number;
}

export interface AnalysisResponse {
  patient_id: string;
  drug: string;
  timestamp: string;
  risk_assessment: RiskAssessment;
  pharmacogenomic_profile: PharmacogenomicProfile;
  clinical_recommendation: ClinicalRecommendation;
  llm_generated_explanation: LLMExplanation;
  quality_metrics: QualityMetrics;
}

export const SUPPORTED_DRUGS = [
  "CODEINE",
  "CLOPIDOGREL",
  "WARFARIN",
  "SIMVASTATIN",
  "AZATHIOPRINE",
  "FLUOROURACIL"
] as const;

