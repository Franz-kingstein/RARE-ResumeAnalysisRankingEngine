import type { MatchLevel } from "../types";

const avatarStyles: Record<MatchLevel, string> = {
  strong: "bg-violet-500",
  partial: "bg-orchid-500",
  weak: "bg-rose-500",
};

export default function Avatar({
  initials,
  level,
}: {
  initials: string;
  level: MatchLevel;
}) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarStyles[level]}`}
    >
      {initials}
    </div>
  );
}
