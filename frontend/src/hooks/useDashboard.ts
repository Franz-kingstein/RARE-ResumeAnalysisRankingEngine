import { useCallback } from "react";
import { useAppState } from "../context/AppStateContext";
import type { UploadedFile, Page, Toast } from "../types";

/**
 * useDashboard — exposes dashboard input state and simple actions.
 * Business logic (analysis simulation) lives in useAnalysis.
 */
export function useDashboard() {
  const { state, dispatch } = useAppState();

  const setJobDescription = useCallback(
    (jd: string) => dispatch({ type: "SET_JOB_DESCRIPTION", payload: jd }),
    [dispatch],
  );

  const setTopCount = useCallback(
    (n: number) => dispatch({ type: "SET_TOP_COUNT", payload: n }),
    [dispatch],
  );

  const setUploadedFiles = useCallback(
    (files: UploadedFile[]) =>
      dispatch({ type: "SET_UPLOADED_FILES", payload: files }),
    [dispatch],
  );

  const navigateTo = useCallback(
    (page: Page) => dispatch({ type: "SET_ACTIVE_PAGE", payload: page }),
    [dispatch],
  );

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) =>
      dispatch({ type: "ADD_TOAST", payload: toast }),
    [dispatch],
  );

  return {
    // State
    activePage:       state.activePage,
    uploadedFiles:    state.uploadedFiles,
    jobDescription:   state.jobDescription,
    topCount:         state.topCount,
    analysisStatus:   state.analysisStatus,
    analysisSteps:    state.analysisSteps,
    skillGapData:     state.skillGapData,
    // Actions
    setJobDescription,
    setTopCount,
    setUploadedFiles,
    navigateTo,
    addToast,
  };
}
