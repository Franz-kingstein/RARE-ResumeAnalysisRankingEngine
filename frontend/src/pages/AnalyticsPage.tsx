import { BarChart3 } from "lucide-react";
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import SkillDistributionChart from "../components/analytics/SkillDistributionChart";
import ScoreDistributionDonut from "../components/analytics/ScoreDistributionDonut";
import ExperienceLevelsChart from "../components/analytics/ExperienceLevelsChart";
import MonthlyHiringTrendChart from "../components/analytics/MonthlyHiringTrendChart";
import CandidateSourcesChart from "../components/analytics/CandidateSourcesChart";
import HiringFunnelCard from "../components/analytics/HiringFunnelCard";
import KeyMetricsCard from "../components/analytics/KeyMetricsCard";
import ScoreDistributionChart from "../components/ScoreDistributionChart";
import SkillGapRadar from "../components/SkillGapRadar";
import { useAnalytics } from "../hooks/useAnalytics";
import { useCandidates } from "../hooks/useCandidates";
import { useAppState } from "../context/AppStateContext";
import { ChartSkeleton } from "../components/ui/Skeleton";

function EmptyAnalyticsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-violet-200 bg-white/60 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-400">
        <BarChart3 size={22} />
      </div>
      <p className="text-sm font-medium text-ink/60">
        Run your first analysis to see insights here.
      </p>
      <p className="text-xs text-ink/40">
        Upload resumes and a job description on the Dashboard tab.
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { analyticsSnapshot, isLoading, hasData } = useAnalytics();
  const { allCandidates, topCount } = useCandidates();
  const { state } = useAppState();

  const topCandidate = allCandidates[0];
  const chartCandidates = allCandidates.slice(0, topCount);

  if (isLoading) {
    return (
      <div>
        <AnalyticsHeader />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div>
        <AnalyticsHeader />
        <EmptyAnalyticsState />
      </div>
    );
  }

  const snap = analyticsSnapshot!;

  return (
    <div>
      <AnalyticsHeader />

      {/* ── Row 0 — Score Distribution + Skill Gap Radar (moved from Dashboard) ── */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScoreDistributionChart candidates={chartCandidates} />
        <SkillGapRadar
          data={state.skillGapData}
          candidateName={topCandidate?.name ?? "Top Candidate"}
        />
      </div>

      {/* ── Row 1 — Skill Distribution / Score Distribution / Experience Levels ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SkillDistributionChart data={snap.skillDistribution} colors={snap.skillBarColors} />
        <ScoreDistributionDonut data={snap.scoreDistribution} />
        <ExperienceLevelsChart data={snap.experienceLevels} />
      </div>

      {/* ── Row 2 — Monthly Hiring Trend (wide) / Candidate Sources ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyHiringTrendChart data={snap.hiringTrend} />
        </div>
        <CandidateSourcesChart data={snap.candidateSources} />
      </div>

      {/* ── Row 3 — Hiring Funnel / Key Metrics Summary ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HiringFunnelCard stages={snap.hiringFunnel} />
        <KeyMetricsCard metrics={snap.keyMetrics} />
      </div>
    </div>
  );
}
