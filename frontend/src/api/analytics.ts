import { apiClient } from "./api";
import type { BackendAnalyticsResponse } from "../types/api";

export const analyticsApi = {
  async getAnalytics(): Promise<BackendAnalyticsResponse> {
    const response = await apiClient.get<BackendAnalyticsResponse>("/api/analytics");
    return response.data;
  },
};
