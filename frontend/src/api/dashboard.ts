import { apiClient } from "./api";
import type { BackendDashboardResponse } from "../types/api";

export const dashboardApi = {
  async getDashboardData(query?: string, topK?: number): Promise<BackendDashboardResponse> {
    try {
      const response = await apiClient.post<BackendDashboardResponse>("/api/dashboard", {
        query: query || "",
        top_k: topK || 20,
      });
      return response.data;
    } catch (err) {
      // Fallback to GET on failure or method not allowed
      const response = await apiClient.get<BackendDashboardResponse>("/api/dashboard", {
        params: {
          query: query || "",
          top_k: topK || 20,
        },
      });
      return response.data;
    }
  },
};
