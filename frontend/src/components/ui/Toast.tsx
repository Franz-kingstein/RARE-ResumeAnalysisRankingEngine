import { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useAppState } from "../../context/AppStateContext";
import type { Toast } from "../../types";
import { cn } from "../../utils/cn";

// ─── Single toast item ────────────────────────────────────────────────────────

const ICONS: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircle size={18} className="shrink-0 text-violet-500" />,
  error:   <XCircle    size={18} className="shrink-0 text-rose-500"   />,
  info:    <Info       size={18} className="shrink-0 text-orchid-500" />,
  warning: <AlertTriangle size={18} className="shrink-0 text-peach-500" />,
};

const ACCENT: Record<Toast["type"], string> = {
  success: "border-violet-200",
  error:   "border-rose-200",
  info:    "border-orchid-200",
  warning: "border-peach-400",
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-pop",
        "animate-toast-in",
        ACCENT[toast.type],
      )}
    >
      {ICONS[toast.type]}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-ink">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-xs leading-relaxed text-ink/55">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-ink/30 transition-colors hover:bg-violet-50 hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Toast container (fixed overlay) ─────────────────────────────────────────

export function ToastContainer() {
  const { state, dispatch } = useAppState();

  const dismiss = (id: string) =>
    dispatch({ type: "REMOVE_TOAST", payload: id });

  if (state.toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-50 flex w-72 flex-col gap-2"
    >
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}
