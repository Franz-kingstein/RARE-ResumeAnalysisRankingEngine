import { useCallback } from "react";
import { useAppState } from "../context/AppStateContext";
import { dashboardService } from "../services/dashboardService";
import { sleep } from "../utils/formatters";

const STEP_DELAYS: Record<string, number> = {
  reading:    150,
  parsing:    150,
  extracting: 150,
  embedding:  150,
  normalizing:150,
  matching:   150,
  ranking:    150,
  analytics:  150,
  completed:  150,
};

export function useAnalysis() {
  const { state, dispatch } = useAppState();

  const startAnalysis = useCallback(async () => {
    // ── Validation ────────────────────────────────────────────────────────────
    if (state.uploadedFiles.length === 0) {
      dispatch({
        type: "ADD_TOAST",
        payload: {
          type: "error",
          title: "No files uploaded",
          message: "Please upload a resume folder or connect Google Drive first.",
        },
      });
      return;
    }

    if (!state.jobDescription.trim() || state.jobDescription.trim().length < 10) {
      dispatch({
        type: "ADD_TOAST",
        payload: {
          type: "error",
          title: "Job description required",
          message: "Please describe the role before running analysis.",
        },
      });
      return;
    }

    // ── Reset and start ───────────────────────────────────────────────────────
    dispatch({ type: "RESET_ANALYSIS_STEPS" });
    dispatch({ type: "SET_ANALYSIS_STATUS", payload: "analysing" });
    dispatch({
      type: "ADD_TOAST",
      payload: { type: "info", title: "Analysis started", message: "AI is processing your resumes…" },
    });

    // Start API request in parallel
    const analysisPromise = dashboardService.runAnalysis({
      files: state.uploadedFiles,
      jobDescription: state.jobDescription,
    });

    // Run pipeline animation steps progressively (stages 1 to 6)
    const stepIds = Object.keys(STEP_DELAYS);
    for (let i = 0; i < stepIds.length - 3; i++) {
      const id = stepIds[i];
      dispatch({ type: "UPDATE_ANALYSIS_STEP", payload: { id, status: "active" } });
      await sleep(STEP_DELAYS[id]);
      dispatch({ type: "UPDATE_ANALYSIS_STEP", payload: { id, status: "done" } });
    }

    try {
      // Wait for backend API promise to resolve
      const result = await analysisPromise;

      // Animate remaining steps
      for (let i = stepIds.length - 3; i < stepIds.length; i++) {
        const id = stepIds[i];
        dispatch({ type: "UPDATE_ANALYSIS_STEP", payload: { id, status: "active" } });
        await sleep(STEP_DELAYS[id]);
        dispatch({ type: "UPDATE_ANALYSIS_STEP", payload: { id, status: "done" } });
      }

      dispatch({ type: "SET_CANDIDATES",        payload: result.candidates });
      dispatch({ type: "SET_SKILL_GAP_DATA",    payload: result.skillGapData });
      dispatch({ type: "SET_ANALYTICS_SNAPSHOT", payload: result.analyticsSnapshot });
      dispatch({ type: "SET_ANALYSIS_STATUS",   payload: "done" });
      dispatch({
        type: "ADD_TOAST",
        payload: {
          type: "success",
          title: "Analysis complete!",
          message: `${result.candidates.length} candidates ranked successfully.`,
        },
      });
    } catch (err: any) {
      dispatch({ type: "SET_ANALYSIS_ERROR", payload: err.message || "Analysis failed. Please retry." });
      dispatch({ type: "SET_ANALYSIS_STATUS", payload: "error" });
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "error", title: "Analysis failed", message: err.message || "An error occurred. Please try again." },
      });
    }
  }, [state.uploadedFiles, state.jobDescription, dispatch]);

  const retryAnalysis = useCallback(() => {
    startAnalysis();
  }, [startAnalysis]);

  return {
    analysisStatus: state.analysisStatus,
    analysisSteps:  state.analysisSteps,
    analysisError:  state.analysisError,
    isAnalysing:    state.analysisStatus === "analysing",
    isDone:         state.analysisStatus === "done",
    hasError:       state.analysisStatus === "error",
    startAnalysis,
    retryAnalysis,
  };
}
