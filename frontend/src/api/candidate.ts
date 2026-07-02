import { apiClient } from "./api";
import type { BackendCandidate } from "../types/api";

export const candidateApi = {
  async listCandidates(): Promise<{ candidates: BackendCandidate[] }> {
    const response = await apiClient.get<{ candidates: BackendCandidate[] }>("/api/candidates");
    return response.data;
  },

  async getCandidateById(id: string | number): Promise<BackendCandidate> {
    const response = await apiClient.get<BackendCandidate>(`/api/candidates/${id}`);
    return response.data;
  },

  async updateCandidateStatus(id: string | number, status: string): Promise<{ candidate_id: number; status: string; updated: boolean }> {
    const response = await apiClient.patch<{ candidate_id: number; status: string; updated: boolean }>(`/api/candidates/${id}`, {
      status,
    });
    return response.data;
  },

  async exportCandidatesCsv(ids?: (string | number)[]): Promise<Blob> {
    const response = await apiClient.post("/api/candidates/export/csv", { ids }, {
      responseType: "blob",
    });
    return response.data;
  },
};
