import React, { useState } from "react";
import { AnalysisResponse } from "../types";
import {
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";

interface JsonPanelProps {
  result: AnalysisResponse;
}

export const JsonPanel: React.FC<JsonPanelProps> = ({ result }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(result, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // best-effort only
    }
  };

  const handleDownload = () => {
    const ts = new Date(result.timestamp).toISOString().replace(/[:.]/g, "-");
    const filename = `pharmaguard_result_${ts}.json`;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-3"
      >
        <div>
          <p className="text-sm sm:text-base font-semibold text-slate-50">
            JSON Output
          </p>
          <p className="text-[11px] text-slate-400">
            View, copy, or download the structured analysis output.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleCopy();
            }}
            className="badge bg-slate-900 border-slate-700 text-[11px] text-slate-200"
          >
            {copied ? (
              <>
                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 mr-1" />
                Copied
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-3.5 w-3.5 mr-1" />
                Copy JSON
              </>
            )}
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleDownload();
            }}
            className="badge bg-softBlue/10 border-softBlue/40 text-[11px] text-softBlue"
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5 mr-1" />
            Download
          </button>
        </div>
      </button>

      {open && (
        <div className="mt-2 max-h-72 overflow-auto rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs scrollbar-thin">
          <pre className="text-[11px] sm:text-xs text-slate-100 whitespace-pre">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
};

