import { Check } from "lucide-react";
import type { AnalysisStep } from "../../types";
import { cn } from "../../utils/cn";

interface ProgressStepsProps {
  steps: AnalysisStep[];
}

/**
 * Displays the 8-step analysis pipeline with animated status indicators.
 * Renders inside AnalysisInputCard during analysis.
 */
export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="mt-4 space-y-2.5">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          {/* Status dot */}
          <div
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all",
              step.status === "done"    && "bg-violet-500",
              step.status === "active"  && "bg-orchid-500 ring-2 ring-orchid-200",
              step.status === "pending" && "bg-ink/10",
            )}
          >
            {step.status === "done" && (
              <Check size={9} strokeWidth={3} className="text-white" />
            )}
            {step.status === "active" && (
              <div className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
            )}
          </div>

          {/* Label */}
          <span
            className={cn(
              "text-xs transition-colors",
              step.status === "done"    && "font-semibold text-ink",
              step.status === "active"  && "font-semibold text-orchid-600",
              step.status === "pending" && "text-ink/35",
            )}
          >
            {step.label}
          </span>

          {/* Active bounce dots */}
          {step.status === "active" && (
            <div className="ml-auto flex items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block h-1 w-1 rounded-full bg-orchid-400"
                  style={{
                    animation: "bounce 0.8s ease-in-out infinite",
                    animationDelay: `${i * 140}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
