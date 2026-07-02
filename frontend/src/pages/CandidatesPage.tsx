import { Search, SlidersHorizontal, ArrowUpDown, Users } from "lucide-react";
import { useCandidates } from "../hooks/useCandidates";
import { useAnalysis } from "../hooks/useAnalysis";
import CandidateCard from "../components/CandidateCard";
import { CandidateCardSkeleton } from "../components/ui/Skeleton";
import type { SortKey, FilterLevel } from "../types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "score", label: "Score"  },
  { value: "name",  label: "Name"   },
  { value: "role",  label: "Role"   },
];

const FILTER_OPTIONS: { value: FilterLevel; label: string }[] = [
  { value: "all",     label: "All Levels" },
  { value: "strong",  label: "Strong"     },
  { value: "partial", label: "Partial"    },
  { value: "weak",    label: "Weak"       },
];

export default function CandidatesPage() {
  const {
    filteredCandidates,
    allCandidates,
    searchQuery,
    filterLevel,
    sortBy,
    setSearchQuery,
    setFilterLevel,
    setSortBy,
  } = useCandidates();

  const { isAnalysing } = useAnalysis();

  const hasNoData = !isAnalysing && allCandidates.length === 0;
  const hasNoResults = !isAnalysing && allCandidates.length > 0 && filteredCandidates.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Candidates
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Full candidate directory — {isAnalysing ? "analysing…" : `${filteredCandidates.length} of ${allCandidates.length} shown`}
        </p>
      </div>

      {/* Controls */}
      {!hasNoData && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 shadow-sm">
            <Search size={15} className="shrink-0 text-ink/35" />
            <input
              type="text"
              placeholder="Search by name, role, or skill…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3.5 py-2.5 shadow-sm">
            <SlidersHorizontal size={14} className="text-ink/40" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
              className="bg-transparent text-sm text-ink/70 focus:outline-none"
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3.5 py-2.5 shadow-sm">
            <ArrowUpDown size={14} className="text-ink/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-transparent text-sm text-ink/70 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>Sort: {o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {isAnalysing && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CandidateCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty — no analysis run yet */}
      {hasNoData && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-violet-200 bg-white/60 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-500">
            <Users size={22} />
          </div>
          <p className="text-sm font-medium text-ink/60">
            This view will list every candidate in the resume library.
          </p>
          <p className="text-xs text-ink/40">
            For now, see the ranked shortlist on the Dashboard tab.
          </p>
        </div>
      )}

      {/* No search results */}
      {hasNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-violet-200 bg-white/60 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-400">
            <Search size={22} />
          </div>
          <p className="text-sm font-medium text-ink/60">
            No candidates match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            onClick={() => { setSearchQuery(""); setFilterLevel("all"); }}
            className="text-xs font-semibold text-orchid-500 hover:text-orchid-600"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Candidate grid */}
      {!isAnalysing && !hasNoData && !hasNoResults && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCandidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
