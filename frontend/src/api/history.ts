import { apiClient } from "./api";
import type { BackendHistory } from "../types/api";

export const historyApi = {
  async getHistory(): Promise<BackendHistory[]> {
    const response = await apiClient.get<BackendHistory[]>("/api/history");
    return response.data;
  },

  async deleteHistoryRecord(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/api/resume-batches/${id}`);
      return response.data;
    } catch (err) {
      const response = await apiClient.delete<{ message: string }>(`/api/history/${id}`);
      return response.data;
    }
  },
};
