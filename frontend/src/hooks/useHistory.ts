import { useCallback, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { historyService } from "../services/historyService";

export function useHistory() {
  const { state, dispatch } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getHistory();
      dispatch({ type: "SET_HISTORY", payload: data });
    } catch (err: any) {
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteHistory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await historyService.deleteHistoryRecord(id);
      dispatch({ type: "DELETE_HISTORY", payload: id });
    } catch (err: any) {
      setError(err.message || "Failed to delete history record.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    historyRecords: state.historyRecords,
    loading,
    error,
    refresh: fetchHistory,
    deleteHistory,
  };
}
