import React, { useState } from "react";
import { ChevronDownIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { AnalysisResponse } from "../types";

interface ExplanationPanelProps {
  result: AnalysisResponse;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ result }) => {
  const [open, setOpen] = useState(true);

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children
  }) => (
    <div className="border border-slate-800 rounded-xl p-3 sm:p-4 bg-slate-950/50">
      <p className="text-xs font-semibold text-slate-200 mb-1.5">{title}</p>
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{children}</p>
    </div>
  );

  const explanation = result.llm_generated_explanation;

  return (
    <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-softBlue/10 border border-softBlue/40">
            <SparklesIcon className="h-5 w-5 text-softBlue" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-slate-50">
              AI-Assisted Pharmacogenomic Explanation
            </p>
            <p className="text-[11px] text-slate-400">
              Synthesizes genotype, phenotype, and medication to support clinical
              decision-making.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-softBlue/10 text-softBlue border border-softBlue/40 text-[11px]">
            AI Generated Explanation
          </span>
          <ChevronDownIcon
            className={`h-5 w-5 text-slate-300 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="mt-2 space-y-3 sm:space-y-4 animate-fade-in">
          <Section title="Summary">{explanation.summary}</Section>
          <Section title="Biological Mechanism">{explanation.mechanism}</Section>
          <Section title="Clinical Guideline Reference">
            {explanation.clinical_guideline_reference} – This interface is aligned with
            CPIC-style guidance but is intended for educational and research use only.
            Clinicians should consult the latest CPIC guidelines and institutional
            protocols.
          </Section>
        </div>
      )}

      <p className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
        This tool is for educational and research purposes only and does not replace
        professional medical judgment. No genetic data is stored; analysis is
        session-based.
      </p>
    </div>
  );
};

