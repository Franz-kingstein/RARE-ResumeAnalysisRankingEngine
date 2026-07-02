export interface BackendCandidate {
  candidate_id?: number | string;
  id?: number | string;
  name: string;
  skills: string | string[];
  resume_text: string;
  experience?: string | number | null;
  score?: number;
  ai_match_score?: number;
}

export interface BackendSkillDistribution {
  skill: string;
  count: number;
}

export interface BackendScoreDistribution {
  range: string;
  label: string;
  count: number;
  percentage: number;
}

export interface BackendExperienceDistribution {
  range: string;
  label: string;
  count: number;
}

export interface BackendDashboardResponse {
  query: string;
  total_candidates: number;
  skill_distribution: BackendSkillDistribution[];
  score_distribution: BackendScoreDistribution[];
  experience_distribution: BackendExperienceDistribution[];
}

export interface BackendAnalyticsResponse {
  totalCandidates: number;
  shortlisted: number;
  averageScore: number;
  processingTime: string;
}

export interface BackendTemplate {
  id: string;
  name: string;
  createdAt: string;
  title?: string;
  description?: string;
  department?: string;
  experience?: string;
  requiredSkills?: string[];
  lastUsedAt?: string;
}

export interface BackendHistory {
  id: string;
  batchName: string;
  date: string;
  status: string;
  candidates: number;
}

export interface BackendSettings {
  name: string;
  role: string;
  email: string;
  organization: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    weekly: boolean;
  };
  theme: string;
}
