import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { AnalysisResponse } from "../types";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

const baseURL = import.meta.env.VITE_API_BASE_URL?.toString() || "/api";

const api = axios.create({
  baseURL,
  timeout: 30000, // Increased to 30s for large VCF processing
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Enhanced analysis function with automatic retry logic for reliability.
 */
export async function analyzePharmaGuard(
  file: File,
  drug: string,
  retryCount = 0
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("drug", drug.toUpperCase()); // Normalize drug name

  try {
    const response = await api.post<AnalysisResponse>("/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<any>;

    // Handle Auto-Retry for 5xx errors or Network timeouts
    const isRetryable = !err.response || (err.response.status >= 500 && err.response.status <= 504);
    
    if (isRetryable && retryCount < MAX_RETRIES) {
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS * (retryCount + 1)));
      return analyzePharmaGuard(file, drug, retryCount + 1);
    }

    // Comprehensive Error Parsing
    let errorMessage = "An unexpected error occurred.";

    if (err.response) {
      // Backend responded with an error
      const detail = err.response.data?.detail;
      errorMessage = typeof detail === "string" 
        ? detail 
        : detail?.error || `Server Error (${err.response.status})`;
        
      if (err.response.status === 413) errorMessage = "VCF file is too large for the server.";
      if (err.response.status === 400) errorMessage = "Invalid VCF format or unsupported drug.";
    } else if (err.request) {
      // Request was made but no response received
      errorMessage = "Clinical Service unreachable. Please check your internet or backend status.";
    }

    throw new Error(errorMessage);
  }
}