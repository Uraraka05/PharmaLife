import React from "react";
import { 
  ExclamationTriangleIcon, 
  ArrowDownTrayIcon, 
  BeakerIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import { AnalysisResponse } from "../types";

export const ResultsDashboard: React.FC<{ result: AnalysisResponse }> = ({ result }) => {
  const { risk_assessment, pharmacogenomic_profile, clinical_recommendation } = result;

  // Dynamic colors based on risk
  const severityColors = {
    Safe: "border-safe text-safe bg-safe/10",
    "Adjust Dosage": "border-adjust text-adjust bg-adjust/10",
    Toxic: "border-toxic text-toxic bg-toxic/10",
    Ineffective: "border-toxic text-toxic bg-toxic/10",
    Unknown: "border-slate-500 text-slate-500 bg-slate-500/10",
  };

  const statusColor = severityColors[risk_assessment.risk_label] || severityColors.Unknown;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Risk Assessment Hero Card */}
      <div className={`relative overflow-hidden rounded-2xl border-l-[12px] bg-white dark:bg-slate-900 p-8 shadow-sm border-toxic`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-toxic">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-widest">High Risk Alert</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight dark:text-white">
              {risk_assessment.risk_label === "Safe" ? "Therapy Optimized" : "Toxicity Likely / Poor Response"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Pharmacogenomic markers indicate this patient is a <strong>{pharmacogenomic_profile.phenotype}</strong>. 
              {result.llm_generated_explanation.summary}
            </p>
          </div>
          
          <div className={`flex flex-col items-center gap-2 p-6 rounded-xl border ${statusColor}`}>
            <span className="text-xs font-bold uppercase">Primary Action</span>
            <p className="text-2xl font-black whitespace-nowrap">
              {risk_assessment.risk_label === "Safe" ? "Continue Dose" : "Switch Agent"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Genomic Profile Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold flex items-center gap-2 dark:text-white">
            <BeakerIcon className="h-5 w-5 text-primary" /> Genomic Profile
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Gene</th>
                  <th className="px-6 py-4 font-bold">Phenotype</th>
                  <th className="px-6 py-4 font-bold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-300">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{pharmacogenomic_profile.primary_gene}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColor}`}>
                      {pharmacogenomic_profile.phenotype}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{(risk_assessment.confidence_score * 100).toFixed(0)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Clinical Guidance Box */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold flex items-center gap-2 dark:text-white">
            <ShieldCheckIcon className="h-5 w-5 text-primary" /> Clinical Guidance
          </h3>
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommendation</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm leading-relaxed border border-slate-200 dark:border-slate-700 dark:text-slate-200 italic">
                "{clinical_recommendation.recommendation}"
              </div>
            </div>
            <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" /> Export for EHR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};