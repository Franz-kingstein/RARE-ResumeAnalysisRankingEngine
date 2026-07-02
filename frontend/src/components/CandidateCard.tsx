import { MapPin, Briefcase, Info } from "lucide-react";
import type { Candidate } from "../types";
import Avatar from "./Avatar";
import ScoreBadge from "./ScoreBadge";
import { useAppState } from "../context/AppStateContext";

interface CandidateCardProps {
  candidate: Candidate;
}

export default function CandidateCard({ candidate: c }: CandidateCardProps) {
  const { state, dispatch } = useAppState();
  const isSelected = state.selectedCandidateId === c.id;

  const handleSelect = () => {
    dispatch({ type: "SELECT_CANDIDATE", payload: isSelected ? null : c.id });
    if (!isSelected) {
      dispatch({
        type: "ADD_TOAST",
        payload: {
          type: "info",
          title: `${c.name} selected`,
          message: `Match level: ${c.matchLevel}`,
        },
      });
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={[
        "cursor-pointer rounded-xl2 border bg-white p-5 shadow-panel transition-all duration-200",
        isSelected
          ? "border-violet-400 ring-2 ring-violet-200"
          : "border-violet-100 hover:border-violet-300 hover:shadow-pop",
      ].join(" ")}
    >
      {/* Header row */}
      <div className="mb-4 flex items-start gap-3">
        <Avatar initials={c.initials} level={c.matchLevel} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-ink">
            {c.name}
          </p>
          <p className="text-xs leading-tight text-ink/40">{c.role}</p>
        </div>
        <ScoreBadge score={c.score} level={c.matchLevel} />
      </div>

      {/* Skills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {c.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-600"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Metadata */}
      {(c.experience || c.location) && (
        <div className="mb-3 flex flex-wrap gap-3">
          {c.experience && (
            <span className="flex items-center gap-1 text-[11px] text-ink/45">
              <Briefcase size={11} />
              {c.experience}
            </span>
          )}
          {c.location && (
            <span className="flex items-center gap-1 text-[11px] text-ink/45">
              <MapPin size={11} />
              {c.location}
            </span>
          )}
        </div>
      )}

      {/* Insight */}
      <p className="text-xs italic leading-relaxed text-ink/55">
        &ldquo;{c.insight}&rdquo;
      </p>

      {/* Why this score */}
      <button className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-orchid-500 hover:text-orchid-600">
        <Info size={11} />
        Why this score?
      </button>
    </div>
  );
}
