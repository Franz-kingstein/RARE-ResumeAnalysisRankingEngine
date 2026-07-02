import type {
  SkillDistributionPoint,
  ScoreDistributionSlice,
  ExperienceLevelPoint,
  HiringTrendPoint,
  CandidateSourceSlice,
  FunnelStage,
  KeyMetric,
} from "./types";

export const skillDistribution: SkillDistributionPoint[] = [
  { skill: "Go", count: 38 },
  { skill: "Kubernetes", count: 58 },
  { skill: "Docker", count: 74 },
  { skill: "Python", count: 46 },
  { skill: "AWS", count: 34 },
  { skill: "React", count: 26 },
  { skill: "TypeScript", count: 28 },
  { skill: "Terraform", count: 21 },
];

// 8-stop gradient sampled across both supplied palettes
export const skillBarColors = [
  "#1D1A39",
  "#451952",
  "#532057",
  "#662549",
  "#9B4C7D",
  "#AE445A",
  "#C26A9A",
  "#F39F5A",
];

export const scoreDistribution: ScoreDistributionSlice[] = [
  { band: "70-89%", value: 41, color: "#532057" },
  { band: "50-69%", value: 30, color: "#F39F5A" },
  { band: "90-100%", value: 12, color: "#9B4C7D" },
  { band: "30-49%", value: 12, color: "#D998B8" },
  { band: "0-29%", value: 5, color: "#AE445A" },
];

export const experienceLevels: ExperienceLevelPoint[] = [
  { bracket: "0-2 yrs", count: 20 },
  { bracket: "3-5 yrs", count: 47 },
  { bracket: "6-8 yrs", count: 34 },
  { bracket: "9-12 yrs", count: 29 },
  { bracket: "13+ yrs", count: 13 },
];

export const hiringTrend: HiringTrendPoint[] = [
  { month: "Jan", candidates: 46, shortlisted: 5 },
  { month: "Feb", candidates: 62, shortlisted: 6 },
  { month: "Mar", candidates: 40, shortlisted: 4 },
  { month: "Apr", candidates: 92, shortlisted: 7 },
  { month: "May", candidates: 118, shortlisted: 8 },
  { month: "Jun", candidates: 152, shortlisted: 8 },
];

export const candidateSources: CandidateSourceSlice[] = [
  { source: "Campus", value: 32, color: "#532057" },
  { source: "LinkedIn", value: 12, color: "#F39F5A" },
  { source: "Indeed", value: 18, color: "#9B4C7D" },
  { source: "Naukri", value: 22, color: "#AE445A" },
  { source: "Portal", value: 9, color: "#451952" },
  { source: "Referral", value: 7, color: "#662549" },
];

export const hiringFunnel: FunnelStage[] = [
  { label: "Total Resumes", value: 152, percent: 100, color: "#532057" },
  { label: "AI Screened", value: 120, percent: 79, color: "#7C3C64" },
  { label: "Score > 50%", value: 78, percent: 51, color: "#9B4C7D" },
  { label: "Score > 70%", value: 32, percent: 21, color: "#C26A9A" },
  { label: "Shortlisted", value: 8, percent: 5, color: "#AE445A" },
];

export const keyMetrics: KeyMetric[] = [
  { label: "Offer Acceptance Rate", value: "78%", delta: "+5%", trend: "up", positive: true },
  { label: "Time to Hire (avg)", value: "18 days", delta: "-3d", trend: "down", positive: true },
  { label: "Cost per Hire", value: "$3,200", delta: "-12%", trend: "down", positive: true },
  { label: "Candidate Quality Score", value: "74%", delta: "+8%", trend: "up", positive: true },
  { label: "Sourcing Efficiency", value: "4.2x", delta: "+0.6x", trend: "up", positive: true },
  { label: "Pipeline Velocity", value: "11 days", delta: "-2d", trend: "down", positive: true },
];
