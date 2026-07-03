import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { AppState, AppAction, Toast } from "../types";
import { ANALYSIS_STEP_DEFS, INITIAL_ANALYSIS_STEPS } from "../types";

// ─── Default job description (pre-populated on load) ─────────────────────────

const DEFAULT_JD = `Senior AI Engineer — Resume Embedding Pipeline

Module Responsibilities

| Module | Responsibility |
|---|---|
| config.py | Immutable PipelineSettings dataclass. Loads YAML, applies CLI overrides, auto-detects GPU via torch/onnxruntime. |
| io.py | All I/O: Pydantic schemas (CandidateProfile, ProfileInfo, etc.), JSONL/JSON streaming loader, .npy writer/loader, metadata.json writer, CheckpointManager. |
| input.py | Format dispatcher (dispatch, detect_input_type), JSON, JSONL, PDF, Image, Markdown, Text readers, normalize_resume_text(). |
| model.py | candidate_to_text(), generate_embeddings(), FastEmbed inference, l2_normalize(), validate_embeddings(). |
| pipeline.py | run_pipeline() orchestrating dispatch → text → embedding → normalization → checkpoint → metadata. |
| main.py | argparse CLI, logging setup, settings construction, and error handling. |

Required Skills: Python, FastAPI, PyTorch, ONNX Runtime, Vector Embeddings, Pydantic, Qdrant, Docker
Experience: 5+ years in ML Engineering or AI Infrastructure.`;

const DEFAULT_UPLOADED_FILES = [
  { name: "alice_johnson_resume.pdf", extension: ".pdf", sizeKb: 120 },
  { name: "bob_smith_resume.pdf", extension: ".pdf", sizeKb: 95 },
  { name: "carol_davis_resume.pdf", extension: ".pdf", sizeKb: 110 },
  { name: "david_brown_resume.pdf", extension: ".pdf", sizeKb: 105 },
  { name: "emma_wilson_resume.pdf", extension: ".pdf", sizeKb: 130 },
];

const INITIAL_STATE: AppState = {
  activePage: "dashboard",
  uploadedFiles: DEFAULT_UPLOADED_FILES,
  jobDescription: DEFAULT_JD,
  topCount: 3,
  searchQuery: "",
  sortBy: "score",
  filterLevel: "all",
  analysisStatus: "idle",
  analysisSteps: ANALYSIS_STEP_DEFS.map((s) => ({ ...s, status: "pending" as const })),
  analysisError: null,
  allCandidates: [],
  skillGapData: [],
  analyticsSnapshot: null,
  toasts: [],
  notifications: [],
  selectedCandidateId: null,
  templates: [],
  historyRecords: [],
  supportTickets: [],
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_ACTIVE_PAGE":
      return { ...state, activePage: action.payload };

    case "SET_JOB_DESCRIPTION":
      return { ...state, jobDescription: action.payload };

    case "SET_TOP_COUNT":
      return { ...state, topCount: action.payload };

    case "SET_UPLOADED_FILES":
      return { ...state, uploadedFiles: action.payload };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload };

    case "SET_FILTER_LEVEL":
      return { ...state, filterLevel: action.payload };

    case "SET_ANALYSIS_STATUS":
      return { ...state, analysisStatus: action.payload };

    case "RESET_ANALYSIS_STEPS":
      return { ...state, analysisSteps: INITIAL_ANALYSIS_STEPS };

    case "UPDATE_ANALYSIS_STEP":
      return {
        ...state,
        analysisSteps: state.analysisSteps.map((s) =>
          s.id === action.payload.id ? { ...s, status: action.payload.status } : s,
        ),
      };

    case "SET_CANDIDATES":
      return { ...state, allCandidates: action.payload };

    case "SET_SKILL_GAP_DATA":
      return { ...state, skillGapData: action.payload };

    case "SET_ANALYTICS_SNAPSHOT":
      return { ...state, analyticsSnapshot: action.payload };

    case "SET_ANALYSIS_ERROR":
      return { ...state, analysisError: action.payload };

    case "ADD_TOAST": {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newToast: Toast = { id, ...action.payload };
      return { ...state, toasts: [...state.toasts, newToast] };
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case "SELECT_CANDIDATE":
      return { ...state, selectedCandidateId: action.payload };

    case "SET_TEMPLATES":
      return { ...state, templates: action.payload };

    case "ADD_TEMPLATE":
      return { ...state, templates: [action.payload, ...state.templates] };

    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };

    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.payload),
      };

    case "SET_HISTORY":
      return { ...state, historyRecords: action.payload };

    case "ADD_HISTORY":
      return { ...state, historyRecords: [action.payload, ...state.historyRecords] };

    case "DELETE_HISTORY":
      return {
        ...state,
        historyRecords: state.historyRecords.filter((h) => h.id !== action.payload),
      };

    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n,
        ),
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "CLEAR_ALL_NOTIFICATIONS":
      return { ...state, notifications: [] };

    case "ADD_SUPPORT_TICKET": {
      const ticket = {
        id: `ticket-${Date.now()}`,
        ...action.payload,
        submittedAt: new Date().toISOString(),
        status: "open" as const,
      };
      return { ...state, supportTickets: [ticket, ...state.supportTickets] };
    }

    case "RESET_DEMO":
      return {
        ...INITIAL_STATE,
        templates: state.templates,
        historyRecords: state.historyRecords,
        uploadedFiles: DEFAULT_UPLOADED_FILES,
        jobDescription: DEFAULT_JD,
        analysisStatus: "idle",
        analysisSteps: INITIAL_ANALYSIS_STEPS,
        analysisError: null,
        allCandidates: [],
        skillGapData: [],
        analyticsSnapshot: null,
        selectedCandidateId: null,
        toasts: [],
        notifications: [],
        supportTickets: [],
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within <AppStateProvider>");
  }
  return ctx;
}

// ─── Convenience dispatch helpers (used by custom hooks) ─────────────────────

export function useDispatch(): React.Dispatch<AppAction> {
  return useAppState().dispatch;
}

export { DEFAULT_JD };
