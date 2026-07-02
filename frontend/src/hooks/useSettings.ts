import { useCallback, useState } from "react";
import { settingsService } from "../services/settingsService";
import type { BackendSettings } from "../types/api";

export function useSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<BackendSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<BackendSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.updateSettings(updates);
      setSettings(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to update settings.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings,
    updateSettings,
  };
}
