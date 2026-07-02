import {
  LayoutGrid,
  BarChart3,
  FolderOpen,
  FileText,
  History,
  Plus,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import type { Page } from "../types";

const navItems: { label: string; icon: typeof LayoutGrid; page: Page }[] = [
  { label: "Dashboard",       icon: LayoutGrid, page: "dashboard"  },
  { label: "Active Rankings", icon: BarChart3,  page: "analytics"  },
  { label: "Resume Library",  icon: FolderOpen, page: "candidates" },
  { label: "Job Templates",   icon: FileText,   page: "templates"  },
  { label: "History",         icon: History,    page: "history"    },
];

export default function Sidebar() {
  const { state, dispatch } = useAppState();
  const activePage = state.activePage;

  const navigate = (page: Page) => {
    dispatch({ type: "SET_ACTIVE_PAGE", payload: page });
  };

  const handleNewAnalysis = () => {
    dispatch({ type: "SET_ACTIVE_PAGE", payload: "dashboard" });
    dispatch({ type: "ADD_TOAST", payload: { type: "info", title: "New analysis", message: "Update your inputs and click Analyse Candidates." } });
  };

  return (
    <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col justify-between border-r border-violet-100 bg-white/70 px-4 py-6">
      <div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, page }) => {
            const active = page !== null && page === activePage;
            return (
              <button
                key={label}
                onClick={() => navigate(page)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-violet-500 text-white shadow-pop"
                    : "text-ink/60 hover:bg-violet-50 hover:text-ink",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleNewAnalysis}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient-soft px-4 py-3 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Analysis
        </button>
      </div>

      <div className="space-y-1 border-t border-violet-100 pt-4">
        <button
          onClick={() =>
            dispatch({ type: "ADD_TOAST", payload: { type: "info", title: "Support", message: "Support portal coming soon." } })
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-violet-50 hover:text-ink"
        >
          <LifeBuoy size={18} strokeWidth={2} />
          Support
        </button>
        <button
          onClick={() =>
            dispatch({ type: "ADD_TOAST", payload: { type: "info", title: "Sign out", message: "Sign-out is not available in demo mode." } })
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-violet-50 hover:text-ink"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
