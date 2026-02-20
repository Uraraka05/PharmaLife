import React, { useEffect, useRef, useState } from "react";
import {
  MoonIcon,
  SunIcon,
  ArrowRightCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { FileUpload } from "./components/FileUpload";
import { DrugSelector } from "./components/DrugSelector";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { VisualizationPanel } from "./components/VisualizationPanel";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { JsonPanel } from "./components/JsonPanel";
import { AboutModal } from "./components/AboutModal";
import { AnalysisResponse } from "./types";
import { analyzePharmaGuard } from "./services/api";

type ToastState = { message: string; type: "success" | "error" } | null;

export const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [drugInput, setDrugInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("pharmaguard-theme");
    if (stored === "light") {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("pharmaguard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please upload a VCF file before analyzing.");
      showToast("VCF file is required.", "error");
      return;
    }
    if (!drugInput.trim()) {
      setError("Please specify at least one medication.");
      showToast("Medication input is required.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await analyzePharmaGuard(file, drugInput);
      setResult(data);
      showToast("Analysis completed successfully.", "success");

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Unable to complete analysis. Please try again.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') setDarkMode(false);
}, []);

useEffect(() => {
  localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);

  const analyzeDisabled = !file || !drugInput.trim() || loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-950 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal to-softBlue flex items-center justify-center shadow-card">
                <span className="text-slate-950 font-semibold text-lg">PG</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-50">
                  PharmaGuard – Pharmacogenomic Risk Prediction
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
                  Clinical-grade interface for precision medicine. Upload a patient VCF,
                  select medications, and visualize rule-based pharmacogenomic risk.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAboutOpen(true)}
                className="hidden sm:inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
              >
                About pharmacogenomics
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(m => !m)}
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 p-2 text-slate-200 hover:bg-slate-800"
              >
                {darkMode ? (
                  <MoonIcon className="h-4 w-4" />
                ) : (
                  <SunIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.3fr] gap-4 lg:gap-6">
            <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <p className="text-sm sm:text-base font-medium text-slate-100">
                  Hospital-grade AI dashboard for pharmacogenomic triage.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Designed for clinical teams exploring how genetic variants shape
                  medication response. Outputs standardized, interpretable risk tiers
                  aligned with CPIC-style guidance.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
                <span className="badge bg-slate-900 border-slate-700">
                  Deterministic clinical engine
                </span>
                <span className="badge bg-slate-900 border-slate-700">
                  No genetic data stored
                </span>
                <span className="badge bg-slate-900 border-slate-700">
                  CPIC-informed interpretation
                </span>
              </div>
            </div>

            <div className="card card-hover p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Session safety notice
                </p>
                <span className="badge bg-slate-900 border-slate-700 text-[11px]">
                  Educational use only
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-300">
                This tool is for educational and research purposes only. It does not
                provide medical advice and should not be used as a substitute for
                clinician judgment or official CPIC guidelines.
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                No genetic data is persisted. All analyses run in-session in your
                browser, with results cleared when the page is closed or refreshed.
              </p>
            </div>
          </div>
        </header>

        {/* Input Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <FileUpload file={file} onFileChange={setFile} />
          <DrugSelector value={drugInput} onChange={setDrugInput} />
        </section>

        {/* Analyze Button */}
        <section className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzeDisabled}
            className={`btn-primary text-sm sm:text-base px-7 py-3.5 relative overflow-hidden ${
              analyzeDisabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <span className="mr-2 h-4 w-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
            )}
            {!loading && <ArrowRightCircleIcon className="h-5 w-5 mr-2" />}
            <span>Analyze Pharmacogenomic Risk</span>
          </button>
          <p className="text-[11px] text-slate-500">
            Ensure the VCF file and at least one supported medication are selected.
          </p>
          {error && (
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-riskDanger/70 bg-riskDanger/10 px-3 py-2 text-xs text-riskDanger max-w-xl">
              <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Analysis error</p>
                <p className="text-[11px] sm:text-xs">
                  {error}{" "}
                  {error.toLowerCase().includes("vcf") && (
                    <>
                      Please confirm the file is a valid VCF v4.2 export and does not
                      exceed 5MB.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        {loading && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            <div className="card p-5 sm:p-6 animate-pulse h-36 lg:h-40" />
            <div className="card p-5 sm:p-6 animate-pulse h-36 lg:h-40" />
            <div className="card p-5 sm:p-6 animate-pulse h-36 lg:h-40" />
          </section>
        )}

        {result && (
          <section ref={resultsRef} className="space-y-4 sm:space-y-5">
            <ResultsDashboard result={result} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
              {/* Pharmacogenomic profile + visualization */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-5">
                <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Pharmacogenomic profile
                      </p>
                      <p className="mt-1 text-sm sm:text-base font-semibold text-slate-50">
                        {result.pharmacogenomic_profile.primary_gene} •{" "}
                        {result.pharmacogenomic_profile.diplotype}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border border-softBlue/60 flex items-center justify-center overflow-hidden">
                        {/* Simple DNA helix animation */}
                        <div className="h-12 w-0.5 bg-gradient-to-b from-teal via-softBlue to-teal animate-[spin_4s_linear_infinite]" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400">Gene</span>
                      <span className="font-semibold text-slate-100">
                        {result.pharmacogenomic_profile.primary_gene}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400">Diplotype</span>
                      <span className="font-semibold text-slate-100">
                        {result.pharmacogenomic_profile.diplotype}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400">Phenotype</span>
                      <span className="font-semibold text-slate-100">
                        {result.pharmacogenomic_profile.phenotype}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400">Variants detected</span>
                      <span className="font-semibold text-slate-100">
                        {result.quality_metrics.variants_detected_count}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Detected variant rsIDs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.pharmacogenomic_profile.detected_variants.map(v => (
                        <span
                          key={v.rsid}
                          className="badge bg-slate-900 border-slate-700 text-[11px] text-slate-200"
                        >
                          {v.rsid}
                        </span>
                      ))}
                      {result.pharmacogenomic_profile.detected_variants.length === 0 && (
                        <span className="text-[11px] text-slate-500">
                          No rsIDs reported for primary gene.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <VisualizationPanel result={result} />
              </div>

              <div className="space-y-4 lg:space-y-5">
                <ExplanationPanel result={result} />
                <JsonPanel result={result} />
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-6 border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-300">PharmaGuard</span>
            <span>• Pharmacogenomic Risk Prediction System</span>
            <span>• Hackathon Project</span>
            <span>• Team: Precision Medicine AI</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#"
              className="text-softBlue hover:text-softBlue/80 underline-offset-2 hover:underline"
            >
              GitHub (coming soon)
            </a>
            <span>•</span>
            <a
              href="#"
              className="text-softBlue hover:text-softBlue/80 underline-offset-2 hover:underline"
            >
              Demo video (coming soon)
            </a>
          </div>
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div
            className={`rounded-full px-4 py-2 text-xs sm:text-sm shadow-card flex items-center gap-2 border ${
              toast.type === "success"
                ? "bg-riskSafe/10 border-riskSafe/70 text-riskSafe"
                : "bg-riskDanger/10 border-riskDanger/70 text-riskDanger"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
};

