import { useState, useMemo, useEffect } from "react";
import { Search, Download, Trash2, FileText, Users, Eye, History } from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import type { HistoryRecord } from "../types";
import { Modal } from "../components/ui/Modal";
import { useHistory } from "../hooks/useHistory";

export default function HistoryPage() {
  const { dispatch } = useAppState();
  const { historyRecords, loading, refresh, deleteHistory } = useHistory();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Load history records on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredHistory = useMemo(() => {
    return historyRecords.filter(h => 
      h.jobDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [historyRecords, searchQuery]);

  const handleOpenRecord = (record: HistoryRecord) => {
    // Restore state
    dispatch({ type: "SET_JOB_DESCRIPTION", payload: record.jobDescription });
    dispatch({ type: "SET_CANDIDATES", payload: record.topCandidates });
    dispatch({ type: "SET_ANALYTICS_SNAPSHOT", payload: record.analyticsSnapshot });
    dispatch({ type: "SET_SKILL_GAP_DATA", payload: record.skillGapData });
    dispatch({ type: "SET_ACTIVE_PAGE", payload: "analytics" });
    
    dispatch({
      type: "ADD_TOAST",
      payload: { type: "success", title: "History Restored", message: "Viewing past analysis results." }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHistory(id);
      setRecordToDelete(null);
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "info", title: "Record deleted", message: "History record removed successfully." }
      });
    } catch {
      dispatch({
        type: "ADD_TOAST",
        payload: { type: "error", title: "Deletion failed", message: "Failed to delete history record." }
      });
    }
  };

  const handleExport = () => {
    dispatch({
      type: "ADD_TOAST",
      payload: { type: "info", title: "Export Started", message: "Exporting history to CSV format..." }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Analysis History
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Review past resume analysis runs and shortlists.
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-white border border-violet-200 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:bg-violet-50 transition-colors"
        >
          <Download size={16} />
          Export All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 shadow-sm max-w-md">
        <Search size={15} className="shrink-0 text-ink/35" />
        <input
          type="text"
          placeholder="Search by job description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none"
        />
      </div>

      {/* History Table */}
      {loading && historyRecords.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm font-medium text-ink/40">Loading history...</span>
        </div>
      ) : (
        <div className="rounded-xl2 border border-violet-100 bg-white shadow-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink/70">
              <thead className="bg-cream-50/50 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Job Role / Search</th>
                  <th className="px-6 py-4 text-center">Scanned</th>
                  <th className="px-6 py-4 text-center">Shortlisted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {filteredHistory.map(record => (
                  <tr key={record.id} className="transition-colors hover:bg-violet-50/30">
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-ink/60">
                      {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-ink max-w-xs truncate">
                      {record.jobDescription}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink/70">
                        <FileText size={12} />
                        {record.candidatesScanned}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        <Users size={12} />
                        {record.candidatesShortlisted}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenRecord(record)}
                          className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-violet-100 hover:text-violet-700 tooltip"
                          title="View Results"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => setRecordToDelete(record.id)}
                          className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-rose-50 hover:text-rose-500"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <History size={32} className="mx-auto mb-4 text-violet-200" />
                      <p className="text-sm font-medium text-ink/60">No history records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal 
        isOpen={!!recordToDelete} 
        onClose={() => setRecordToDelete(null)}
        title="Delete History Record"
      >
        <p className="mb-6 text-sm text-ink/70">
          Are you sure you want to delete this history record? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setRecordToDelete(null)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-violet-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => recordToDelete && handleDelete(recordToDelete)}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Delete Record
          </button>
        </div>
      </Modal>
    </div>
  );
}
