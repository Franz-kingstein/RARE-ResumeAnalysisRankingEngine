import { useMemo, useCallback, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { candidateService } from "../services/candidateService";
import type { SortKey, FilterLevel } from "../types";

export function useCandidates() {
  const { state, dispatch } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCandidates = useMemo(
    () =>
      candidateService.filterAndSort(state.allCandidates, {
        searchQuery:  state.searchQuery,
        filterLevel:  state.filterLevel,
        sortBy:       state.sortBy,
      }),
    [state.allCandidates, state.searchQuery, state.filterLevel, state.sortBy],
  );

  const topCandidates = useMemo(
    () => filteredCandidates.slice(0, state.topCount),
    [filteredCandidates, state.topCount],
  );

  const setSearchQuery = useCallback(
    (q: string) => dispatch({ type: "SET_SEARCH_QUERY", payload: q }),
    [dispatch],
  );

  const setFilterLevel = useCallback(
    (f: FilterLevel) => dispatch({ type: "SET_FILTER_LEVEL", payload: f }),
    [dispatch],
  );

  const setSortBy = useCallback(
    (s: SortKey) => dispatch({ type: "SET_SORT_BY", payload: s }),
    [dispatch],
  );

  const selectCandidate = useCallback(
    (id: string | null) => dispatch({ type: "SELECT_CANDIDATE", payload: id }),
    [dispatch],
  );

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await candidateService.getCandidates();
      dispatch({ type: "SET_CANDIDATES", payload: list });
    } catch (err: any) {
      setError(err.message || "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateCandidateStatus = useCallback(async (id: string | number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      await candidateService.updateCandidateStatus(id, status);
      // Refresh list after change
      await fetchCandidates();
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCandidates]);

  const exportCandidatesCsv = useCallback(async (ids?: (string | number)[]) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await candidateService.exportCandidatesCsv(ids);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidates_export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to export CSV.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    allCandidates:       state.allCandidates,
    filteredCandidates,
    topCandidates,
    totalScanned:        state.analyticsSnapshot?.totalScanned ?? 0,
    topCount:            state.topCount,
    searchQuery:         state.searchQuery,
    filterLevel:         state.filterLevel,
    sortBy:              state.sortBy,
    selectedCandidateId: state.selectedCandidateId,
    loading,
    error,
    setSearchQuery,
    setFilterLevel,
    setSortBy,
    selectCandidate,
    refresh:             fetchCandidates,
    updateCandidateStatus,
    exportCandidatesCsv,
  };
}
