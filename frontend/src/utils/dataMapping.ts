import type { Candidate, MatchLevel, AnalyticsSnapshot } from "../types";
import type { BackendCandidate, BackendDashboardResponse } from "../types/api";
import { generateAnalyticsSnapshot } from "../mock/mockEngine";

export function mapBackendCandidate(bc: BackendCandidate): Candidate {
  const rawId = bc.id !== undefined ? bc.id : bc.candidate_id;
  const id = String(rawId || "");
  
  // Score mapping: ai_match_score or score
  const score = bc.ai_match_score !== undefined ? bc.ai_match_score : (bc.score !== undefined ? bc.score : 0);
  
  // Match level logic:
  // 90-100 -> Strong
  // 70-89 -> Partial
  // 0-69 -> Weak
  const pct = score * 100;
  let matchLevel: MatchLevel = "weak";
  if (pct >= 90) matchLevel = "strong";
  else if (pct >= 70) matchLevel = "partial";

  // Skills: string -> string[]
  let skills: string[] = [];
  if (typeof bc.skills === "string") {
    skills = bc.skills.split(",").map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(bc.skills)) {
    skills = bc.skills;
  }

  // Initials
  const name = bc.name || "Unknown Candidate";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();

  // Experience: format to display text
  let experience = "N/A";
  if (bc.experience !== undefined && bc.experience !== null) {
    const num = parseFloat(String(bc.experience));
    if (!isNaN(num)) {
      experience = `${num} yr${num !== 1 ? 's' : ''}`;
    } else {
      experience = String(bc.experience);
    }
  }

  // Insight
  const insights: Record<MatchLevel, string[]> = {
    strong: ["Strong match on core technical requirements.", "Excellent technical depth and experience alignment."],
    partial: ["Partial match — solid foundation but minor skill gaps.", "Good candidate with adjacent experience."],
    weak: ["Limited overlap with core requirements.", "Recommend routing to alternative roles."],
  };
  const insight = insights[matchLevel][0];

  return {
    id,
    name,
    initials,
    role: "Candidate",
    score,
    matchLevel,
    skills: skills.slice(0, 4),
    insight,
    experience,
    location: "Remote",
    source: "Portal",
  };
}

export function mapBackendDashboardToAnalytics(
  bd: BackendDashboardResponse,
  candidates: Candidate[]
): AnalyticsSnapshot {
  // Call general generator first to get initial charts structure
  const baseSnapshot = generateAnalyticsSnapshot(candidates, bd.total_candidates);

  // Map skill distribution from backend
  if (bd.skill_distribution && bd.skill_distribution.length > 0) {
    baseSnapshot.skillDistribution = bd.skill_distribution.map(item => ({
      skill: item.skill,
      count: item.count,
    }));
  }

  // Map score distribution from backend
  if (bd.score_distribution && bd.score_distribution.length > 0) {
    baseSnapshot.scoreDistribution = bd.score_distribution.map(item => ({
      band: item.label, // Band string like "90-100%"
      value: item.count,
      color: getScoreBandColor(item.label),
    }));
  }

  // Map experience levels from backend
  if (bd.experience_distribution && bd.experience_distribution.length > 0) {
    baseSnapshot.experienceLevels = bd.experience_distribution.map(item => ({
      bracket: item.label,
      count: item.count,
    }));
  }

  baseSnapshot.totalScanned = bd.total_candidates;
  return baseSnapshot;
}

function getScoreBandColor(band: string): string {
  const colors: Record<string, string> = {
    "90-100%": "#9B4C7D",
    "70-89%":  "#532057",
    "50-69%":  "#F39F5A",
    "30-49%":  "#D998B8",
    "0-29%":   "#AE445A",
  };
  return colors[band] || "#9B4C7D";
}
