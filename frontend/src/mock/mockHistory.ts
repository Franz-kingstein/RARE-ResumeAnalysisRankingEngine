import type { HistoryRecord } from "../types";
import { scoreAllCandidates, generateAnalyticsSnapshot, generateSkillGap } from "./mockEngine";

const MOCK_HISTORY_TITLES = [
  "Senior Backend Engineer - Q2 Hiring",
  "Frontend Specialist - Core Team",
  "Cloud Architect - Infrastructure",
  "Data Engineer - ETL Pipeline",
  "ML Scientist - Recommendations",
  "DevSecOps Engineer - Security",
  "Mobile Engineer - iOS App",
  "Fullstack Developer - Growth",
  "SRE - Platform Team",
  "Principal Engineer - Architecture",
];

const MOCK_DEPARTMENTS = ["Engineering", "Platform", "Data", "Security"];

// We will generate 30 mock history records dynamically to ensure they have complete data structures.
export function generateMockHistory(): HistoryRecord[] {
  const records: HistoryRecord[] = [];
  
  for (let i = 0; i < 30; i++) {
    const jd = MOCK_HISTORY_TITLES[i % MOCK_HISTORY_TITLES.length] + " " + MOCK_DEPARTMENTS[i % MOCK_DEPARTMENTS.length];
    
    // Simulate a past analysis run
    const candidates = scoreAllCandidates(jd);
    const totalScanned = 100 + Math.floor(Math.random() * 200); // 100 - 300
    const analytics = generateAnalyticsSnapshot(candidates, totalScanned);
    const topCandidate = candidates[0];
    const skillGap = topCandidate ? generateSkillGap(topCandidate, jd) : [];

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date in the last 60 days

    records.push({
      id: `hist-${1000 + i}`,
      date: date.toISOString(),
      jobDescription: jd,
      templateId: Math.random() > 0.5 ? `tpl-${(i % 15) + 1}` : undefined,
      candidatesScanned: totalScanned,
      candidatesShortlisted: candidates.filter(c => c.matchLevel === 'strong').length,
      topCandidates: candidates.slice(0, 5),
      analyticsSnapshot: analytics,
      skillGapData: skillGap,
    });
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const MOCK_HISTORY = generateMockHistory();
