import streamlit as st
import requests
import pandas as pd

# Page Config
st.set_page_config(page_title="PharmaGuard AI", layout="wide")

# Custom CSS for reliability and "Medical" feel
st.markdown("""
    <style>
    .main { background-color: #f5f7f9; }
    .stAlert { border-radius: 10px; }
    .status-card { padding: 20px; border-radius: 10px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    </style>
    """, unsafe_allow_html=True)

st.title("🧬 PharmaGuard: PGx Risk Assistant")
st.sidebar.header("Patient Upload")

# Sidebar - Inputs
uploaded_file = st.sidebar.file_uploader("Upload VCF File", type=['vcf'])
drug_name = st.sidebar.selectbox("Select Medication", ["Clopidogrel", "Warfarin", "Codeine", "Simvastatin"])

if st.sidebar.button("Analyze Risk") and uploaded_file:
    with st.spinner("Analyzing genomic variants..."):
        # Prepare file for API
        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "text/plain")}
        data = {"drug": drug_name}
        
        try:
            # Connect to your existing FastAPI Backend
            response = requests.post("http://127.0.0.1:8000/analyze", files=files, data=data)
            res = response.json()

            # --- UI LAYOUT ---
            col1, col2 = st.columns([1, 2])

            with col1:
                st.subheader("Risk Assessment")
                risk = res['risk_assessment']['risk_label']
                severity = res['risk_assessment']['severity']
                
                # Visual Alert based on Risk
                if risk == "Safe":
                    st.success(f"### ✅ {risk}")
                elif risk in ["Adjust Dosage", "Unknown"]:
                    st.warning(f"### ⚠️ {risk}")
                else:
                    st.error(f"### 🚨 {risk}")
                
                st.metric("Confidence Score", f"{res['risk_assessment']['confidence_score'] * 100}%")
                st.info(f"**Severity:** {severity.capitalize()}")

            with col2:
                st.subheader("Pharmacogenomic Profile")
                profile = res['pharmacogenomic_profile']
                
                # Clean Data Table
                profile_data = {
                    "Metric": ["Primary Gene", "Diplotype", "Phenotype"],
                    "Result": [profile['primary_gene'], profile['diplotype'], profile['phenotype']]
                }
                st.table(pd.DataFrame(profile_data))

            # AI Explanation Section
            st.divider()
            with st.expander("📝 View Clinical Interpretation", expanded=True):
                st.write(res['llm_generated_explanation']['summary'])
                st.caption(f"**Guideline:** {res['llm_generated_explanation']['clinical_guideline_reference']}")

        except Exception as e:
            st.error(f"Connection Error: Ensure your FastAPI backend is running! ({e})")
else:
    st.info("Please upload a patient VCF file and select a drug to begin.")