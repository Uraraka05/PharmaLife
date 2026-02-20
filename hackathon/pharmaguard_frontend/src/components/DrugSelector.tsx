import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_DRUGS } from "../types";

interface DrugSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const DrugSelector: React.FC<DrugSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-50">
            Medication Selection
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Select or type one or more medications to analyze pharmacogenomic risk.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <InformationCircleIcon className="h-4 w-4" />
          <span>CPIC-guided genes</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-slate-300">
          Medications{" "}
          <span className="text-slate-500">
            (comma-separated or multi-select from list)
          </span>
        </label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. clopidogrel, warfarin"
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-softBlue focus:border-softBlue/80"
        />

        <div className="flex flex-wrap gap-1.5 mt-1">
          {SUPPORTED_DRUGS.map(drug => {
            const isSelected =
              value
                .split(",")
                .map(v => v.trim().toUpperCase())
                .filter(Boolean)
                .includes(drug);

            return (
              <button
                key={drug}
                type="button"
                onClick={() => {
                  const current = value
                    .split(",")
                    .map(v => v.trim())
                    .filter(Boolean);
                  if (current.map(d => d.toUpperCase()).includes(drug)) {
                    const filtered = current.filter(d => d.toUpperCase() !== drug);
                    onChange(filtered.join(", "));
                  } else {
                    onChange(current.concat(drug).join(", "));
                  }
                }}
                className={`badge border text-xs ${
                  isSelected
                    ? "bg-teal/20 border-teal/70 text-teal"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {drug}
              </button>
            );
          })}
        </div>

        <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
          <InformationCircleIcon className="h-3 w-3" />
          <span>
            Tooltip: Select medication to analyze pharmacogenomic risk. Supported:
            CODEINE, CLOPIDOGREL, WARFARIN, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL.
          </span>
        </p>
      </div>
    </div>
  );
};

