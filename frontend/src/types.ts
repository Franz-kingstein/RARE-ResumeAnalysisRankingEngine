// ─── Existing domain types (preserved) ───────────────────────────────────────

export type MatchLevel = "strong" | "partial" | "weak";

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  score: number; // 0 – 1
  matchLevel: MatchLevel;
  skills: string[];
  insight: string;
  /** Optional enrichment fields */
  experience?: string;
  location?: string;
  source?: string;
}

export interface SkillGapPoint {
  skill: string;
  required: number; // 0 – 100
  candidate: number; // 0 – 100
}

// ─── Analytics types (preserved) ─────────────────────────────────────────────

export interface SkillDistributionPoint {
  skill: string;
  count: number;
}

export interface ScoreDistributionSlice {
  band: string; // e.g. "90-100%"
  value: number;
  color: string;
}

export interface ExperienceLevelPoint {
  bracket: string; // e.g. "0-2 yrs"
  count: number;
}

export interface HiringTrendPoint {
  month: string;
  candidates: number;
  shortlisted: number;
}

export interface CandidateSourceSlice {
  source: string;
  value: number;
  color: string;
}

export interface FunnelStage {
  label: string;
  value: number;
  percent: number; // 0 – 100, relative to first stage
  color: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  positive: boolean;
}

// ─── New aggregated analytics snapshot ────────────────────────────────────────

export interface AnalyticsSnapshot {
  skillDistribution: SkillDistributionPoint[];
  skillBarColors: string[];
  scoreDistribution: ScoreDistributionSlice[];
  experienceLevels: ExperienceLevelPoint[];
  hiringTrend: HiringTrendPoint[];
  candidateSources: CandidateSourceSlice[];
  hiringFunnel: FunnelStage[];
  keyMetrics: KeyMetric[];
  totalScanned: number;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadedFile {
  name: string;
  extension: string;
  sizeKb: number;
  file?: File;
}

// ─── Analysis pipeline ────────────────────────────────────────────────────────

export type AnalysisStatus = "idle" | "uploading" | "analysing" | "done" | "error";

export interface AnalysisStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

export const ANALYSIS_STEP_DEFS: Omit<AnalysisStep, "status">[] = [
  { id: "reading",    label: "Reading Files"          },
  { id: "parsing",    label: "Parsing Resumes"         },
  { id: "extracting", label: "Extracting Text"          },
  { id: "embedding",  label: "Generating Embeddings"   },
  { id: "normalizing",label: "Normalizing Vectors"      },
  { id: "matching",   label: "Candidate Matching"       },
  { id: "ranking",    label: "Ranking Candidates"       },
  { id: "analytics",  label: "Generating Analytics"     },
  { id: "completed",  label: "Completed"               },
];

export const INITIAL_ANALYSIS_STEPS: AnalysisStep[] = ANALYSIS_STEP_DEFS.map((s) => ({
  ...s,
  status: "pending",
}));

// ─── UI state ─────────────────────────────────────────────────────────────────

export type SortKey = "score" | "name" | "role";
export type FilterLevel = MatchLevel | "all";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type Page = "dashboard" | "candidates" | "analytics" | "templates" | "history";

// ─── Analysis service I/O ─────────────────────────────────────────────────────

export interface AnalysisInput {
  files: UploadedFile[];
  jobDescription: string;
}

export interface AnalysisResult {
  candidates: Candidate[];
  skillGapData: SkillGapPoint[];
  analyticsSnapshot: AnalyticsSnapshot;
}

// ─── Templates & History ────────────────────────────────────────────────────────

export interface JobTemplate {
  id: string;
  title: string;
  department: string;
  experience: string;
  description: string;
  requiredSkills: string[];
  lastUsedAt?: string;
  isCustom: boolean;
}

export interface HistoryRecord {
  id: string;
  date: string;
  jobDescription: string;
  templateId?: string;
  candidatesScanned: number;
  candidatesShortlisted: number;
  topCandidates: Candidate[];
  analyticsSnapshot: AnalyticsSnapshot;
  skillGapData: SkillGapPoint[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "success" | "warning" | "alert";
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  submittedAt: string;
  status: "open" | "resolved";
}

// ─── Global App State ─────────────────────────────────────────────────────────

export interface AppState {
  // Navigation
  activePage: Page;

  // Input controls
  uploadedFiles: UploadedFile[];
  jobDescription: string;
  topCount: number;

  // Candidate filtering / sorting
  searchQuery: string;
  sortBy: SortKey;
  filterLevel: FilterLevel;

  // Analysis pipeline
  analysisStatus: AnalysisStatus;
  analysisSteps: AnalysisStep[];
  analysisError: string | null;

  // Results
  allCandidates: Candidate[];
  skillGapData: SkillGapPoint[];
  analyticsSnapshot: AnalyticsSnapshot | null;

  // UI
  toasts: Toast[];
  notifications: AppNotification[];
  selectedCandidateId: string | null;

  // New Domains
  templates: JobTemplate[];
  historyRecords: HistoryRecord[];
  supportTickets: SupportTicket[];
}

// ─── Reducer actions ──────────────────────────────────────────────────────────

export type AppAction =
  | { type: "SET_ACTIVE_PAGE";       payload: Page }
  | { type: "SET_JOB_DESCRIPTION";   payload: string }
  | { type: "SET_TOP_COUNT";         payload: number }
  | { type: "SET_UPLOADED_FILES";    payload: UploadedFile[] }
  | { type: "SET_SEARCH_QUERY";      payload: string }
  | { type: "SET_SORT_BY";           payload: SortKey }
  | { type: "SET_FILTER_LEVEL";      payload: FilterLevel }
  | { type: "SET_ANALYSIS_STATUS";   payload: AnalysisStatus }
  | { type: "UPDATE_ANALYSIS_STEP";  payload: { id: string; status: AnalysisStep["status"] } }
  | { type: "RESET_ANALYSIS_STEPS" }
  | { type: "SET_CANDIDATES";        payload: Candidate[] }
  | { type: "SET_SKILL_GAP_DATA";    payload: SkillGapPoint[] }
  | { type: "SET_ANALYTICS_SNAPSHOT"; payload: AnalyticsSnapshot }
  | { type: "SET_ANALYSIS_ERROR";    payload: string }
  | { type: "ADD_TOAST";             payload: Omit<Toast, "id"> }
  | { type: "REMOVE_TOAST";          payload: string }
  | { type: "SELECT_CANDIDATE";      payload: string | null }
  | { type: "SET_TEMPLATES";         payload: JobTemplate[] }
  | { type: "ADD_TEMPLATE";          payload: JobTemplate }
  | { type: "UPDATE_TEMPLATE";       payload: JobTemplate }
  | { type: "DELETE_TEMPLATE";       payload: string }
  | { type: "SET_HISTORY";           payload: HistoryRecord[] }
  | { type: "ADD_HISTORY";           payload: HistoryRecord }
  | { type: "DELETE_HISTORY";        payload: string }
  | { type: "SET_NOTIFICATIONS";     payload: AppNotification[] }
  | { type: "MARK_NOTIFICATION_READ";payload: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "CLEAR_ALL_NOTIFICATIONS" }
  | { type: "ADD_SUPPORT_TICKET";    payload: Omit<SupportTicket, "id" | "submittedAt" | "status"> }
  | { type: "RESET_DEMO" };
