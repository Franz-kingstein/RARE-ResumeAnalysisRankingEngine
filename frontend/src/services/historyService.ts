import type { HistoryRecord } from "../types";
import { historyApi } from "../api/history";
import type { BackendHistory } from "../types/api";
import { generateAnalyticsSnapshot, generateSkillGap, scoreAllCandidates } from "../mock/mockEngine";

function mapToFrontendHistory(bh: BackendHistory): HistoryRecord {
  const jd = bh.batchName || "Resume Batch";
  const candidatesScanned = bh.candidates || 0;
  const candidatesShortlisted = Math.round(candidatesScanned * 0.15);

  // Score candidate pool against batchName query to generate mock details for history details restoration
  const topCandidates = scoreAllCandidates(jd).slice(0, 5);
  const analyticsSnapshot = generateAnalyticsSnapshot(topCandidates, candidatesScanned);
  const skillGapData = topCandidates.length > 0 ? generateSkillGap(topCandidates[0], jd) : [];

  return {
    id: bh.id,
    date: bh.date.includes("T") ? bh.date : `${bh.date}T12:00:00Z`,
    jobDescription: jd,
    candidatesScanned,
    candidatesShortlisted,
    topCandidates,
    analyticsSnapshot,
    skillGapData,
  };
}

export const historyService = {
  async getHistory(): Promise<HistoryRecord[]> {
    const list = await historyApi.getHistory();
    return list.map(mapToFrontendHistory);
  },

  async deleteHistoryRecord(id: string): Promise<void> {
    await historyApi.deleteHistoryRecord(id);
  },
};
