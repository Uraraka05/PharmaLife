import React, { useCallback, useState } from "react";
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const validateFile = (candidate: File) => {
    if (!candidate.name.toLowerCase().endsWith(".vcf")) {
      setError("Invalid file type. Please upload a .vcf file.");
      setValidated(false);
      onFileChange(null);
      return;
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      setError("File is too large. Maximum size is 5MB.");
      setValidated(false);
      onFileChange(null);
      return;
    }
    setError(null);
    setValidated(true);
    onFileChange(candidate);
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      validateFile(files[0]);
    },
    [] // validateFile closes over stable setters
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="card card-hover p-5 sm:p-6 lg:p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-50">
            Upload Patient Genetic VCF File
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Drag and drop a VCF v4.2 file or click to browse. Max size 5MB.
          </p>
        </div>
        <span className="badge bg-softBlue/10 text-softBlue border border-softBlue/40">
          VCF
        </span>
      </div>

      <div
        className={`mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition
          ${
            dragActive
              ? "border-teal bg-teal/5"
              : error
              ? "border-riskDanger/70 bg-riskDanger/5"
              : "border-slate-700 bg-slate-900/60 hover:border-teal/70 hover:bg-slate-900"
          }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <CloudArrowUpIcon className="h-10 w-10 text-softBlue mb-3" />
        <p className="text-sm sm:text-base font-medium text-slate-100">
          Drag &amp; drop VCF file here
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          or{" "}
          <label className="font-semibold text-teal hover:text-teal/80 cursor-pointer">
            browse from device
            <input
              type="file"
              accept=".vcf"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        </p>

        <div className="mt-4 flex flex-col items-center gap-1">
          {file && !error && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
              <CheckCircleIcon className="h-4 w-4 text-riskSafe" />
              <span className="truncate max-w-[220px] sm:max-w-xs">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-riskDanger">
              <ExclamationCircleIcon className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {!error && validated && (
            <span className="mt-1 text-xs text-riskSafe flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />
              File validated
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

