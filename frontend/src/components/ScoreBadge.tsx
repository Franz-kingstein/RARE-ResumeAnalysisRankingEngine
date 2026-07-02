import type { MatchLevel } from "../types";

const styles: Record<MatchLevel, { bg: string; text: string; bar: string }> = {
  strong:  { bg: "bg-violet-50",       text: "text-violet-600",  bar: "bg-violet-500"  },
  partial: { bg: "bg-peach-300/60",    text: "text-orchid-600",  bar: "bg-orchid-500"  },
  weak:    { bg: "bg-rose-500/10",     text: "text-rose-500",    bar: "bg-rose-500"    },
};

export default function ScoreBadge({
  score,
  level,
}: {
  score: number;
  level: MatchLevel;
}) {
  const s = styles[level];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${s.bg} ${s.text}`}
      >
        {Math.round(score * 100)}%
      </span>
      <div className="h-1 w-12 overflow-hidden rounded-full bg-ink/5">
        <div
          className={`h-full rounded-full ${s.bar}`}
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>
    </div>
  );
}
