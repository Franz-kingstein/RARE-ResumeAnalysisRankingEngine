import type { AnalysisInput, AnalysisResult } from "../types";
import { analysisApi } from "../api/analysis";
import { dashboardApi } from "../api/dashboard";
import { mapBackendCandidate, mapBackendDashboardToAnalytics } from "../utils/dataMapping";
import { generateSkillGap } from "../mock/mockEngine";

export const dashboardService = {
  async runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const { jobDescription, files } = input;

    // 1. Ingest files if browser File objects are present
    const browserFiles = files
      .map((f: any) => f.file)
      .filter((file): file is File => file instanceof File);

    if (browserFiles.length > 0) {
      await analysisApi.ingestResumes(browserFiles);
    }

    // 2. Run analysis ranking
    const analysisRes = await analysisApi.runAnalysis(jobDescription, 10);

    // 3. Map candidates response
    const candidates = analysisRes.candidates.map(mapBackendCandidate);

    // 4. Fetch dashboard charts and merge metrics
    const dbData = await dashboardApi.getDashboardData(jobDescription, 20);
    const analyticsSnapshot = mapBackendDashboardToAnalytics(dbData, candidates);

    // 5. Compute skill gap data
    const topCandidate = candidates[0];
    const skillGapData = topCandidate ? generateSkillGap(topCandidate, jobDescription) : [];

    return { candidates, skillGapData, analyticsSnapshot };
  },
};
