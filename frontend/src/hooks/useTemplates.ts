import { useCallback, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { templateService } from "../services/templateService";
import type { JobTemplate } from "../types";

export function useTemplates() {
  const { state, dispatch } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateService.getTemplates();
      dispatch({ type: "SET_TEMPLATES", payload: data });
    } catch (err: any) {
      setError(err.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createTemplate = useCallback(async (template: Omit<JobTemplate, "id" | "isCustom">) => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateService.createTemplate(template);
      dispatch({ type: "ADD_TEMPLATE", payload: data });
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to create template.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<JobTemplate>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateService.updateTemplate(id, updates);
      dispatch({ type: "UPDATE_TEMPLATE", payload: data });
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to update template.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await templateService.deleteTemplate(id);
      dispatch({ type: "DELETE_TEMPLATE", payload: id });
    } catch (err: any) {
      setError(err.message || "Failed to delete template.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    templates: state.templates,
    loading,
    error,
    refresh: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
