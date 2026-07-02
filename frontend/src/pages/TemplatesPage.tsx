import { useState, useMemo, useEffect } from "react";
import { Search, FolderOpen, Plus, Briefcase, Calendar, Trash2 } from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import type { JobTemplate } from "../types";
import { Modal } from "../components/ui/Modal";
import { useTemplates } from "../hooks/useTemplates";

export default function TemplatesPage() {
  const { dispatch } = useAppState();
  const { templates, loading, refresh, createTemplate, deleteTemplate } = useTemplates();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Create form state
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  // Load templates on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === "All" || t.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [templates, searchQuery, departmentFilter]);

  const departments = ["All", ...Array.from(new Set(templates.map(t => t.department)))];

  const handleUseTemplate = (template: JobTemplate) => {
    dispatch({ type: "SET_JOB_DESCRIPTION", payload: template.description });
    dispatch({ type: "SET_ACTIVE_PAGE", payload: "dashboard" });
    dispatch({ 
      type: "ADD_TOAST", 
      payload: { type: "success", title: "Template applied", message: `${template.title} loaded into Dashboard.` }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setTemplateToDelete(null);
      dispatch({ 
        type: "ADD_TOAST", 
        payload: { type: "info", title: "Template deleted", message: "Job template removed successfully." }
      });
    } catch {
      dispatch({ 
        type: "ADD_TOAST", 
        payload: { type: "error", title: "Deletion failed", message: "Failed to delete template." }
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (!createTitle.trim() || !createDescription.trim()) {
      dispatch({ type: "ADD_TOAST", payload: { type: "warning", title: "Fields required", message: "Please fill in all template fields." } });
      return;
    }

    try {
      await createTemplate({
        title: createTitle,
        description: createDescription,
        department: "Engineering",
        experience: "3-5 yrs",
        requiredSkills: [],
      });
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateDescription("");
      dispatch({ type: "ADD_TOAST", payload: { type: "success", title: "Template created", message: "Job template created successfully." } });
    } catch {
      dispatch({ type: "ADD_TOAST", payload: { type: "error", title: "Creation failed", message: "Failed to create template." } });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Job Templates
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Manage reusable job descriptions and skill requirements.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-violet-600 transition-colors"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 shadow-sm">
          <Search size={15} className="shrink-0 text-ink/35" />
          <input
            type="text"
            placeholder="Search templates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3.5 py-2.5 shadow-sm">
          <Briefcase size={14} className="text-ink/40" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-transparent text-sm text-ink/70 focus:outline-none"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading && templates.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm font-medium text-ink/40">Loading templates...</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(t => (
            <div key={t.id} className="flex flex-col justify-between rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel transition-all hover:border-violet-300 hover:shadow-pop">
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-ink">{t.title}</h3>
                    <p className="text-xs text-ink/50">{t.department} • {t.experience}</p>
                  </div>
                  {t.isCustom && (
                    <span className="rounded bg-orchid-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orchid-600">Custom</span>
                  )}
                </div>
                <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-ink/60">
                  {t.description}
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {t.requiredSkills.slice(0, 4).map(skill => (
                    <span key={skill} className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-600">
                      {skill}
                    </span>
                  ))}
                  {t.requiredSkills.length > 4 && (
                    <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-600">
                      +{t.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-violet-50 pt-4">
                <span className="flex items-center gap-1 text-[11px] text-ink/40">
                  <Calendar size={12} />
                  {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : 'Never used'}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTemplateToDelete(t.id)}
                    className="rounded p-1.5 text-ink/30 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleUseTemplate(t)}
                    className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-100"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen size={32} className="mb-4 text-violet-200" />
              <p className="text-sm font-medium text-ink/60">No templates found.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <Modal 
        isOpen={!!templateToDelete} 
        onClose={() => setTemplateToDelete(null)}
        title="Delete Template"
      >
        <p className="mb-6 text-sm text-ink/70">
          Are you sure you want to delete this template? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setTemplateToDelete(null)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-violet-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => templateToDelete && handleDelete(templateToDelete)}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Delete Template
          </button>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        title="Create Job Template"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Job Title</label>
            <input 
              type="text" 
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="w-full rounded-xl border border-violet-100 bg-cream-50 p-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400" 
              placeholder="e.g. Senior Frontend Engineer" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/70">Description</label>
            <textarea 
              rows={3} 
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-violet-100 bg-cream-50 p-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400" 
              placeholder="Paste the job requirements..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-violet-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveTemplate}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
            >
              Save Template
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
