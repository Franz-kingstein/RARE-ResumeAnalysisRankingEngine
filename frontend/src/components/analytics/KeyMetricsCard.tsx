import { ArrowUp, ArrowDown } from "lucide-react";
import type { KeyMetric } from "../../types";

export default function KeyMetricsCard({ metrics }: { metrics: KeyMetric[] }) {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <h3 className="mb-3 font-display text-base font-semibold text-ink">
        Key Metrics Summary
      </h3>
      <div className="divide-y divide-violet-50">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between py-3.5">
            <span className="text-sm text-ink/65">{m.label}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold tabular-nums text-ink">{m.value}</span>
              <span
                className={[
                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                  m.positive
                    ? "bg-violet-50 text-violet-600"
                    : "bg-rose-500/10 text-rose-500",
                ].join(" ")}
              >
                {m.trend === "up" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
