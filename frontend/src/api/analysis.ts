import { apiClient } from "./api";
import type { BackendCandidate } from "../types/api";

export interface AnalysisRunResult {
  candidates: BackendCandidate[];
  totalScanned: number;
  processingTime: string;
}

export const analysisApi = {
  async runAnalysis(jobDescription: string, topN: number): Promise<AnalysisRunResult> {
    const response = await apiClient.post<AnalysisRunResult>("/api/analysis/run", {
      jobDescription,
      topN,
    });
    return response.data;
  },

  async getActiveAnalysis(): Promise<any> {
    const response = await apiClient.get("/api/analysis/active");
    return response.data;
  },

  async ingestResumes(files: File[], onProgress?: (percent: number) => void): Promise<{ message: string; stored_candidate_ids: (number | string)[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post("/api/ingest", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },
};
