import type {
  Candidate,
  SkillGapPoint,
  AnalyticsSnapshot,
  SkillDistributionPoint,
  ScoreDistributionSlice,
  ExperienceLevelPoint,
  HiringTrendPoint,
  CandidateSourceSlice,
  FunnelStage,
  KeyMetric,
} from "../types";
import { MOCK_CANDIDATE_POOL, buildCandidate, type RawCandidate } from "./mockCandidates";

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
  };
}

// ─── Tech keyword dictionary ──────────────────────────────────────────────────

const TECH_KEYWORDS = [
  "go", "golang", "rust", "python", "java", "javascript", "typescript",
  "react", "vue", "angular", "node", "django", "fastapi", "spring",
  "kubernetes", "k8s", "docker", "terraform", "aws", "gcp", "azure",
  "microservices", "grpc", "kafka", "redis", "postgresql", "sql",
  "machine learning", "ml", "tensorflow", "pytorch", "spark",
  "prometheus", "grafana", "vault", "ci/cd", "devops", "sre",
  "system design", "distributed systems", "observability",
  "fastapi", "celery", "graphql", "rest", "firebase",
  "airflow", "snowflake", "scikit", "tableau",
];

function extractKeywords(jd: string): string[] {
  const lower = jd.toLowerCase();
  return TECH_KEYWORDS.filter((kw) => lower.includes(kw));
}

// ─── Insight pools ────────────────────────────────────────────────────────────

const STRONG_INSIGHTS = [
  "Strong match on all core technical requirements — exceptional candidate.",
  "All required skills present with demonstrable production depth.",
  "Exceptional alignment with backend architecture and distributed systems.",
  "Top candidate — high overlap with tech stack and seniority level.",
  "Outstanding skill coverage; likely exceeds role expectations.",
];

const PARTIAL_INSIGHTS = [
  "Partial match — solid foundation but gaps in a few key areas.",
  "Good potential; has orchestration exposure but limited primary language experience.",
  "Solid candidate with transferable skills; may need upskilling in 1-2 areas.",
  "Mid-tier alignment — strong in adjacent stack, weaker in required core.",
  "Worth considering for interview; background is close but not perfect fit.",
];

const WEAK_INSIGHTS = [
  "Limited overlap with role requirements — primarily a different domain.",
  "No significant match with required tech stack; profile is client-side focused.",
  "Skills are transferable at a high level but insufficient for this specialisation.",
  "Background diverges from role; strong individual but not the right fit.",
  "Minimal alignment with JD — recommend routing to a different role.",
];

function pickInsight(
  level: Candidate["matchLevel"],
  name: string,
  jd: string,
): string {
  const pool =
    level === "strong"
      ? STRONG_INSIGHTS
      : level === "partial"
        ? PARTIAL_INSIGHTS
        : WEAK_INSIGHTS;
  const rng = seededRng(hashString(name + jd.slice(0, 40) + level));
  return pool[Math.floor(rng() * pool.length)];
}

// ─── Candidate scoring ────────────────────────────────────────────────────────

function scoreRawCandidate(raw: RawCandidate, jd: string): number {
  const jdKeywords = extractKeywords(jd);
  const matched = raw.baseSkills.filter((skill) =>
    jdKeywords.some(
      (kw) =>
        skill.toLowerCase().includes(kw) ||
        kw.includes(skill.toLowerCase()),
    ),
  ).length;

  // Base: proportion of candidate skills matching JD keywords
  const base =
    jdKeywords.length === 0
      ? 0.55 // No keywords → neutral score
      : Math.min(0.85, (matched / Math.max(raw.baseSkills.length, 4)) * 1.4);

  // Deterministic noise ±0.12
  const rng = seededRng(hashString(raw.name + jd.slice(0, 60)));
  const noise = (rng() - 0.5) * 0.24;

  return Math.min(0.97, Math.max(0.05, base + noise));
}

function scoreToMatchLevel(score: number): Candidate["matchLevel"] {
  if (score >= 0.75) return "strong";
  if (score >= 0.50) return "partial";
  return "weak";
}

/**
 * Score all candidates deterministically against a job description.
 * Returns a sorted list (highest score first).
 */
export function scoreAllCandidates(jd: string): Candidate[] {
  return MOCK_CANDIDATE_POOL.map((raw) => {
    const score = scoreRawCandidate(raw, jd);
    const matchLevel = scoreToMatchLevel(score);
    const insight = pickInsight(matchLevel, raw.name, jd);
    return buildCandidate(raw, score, matchLevel, insight);
  }).sort((a, b) => b.score - a.score);
}

// ─── Skill gap analysis ───────────────────────────────────────────────────────

export function generateSkillGap(
  topCandidate: Candidate,
  jd: string,
): SkillGapPoint[] {
  const jdKeywords = extractKeywords(jd);
  const skillPool = [
    ...new Set([...topCandidate.skills, ...jdKeywords.slice(0, 4)]),
  ].slice(0, 6);

  return skillPool.map((skill) => {
    const reqRng = seededRng(hashString(skill + "req" + jd.slice(0, 30)));
    const candRng = seededRng(hashString(skill + "cand" + topCandidate.name));
    return {
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      required: Math.round(reqRng() * 30 + 65), // 65–95
      candidate: Math.round(candRng() * 35 + 55), // 55–90
    };
  });
}

// ─── Analytics snapshot generation ───────────────────────────────────────────

const SKILL_BAR_COLORS = [
  "#1D1A39", "#451952", "#532057", "#662549",
  "#9B4C7D", "#AE445A", "#C26A9A", "#F39F5A",
];

const SCORE_BAND_COLORS: Record<string, string> = {
  "90-100%": "#9B4C7D",
  "70-89%":  "#532057",
  "50-69%":  "#F39F5A",
  "30-49%":  "#D998B8",
  "0-29%":   "#AE445A",
};

const SCORE_BANDS = [
  { band: "90-100%", min: 0.90, max: 1.01 },
  { band: "70-89%",  min: 0.70, max: 0.90 },
  { band: "50-69%",  min: 0.50, max: 0.70 },
  { band: "30-49%",  min: 0.30, max: 0.50 },
  { band: "0-29%",   min: 0.00, max: 0.30 },
];

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: "#532057",
  Indeed:   "#9B4C7D",
  Naukri:   "#AE445A",
  Campus:   "#F39F5A",
  Portal:   "#451952",
  Referral: "#662549",
};

const MONTHLY_TREND: HiringTrendPoint[] = [
  { month: "Jan", candidates: 46,  shortlisted: 5 },
  { month: "Feb", candidates: 62,  shortlisted: 6 },
  { month: "Mar", candidates: 40,  shortlisted: 4 },
  { month: "Apr", candidates: 92,  shortlisted: 7 },
  { month: "May", candidates: 118, shortlisted: 8 },
  { month: "Jun", candidates: 152, shortlisted: 8 },
];

const KEY_METRICS: KeyMetric[] = [
  { label: "Offer Acceptance Rate",   value: "78%",      delta: "+5%",  trend: "up",   positive: true  },
  { label: "Time to Hire (avg)",      value: "18 days",  delta: "-3d",  trend: "down", positive: true  },
  { label: "Cost per Hire",           value: "$3,200",   delta: "-12%", trend: "down", positive: true  },
  { label: "Candidate Quality Score", value: "74%",      delta: "+8%",  trend: "up",   positive: true  },
  { label: "Sourcing Efficiency",     value: "4.2x",     delta: "+0.6x",trend: "up",   positive: true  },
  { label: "Pipeline Velocity",       value: "11 days",  delta: "-2d",  trend: "down", positive: true  },
];

export function generateAnalyticsSnapshot(
  candidates: Candidate[],
  totalScanned: number,
): AnalyticsSnapshot {
  const n = candidates.length;
  const scale = totalScanned / Math.max(n, 1);

  // ── Skill distribution ──────────────────────────────────────────────────────
  const skillCounts: Record<string, number> = {};
  MOCK_CANDIDATE_POOL.forEach((raw) => {
    raw.baseSkills.forEach((s) => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
  });
  const skillDistribution: SkillDistributionPoint[] = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count: Math.round(count * scale * 0.6) }));

  // ── Score distribution ──────────────────────────────────────────────────────
  const scoreDistribution: ScoreDistributionSlice[] = SCORE_BANDS.map(({ band, min, max }) => {
    const poolCount = candidates.filter((c) => c.score >= min && c.score < max).length;
    return {
      band,
      value: Math.max(1, Math.round(poolCount * scale)),
      color: SCORE_BAND_COLORS[band],
    };
  });

  // ── Experience levels ───────────────────────────────────────────────────────
  const experienceLevels: ExperienceLevelPoint[] = [
    { bracket: "0-2 yrs",  count: Math.round(totalScanned * 0.13) },
    { bracket: "3-5 yrs",  count: Math.round(totalScanned * 0.31) },
    { bracket: "6-8 yrs",  count: Math.round(totalScanned * 0.22) },
    { bracket: "9-12 yrs", count: Math.round(totalScanned * 0.19) },
    { bracket: "13+ yrs",  count: Math.round(totalScanned * 0.08) },
  ];

  // ── Candidate sources ───────────────────────────────────────────────────────
  const sourceCounts: Record<string, number> = {};
  MOCK_CANDIDATE_POOL.forEach((raw) => {
    sourceCounts[raw.source] = (sourceCounts[raw.source] || 0) + 1;
  });
  const totalSrc = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
  const candidateSources: CandidateSourceSlice[] = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      value: Math.round((count / totalSrc) * 100),
      color: SOURCE_COLORS[source] ?? "#9B4C7D",
    }));

  // ── Hiring funnel ───────────────────────────────────────────────────────────
  const strong  = candidates.filter((c) => c.matchLevel === "strong").length;
  const partial = candidates.filter((c) => c.matchLevel === "partial").length;
  const above50 = strong + partial;
  const shortlisted = Math.max(1, Math.round(strong * 0.45));

  const hiringFunnel: FunnelStage[] = [
    { label: "Total Resumes", value: totalScanned,                          percent: 100,                                                        color: "#532057" },
    { label: "AI Screened",   value: Math.round(totalScanned * 0.79),       percent: 79,                                                         color: "#7C3C64" },
    { label: "Score > 50%",   value: Math.round(above50  * scale),          percent: Math.max(1, Math.round((above50  * scale / totalScanned) * 100)), color: "#9B4C7D" },
    { label: "Score > 70%",   value: Math.round(strong   * scale),          percent: Math.max(1, Math.round((strong   * scale / totalScanned) * 100)), color: "#C26A9A" },
    { label: "Shortlisted",   value: Math.round(shortlisted * scale * 0.5), percent: Math.max(1, Math.round((shortlisted * scale * 0.5 / totalScanned) * 100)), color: "#AE445A" },
  ];

  return {
    skillDistribution,
    skillBarColors: SKILL_BAR_COLORS,
    scoreDistribution,
    experienceLevels,
    hiringTrend: MONTHLY_TREND,
    candidateSources,
    hiringFunnel,
    keyMetrics: KEY_METRICS,
    totalScanned,
  };
}
