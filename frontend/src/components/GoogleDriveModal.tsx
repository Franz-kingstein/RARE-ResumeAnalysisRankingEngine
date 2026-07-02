import { FileText, HardDriveDownload } from "lucide-react";
import { Modal } from "./ui/Modal";
import { useAppState } from "../context/AppStateContext";
import type { UploadedFile } from "../types";

const MOCK_DRIVE_FILES: { name: string; size: string }[] = [
  { name: "Alice_Johnson_Senior_SWE.pdf",        size: "184 KB" },
  { name: "Charlie_Davis_Fullstack_CV.pdf",       size: "212 KB" },
  { name: "Diana_Chen_DevOps_Resume.pdf",         size: "156 KB" },
  { name: "Ethan_Park_Backend_Engineer.docx",     size: "98 KB"  },
  { name: "Fiona_Walsh_ML_Scientist.pdf",         size: "231 KB" },
  { name: "George_Kim_Cloud_Architect.pdf",       size: "178 KB" },
  { name: "Hannah_Lee_Fullstack.docx",            size: "143 KB" },
  { name: "Ivan_Petrov_Systems_Eng.pdf",          size: "197 KB" },
  { name: "Julia_Martinez_Data_Engineer.pdf",     size: "169 KB" },
  { name: "Lena_Muller_DevSecOps.pdf",            size: "204 KB" },
];

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleDriveModal({ isOpen, onClose }: GoogleDriveModalProps) {
  const { dispatch } = useAppState();

  function handleImport() {
    const files: UploadedFile[] = MOCK_DRIVE_FILES.map((f) => ({
      name: f.name,
      extension: f.name.split(".").pop()?.toLowerCase() ?? "pdf",
      sizeKb: parseInt(f.size),
    }));

    dispatch({ type: "SET_UPLOADED_FILES", payload: files });
    dispatch({
      type: "ADD_TOAST",
      payload: {
        type: "success",
        title: `${files.length} resumes imported`,
        message: "Google Drive files loaded in demo mode.",
      },
    });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Google Drive Import">
      {/* Demo Mode badge */}
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-violet-50 px-3.5 py-2.5">
        <HardDriveDownload size={14} className="text-violet-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
          Demo Mode
        </span>
        <span className="ml-auto text-xs text-ink/40">OAuth not configured</span>
      </div>

      <p className="mb-4 text-sm text-ink/60">
        In demo mode, we simulate fetching resumes from your Google Drive.
        The following files will be loaded:
      </p>

      {/* File list */}
      <div className="mb-5 max-h-56 space-y-1.5 overflow-y-auto scrollbar-thin rounded-xl border border-violet-50 bg-cream-50/60 p-3">
        {MOCK_DRIVE_FILES.map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
          >
            <FileText size={14} className="shrink-0 text-orchid-400" />
            <span className="flex-1 truncate text-ink/70">{f.name}</span>
            <span className="shrink-0 text-xs text-ink/35">{f.size}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleImport}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient-soft py-3 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-[1.005] active:scale-[0.99]"
      >
        <HardDriveDownload size={15} />
        Import {MOCK_DRIVE_FILES.length} Resumes
      </button>
    </Modal>
  );
}
