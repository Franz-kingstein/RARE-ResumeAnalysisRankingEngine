import { useCallback, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { analyticsService } from "../services/analyticsService";

export function useAnalytics() {
  const { state, dispatch } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getAnalytics(state.allCandidates);
      dispatch({ type: "SET_ANALYTICS_SNAPSHOT", payload: data });
    } catch (err: any) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [state.allCandidates, dispatch]);

  return {
    analyticsSnapshot: state.analyticsSnapshot,
    isLoading:         loading || state.analysisStatus === "analysing",
    error,
    hasData:           state.analyticsSnapshot !== null,
    refresh:           fetchAnalytics,
  };
}
