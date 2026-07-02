import type { FunnelStage } from "../../types";

export default function HiringFunnelCard({ stages }: { stages: FunnelStage[] }) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <h3 className="mb-5 font-display text-base font-semibold text-ink">
        Hiring Funnel
      </h3>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.label} className="grid grid-cols-[110px_1fr_44px] items-center gap-3">
            <span className="text-xs font-medium text-ink/60">{stage.label}</span>
            <div className="h-7 overflow-hidden rounded-md bg-cream-100">
              <div
                className="flex h-full items-center rounded-md px-2.5 text-xs font-bold text-white transition-all"
                style={{ width: `${Math.max(stage.percent, 10)}%`, backgroundColor: stage.color }}
              >
                {stage.value}
              </div>
            </div>
            <span className="text-right text-xs font-semibold text-ink/50">
              {stage.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
