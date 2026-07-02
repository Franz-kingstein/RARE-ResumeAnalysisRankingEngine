import { settingsApi } from "../api/settings";
import type { BackendSettings } from "../types/api";

export const settingsService = {
  async getSettings(): Promise<BackendSettings> {
    return settingsApi.getSettings();
  },

  async updateSettings(settings: Partial<BackendSettings>): Promise<BackendSettings> {
    const res = await settingsApi.updateSettings(settings);
    return res;
  },
};
