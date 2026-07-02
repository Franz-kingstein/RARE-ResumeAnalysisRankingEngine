import type { Candidate, SkillGapPoint } from "./types";

export const candidates: Candidate[] = [
  {
    id: "AJ",
    name: "Alice Johnson",
    initials: "AJ",
    role: "Senior Software Engineer",
    score: 0.95,
    matchLevel: "strong",
    skills: ["Go", "Docker", "Kubernetes", "Microservices"],
    insight: "Strong match on backend architecture and distributed systems depth.",
  },
  {
    id: "CD",
    name: "Charlie Davis",
    initials: "CD",
    role: "Fullstack Dev",
    score: 0.72,
    matchLevel: "partial",
    skills: ["Python", "Django", "AWS", "Kubernetes"],
    insight: "Partial match — has orchestration exposure, but limited Go experience.",
  },
  {
    id: "BS",
    name: "Bob Smith",
    initials: "BS",
    role: "Frontend Engineer",
    score: 0.25,
    matchLevel: "weak",
    skills: ["React", "CSS", "HTML", "TypeScript"],
    insight: "No overlap with backend requirements; strictly a client-side profile.",
  },
];

// Skill gap analysis for the top-ranked candidate against the role's requirements
export const skillGapData: SkillGapPoint[] = [
  { skill: "Go", required: 90, candidate: 88 },
  { skill: "Kubernetes", required: 85, candidate: 92 },
  { skill: "Microservices", required: 80, candidate: 85 },
  { skill: "System Design", required: 85, candidate: 78 },
  { skill: "Docker", required: 70, candidate: 80 },
  { skill: "Observability", required: 65, candidate: 55 },
];

export const totalScanned = 152;
