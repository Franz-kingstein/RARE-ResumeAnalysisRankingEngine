import type { Candidate, SkillGapPoint, AnalyticsSnapshot } from "../types";
import { generateSkillGap, generateAnalyticsSnapshot } from "../mock/mockEngine";
import { analyticsApi } from "../api/analytics";

export const analyticsService = {
  async getAnalytics(candidates: Candidate[]): Promise<AnalyticsSnapshot> {
    try {
      const stats = await analyticsApi.getAnalytics();
      const snapshot = generateAnalyticsSnapshot(candidates, stats.totalCandidates);
      snapshot.totalScanned = stats.totalCandidates;
      
      // Update shortlisted stage in funnel using live stats from backend
      if (snapshot.hiringFunnel && snapshot.hiringFunnel.length > 0) {
        snapshot.hiringFunnel[0].value = stats.totalCandidates;
        const lastStage = snapshot.hiringFunnel[snapshot.hiringFunnel.length - 1];
        if (lastStage) {
          lastStage.value = stats.shortlisted;
          lastStage.percent = Math.round((stats.shortlisted / Math.max(1, stats.totalCandidates)) * 100);
        }
      }
      
      return snapshot;
    } catch (err) {
      // Fallback in case analytics API fails or has empty state
      return generateAnalyticsSnapshot(candidates, candidates.length || 152);
    }
  },

  async getSkillGap(
    topCandidate: Candidate,
    jobDescription: string,
  ): Promise<SkillGapPoint[]> {
    return generateSkillGap(topCandidate, jobDescription);
  },
};
