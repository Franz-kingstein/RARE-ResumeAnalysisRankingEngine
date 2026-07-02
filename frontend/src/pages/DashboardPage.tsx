import AnalysisInputCard from "../components/AnalysisInputCard";
import RankedShortlistCard from "../components/RankedShortlistCard";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Analysis Dashboard
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Review candidate rankings and AI-driven skill gap analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <AnalysisInputCard />
        <RankedShortlistCard />
      </div>
    </div>
  );
}
