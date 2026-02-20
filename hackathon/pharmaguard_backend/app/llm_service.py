from __future__ import annotations

import os
from typing import Dict

import httpx


def _build_prompt(gene: str, diplotype: str, phenotype: str, drug: str) -> str:
    return (
        "Explain the pharmacogenomic impact of the following context.\n"
        f"Gene: {gene}\n"
        f"Diplotype: {diplotype}\n"
        f"Phenotype: {phenotype}\n"
        f"Drug: {drug}\n\n"
        "Include:\n"
        "- The biological mechanism of how this genotype affects drug metabolism or transport.\n"
        "- A CPIC-aligned clinical recommendation for prescribing or dosing.\n"
        "- Keep the explanation concise and clinically oriented.\n"
    )


def _static_explanation_template(
    gene: str, diplotype: str, phenotype: str, drug: str
) -> Dict[str, str]:
    return {
        "summary": (
            f"The diplotype {diplotype} in {gene} is associated with the "
            f"{phenotype} phenotype, which can influence response to {drug}."
        ),
        "mechanism": (
            "Variation in this gene alters enzyme activity or transporter "
            "function, which can change drug exposure and clinical effect."
        ),
        "clinical_guideline_reference": "CPIC Level A",
    }


async def generate_explanation(
    gene: str, diplotype: str, phenotype: str, drug: str
) -> Dict[str, str]:
    """
    Optionally call an external LLM to generate an explanation.
    If no API key/base URL/model is provided, returns a static template.
    """
    api_key = os.getenv("LLM_API_KEY")
    api_base = os.getenv("LLM_API_BASE")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")

    if not api_key or not api_base:
        return _static_explanation_template(gene, diplotype, phenotype, drug)

    prompt = _build_prompt(gene, diplotype, phenotype, drug)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a clinical pharmacogenomics expert."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(api_base, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
    except Exception:
        # On any failure, return static deterministic explanation
        return _static_explanation_template(gene, diplotype, phenotype, drug)

    # Try to extract the generated text; fall back gracefully if structure differs
    summary_text = None
    try:
        summary_text = data["choices"][0]["message"]["content"]
    except Exception:
        summary_text = None

    if not summary_text:
        return _static_explanation_template(gene, diplotype, phenotype, drug)

    return {
        "summary": summary_text.strip(),
        "mechanism": (
            "Mechanistic details are described in the generated summary above; "
            "see CPIC guidelines for gene- and drug-specific evidence."
        ),
        "clinical_guideline_reference": "CPIC Level A",
    }

