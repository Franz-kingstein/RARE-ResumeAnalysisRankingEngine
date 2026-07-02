import { apiClient } from "./api";
import type { BackendSettings } from "../types/api";

export const settingsApi = {
  async getSettings(): Promise<BackendSettings> {
    const response = await apiClient.get<BackendSettings>("/api/settings");
    return response.data;
  },

  async updateSettings(settings: Partial<BackendSettings>): Promise<{ message: string } & BackendSettings> {
    const response = await apiClient.put<{ message: string } & BackendSettings>("/api/settings", settings);
    return response.data;
  },
};
