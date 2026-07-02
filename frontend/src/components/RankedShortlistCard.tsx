import { useState } from "react";
import {
  Award, Download, Share2, Info, Search, SlidersHorizontal,
  ArrowUpDown, Users, Loader2,
} from "lucide-react";
import { useCandidates } from "../hooks/useCandidates";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAppState } from "../context/AppStateContext";
import ScoreBadge from "./ScoreBadge";
import Avatar from "./Avatar";
import { CandidateRowSkeleton } from "./ui/Skeleton";
import type { SortKey, FilterLevel } from "../types";


const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "score", label: "Score"      },
  { value: "name",  label: "Name"       },
  { value: "role",  label: "Role"       },
];

const FILTER_OPTIONS: { value: FilterLevel; label: string }[] = [
  { value: "all",     label: "All Levels"  },
  { value: "strong",  label: "Strong"      },
  { value: "partial", label: "Partial"     },
  { value: "weak",    label: "Weak"        },
];

export default function RankedShortlistCard() {
  const {
    topCandidates,
    filteredCandidates,
    totalScanned,

    searchQuery,
    filterLevel,
    sortBy,
    setSearchQuery,
    setFilterLevel,
    setSortBy,
  } = useCandidates();

  const { isAnalysing } = useAnalysis();
  const { dispatch } = useAppState();

  // Local UI state for inline search (separate from global so topbar doesn't interfere)
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Apply local search on Enter or after short debounce-like update
  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    setSearchQuery(val);
  };

  // Export CSV
  const handleDownload = () => {
    const header = "Name,Role,Score,Match Level,Skills";
    const rows = filteredCandidates.map(
      (c) => `${c.name},${c.role},${Math.round(c.score * 100)}%,${c.matchLevel},"${c.skills.join("; ")}"`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ranked_candidates.csv";
    a.click();
    URL.revokeObjectURL(url);

    dispatch({
      type: "ADD_TOAST",
      payload: { type: "success", title: "Export complete", message: `${filteredCandidates.length} candidates exported as CSV.` },
    });
  };

  // Share (copy link to clipboard simulation)
  const handleShare = () => {
    const text = topCandidates
      .map((c) => `${c.name} (${Math.round(c.score * 100)}%) — ${c.role}`)
      .join("\n");
    navigator.clipboard?.writeText(text).catch(() => {});
    dispatch({
      type: "ADD_TOAST",
      payload: { type: "info", title: "Copied to clipboard", message: "Shortlist summary copied." },
    });
  };

  const navigateToCandidates = () => {
    dispatch({ type: "SET_ACTIVE_PAGE", payload: "candidates" });
  };

  const displayCandidates = isAnalysing ? [] : topCandidates;
  const showEmptyState = !isAnalysing && displayCandidates.length === 0;

  return (
    <div className="flex h-full flex-col rounded-xl2 border border-violet-100 bg-white shadow-panel">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-violet-100 px-6 py-5">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-orchid-500" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Final Ranked Shortlist
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            disabled={displayCandidates.length === 0}
            title="Export CSV"
            className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-violet-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleShare}
            disabled={displayCandidates.length === 0}
            title="Copy shortlist"
            className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-violet-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Filter / Sort bar ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-violet-50 px-6 py-3">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-violet-100 bg-cream-50 px-3 py-1.5 text-sm text-ink/40">
          <Search size={13} />
          <input
            type="text"
            placeholder="Search candidates…"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-xs text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-cream-50 px-2.5 py-1.5">
          <SlidersHorizontal size={12} className="text-ink/40" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
            className="bg-transparent text-xs text-ink/70 focus:outline-none"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-cream-50 px-2.5 py-1.5">
          <ArrowUpDown size={12} className="text-ink/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-transparent text-xs text-ink/70 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Column headers ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1.6fr_0.7fr_1fr_1.2fr] gap-4 px-6 pt-4 text-[11px] font-semibold uppercase tracking-wide text-ink/35">
        <span>Candidate</span>
        <span>Score</span>
        <span>Top Skills</span>
        <span>Insight</span>
      </div>

      {/* ── Rows ────────────────────────────────────────────────────────── */}
      <div className="scrollbar-thin flex-1 divide-y divide-violet-50 overflow-y-auto px-6">
        {isAnalysing ? (
          // Skeleton placeholders
          Array.from({ length: 3 }).map((_, i) => <CandidateRowSkeleton key={i} />)
        ) : showEmptyState ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-400">
              <Users size={22} />
            </div>
            <p className="text-sm font-medium text-ink/50">
              {searchQuery
                ? "No candidates match your search."
                : "Upload resumes and run analysis to see rankings."}
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="text-xs font-semibold text-orchid-500 hover:text-orchid-600"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          displayCandidates.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[1.6fr_0.7fr_1fr_1.2fr] items-center gap-4 py-5"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={c.initials} level={c.matchLevel} />
                <div>
                  <p className="text-sm font-semibold leading-tight text-ink">
                    {c.name}
                  </p>
                  <p className="text-xs leading-tight text-ink/40">{c.role}</p>
                </div>
              </div>

              <ScoreBadge score={c.score} level={c.matchLevel} />

              <div className="flex flex-wrap gap-1.5">
                {c.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="text-xs leading-relaxed text-ink/60">
                <p className="italic">&ldquo;{c.insight}&rdquo;</p>
                <button
                  className="mt-1 inline-flex items-center gap-1 font-semibold text-orchid-500 hover:text-orchid-600"
                  onClick={() =>
                    dispatch({
                      type: "ADD_TOAST",
                      payload: { type: "info", title: `Score insight for ${c.name}`, message: c.insight },
                    })
                  }
                >
                  <Info size={12} />
                  Why this score?
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-violet-100 px-6 py-4">
        <p className="text-xs font-medium text-ink/45">
          {isAnalysing ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" />
              Analysing resumes…
            </span>
          ) : (
            `Showing top ${displayCandidates.length} of ${totalScanned} scanned resumes`
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={navigateToCandidates}
            className="rounded-lg border border-violet-200 px-3.5 py-2 text-xs font-semibold text-ink/70 hover:bg-violet-50"
          >
            View All Candidates
          </button>
          <button
            onClick={() => setFilterLevel(filterLevel === "strong" ? "all" : "strong")}
            className="rounded-lg bg-violet-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-600"
          >
            {filterLevel === "strong" ? "Show All" : "Refine Search"}
          </button>
        </div>
      </div>
    </div>
  );
}
