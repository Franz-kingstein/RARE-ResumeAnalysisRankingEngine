import { useEffect } from "react";
import { AppStateProvider } from "./context/AppStateContext";
import { useAppState } from "./context/AppStateContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardPage from "./pages/DashboardPage";
import CandidatesPage from "./pages/CandidatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TemplatesPage from "./pages/TemplatesPage";
import HistoryPage from "./pages/HistoryPage";
import { ToastContainer } from "./components/ui/Toast";
import { useTemplates } from "./hooks/useTemplates";
import { useHistory } from "./hooks/useHistory";
import { useCandidates } from "./hooks/useCandidates";

/** Inner shell — reads activePage from the shared context (no local state). */
function AppShell() {
  const { state } = useAppState();
  const { activePage } = state;

  const { refresh: refreshTemplates } = useTemplates();
  const { refresh: refreshHistory } = useHistory();
  const { refresh: refreshCandidates } = useCandidates();

  useEffect(() => {
    refreshTemplates();
    refreshHistory();
    refreshCandidates();
  }, [refreshTemplates, refreshHistory, refreshCandidates]);

  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-6 py-8 lg:px-10">
          {activePage === "dashboard"  && <DashboardPage  />}
          {activePage === "candidates" && <CandidatesPage />}
          {activePage === "analytics"  && <AnalyticsPage  />}
          {activePage === "templates"  && <TemplatesPage  />}
          {activePage === "history"    && <HistoryPage    />}
        </main>
      </div>

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
