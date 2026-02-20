# PharmaGuard Backend

PharmaGuard is a rule-based pharmacogenomic risk prediction backend built with FastAPI. It parses VCF files, extracts key pharmacogenomic variants, determines diplotypes and phenotypes, and returns a structured JSON risk assessment for selected drugs. An optional LLM module can generate human-readable explanations.

## Tech Stack

- **Language**: Python 3.11
- **Framework**: FastAPI
- **Data validation**: Pydantic v2
- **Server**: Uvicorn
- **File uploads**: python-multipart
- **Config**: python-dotenv
- **HTTP client**: httpx (for optional LLM integration)

## Project Structure

```text
pharmaguard_backend/
  app/
    main.py
    models.py
    vcf_parser.py
    gene_rules.py
    drug_rules.py
    phenotype_mapper.py
    risk_engine.py
    llm_service.py
    utils.py
  requirements.txt
  .env.example
  README.md
  sample_data/
    sample.vcf
```

## Installation

From the `pharmaguard_backend` directory:

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set your LLM variables if desired:

```bash
cp .env.example .env
```

If `LLM_API_KEY` is not set, the service will return a static explanation template.

## Running the Server

From the `pharmaguard_backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Endpoint

- **POST** `/analyze`
  - **Request**: `multipart/form-data`
    - `file`: VCF file (`UploadFile`)
    - `drug`: string, may be a comma-separated list of supported drugs (e.g. `"clopidogrel"` or `"clopidogrel,warfarin"`)
  - **Behavior**:
    - Validates VCF format and size (`< 5 MB`)
    - Parses variants for pharmacogenes: `CYP2D6`, `CYP2C19`, `CYP2C9`, `SLCO1B1`, `TPMT`, `DPYD`
    - Determines diplotype and phenotype for the primary gene mapped from the first supported drug in the list
    - Computes a deterministic risk assessment
    - Optionally calls an LLM for an explanation (or returns a static explanation if no API key)
  - **Response**: JSON object following the strict schema defined in `app/models.py`.

## Supported Drugs

Drug names are validated case-insensitively and may be passed as a comma-separated string.

- `CODEINE` → `CYP2D6`
- `CLOPIDOGREL` → `CYP2C19`
- `WARFARIN` → `CYP2C9`
- `SIMVASTATIN` → `SLCO1B1`
- `AZATHIOPRINE` → `TPMT`
- `FLUOROURACIL` → `DPYD`

If multiple drugs are provided, the backend will:

- Use the **first supported drug** in the list as the primary context for risk analysis
- Echo the original `drug` string back in the response

## Sample Request

Using `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/analyze" ^
  -H "accept: application/json" ^
  -F "drug=clopidogrel" ^
  -F "file=@sample_data/sample.vcf;type=text/plain"
```

## Response Schema (Overview)

The response strictly follows this shape:

- **patient_id**: string (generated UUID)
- **drug**: string (echoed from request)
- **timestamp**: ISO8601 timestamp
- **risk_assessment**:
  - **risk_label**: `Safe | Adjust Dosage | Toxic | Ineffective | Unknown`
  - **confidence_score**: float
  - **severity**: `none | low | moderate | high | critical`
- **pharmacogenomic_profile**:
  - **primary_gene**: string
  - **diplotype**: string (e.g. `"*2/*2"`)
  - **phenotype**: string (e.g. `"PM"`, `"NM"`)
  - **detected_variants**: list of `{ "rsid": "..." }`
- **clinical_recommendation**:
  - **recommendation**: string
- **llm_generated_explanation**:
  - **summary**: string
  - **mechanism**: string
  - **clinical_guideline_reference**: string
- **quality_metrics**:
  - **vcf_parsing_success**: bool
  - **variants_detected_count**: integer

## Testing with Sample VCF

A minimal test VCF file is provided at `sample_data/sample.vcf`, containing a CYP2C19 variant (`rs4244285`, `*2`). You can use it directly with the example `curl` command above.

