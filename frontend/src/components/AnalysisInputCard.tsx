import { useRef, useState, useCallback } from "react";
import {
  Sparkles, FolderInput, HardDriveDownload, Zap, CheckCircle,
  FileText, Loader2, AlertCircle, RotateCcw, X, Trash2, HardDrive,
  FileJson, FileImage, FileCode2, File, UploadCloud, AlertTriangle,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useAnalysis } from "../hooks/useAnalysis";
import { ProgressSteps } from "./ui/ProgressSteps";
import GoogleDriveModal from "./GoogleDriveModal";
import type { UploadedFile } from "../types";
import { cn } from "../utils/cn";
import {
  ACCEPT_ATTR,
  isSupportedFile,
  getExtension,
} from "../utils/supportedExtensions";

// ─── Constants ────────────────────────────────────────────────────────────────

const JOB_META = {
  title: "Senior AI Engineer",
  subtitle: "Resume Embedding Pipeline",
  requiredSkills: ["Python", "FastAPI", "PyTorch", "ONNX Runtime", "Vector Embeddings", "Pydantic", "Qdrant", "Docker"],
  modules: ["config.py", "input.py", "io.py", "model.py", "pipeline.py", "main.py"],
};

// Ordered display groups for the upload summary
const SUMMARY_GROUPS: { label: string; exts: string[] }[] = [
  { label: "PDF",      exts: [".pdf"] },
  { label: "JSON",     exts: [".json"] },
  { label: "JSONL",    exts: [".jsonl"] },
  { label: "Markdown", exts: [".md"] },
  { label: "Text",     exts: [".txt"] },
  { label: "Images",   exts: [".png", ".jpg", ".jpeg", ".bmp", ".tiff"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatKb(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function FileIcon({ ext, size = 12 }: { ext: string; size?: number }) {
  const cls = "shrink-0";
  if (ext === ".pdf") return <FileText size={size} className={cn(cls, "text-rose-400")} />;
  if (ext === ".json" || ext === ".jsonl") return <FileJson size={size} className={cn(cls, "text-amber-400")} />;
  if (ext === ".md") return <FileCode2 size={size} className={cn(cls, "text-blue-400")} />;
  if (ext === ".txt") return <FileText size={size} className={cn(cls, "text-ink/40")} />;
  if ([".png", ".jpg", ".jpeg", ".bmp", ".tiff"].includes(ext))
    return <FileImage size={size} className={cn(cls, "text-emerald-400")} />;
  return <File size={size} className={cn(cls, "text-ink/30")} />;
}

// ─── Upload summary state ─────────────────────────────────────────────────────

interface FolderSummary {
  folderName: string;
  accepted: UploadedFile[];
  ignored: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalysisInputCard() {
  const {
    uploadedFiles,
    jobDescription,
    topCount,
    setJobDescription,
    setTopCount,
    setUploadedFiles,
    addToast,
  } = useDashboard();

  const { analysisStatus, analysisSteps, isAnalysing, hasError, startAnalysis, retryAnalysis } =
    useAnalysis();

  const [showDriveModal, setShowDriveModal] = useState(false);
  const [folderSummary, setFolderSummary] = useState<FolderSummary | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalSizeKb = uploadedFiles.reduce((s, f) => s + f.sizeKb, 0);

  // ── Core file processor ───────────────────────────────────────────────────────
  const processFiles = useCallback((rawFiles: File[]) => {
    const accepted: UploadedFile[] = [];
    const rejected: string[] = [];
    for (const f of rawFiles) {
      if (isSupportedFile(f.name)) {
        accepted.push({
          name: f.name,
          extension: getExtension(f.name),
          sizeKb: Math.max(1, Math.round(f.size / 1024)),
          file: f,
        });
      } else {
        rejected.push(f.name);
      }
    }
    return { accepted, rejected };
  }, []);

  // ── Individual file upload ────────────────────────────────────────────────────
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const { accepted, rejected } = processFiles(Array.from(fileList));

    if (rejected.length > 0 && accepted.length === 0) {
      addToast({ type: "error", title: "Unsupported file type.", message: "None of the selected files are supported." });
      return;
    }
    if (rejected.length > 0) {
      addToast({ type: "warning", title: "Unsupported file type.", message: `${rejected.length} file(s) were ignored.` });
    }
    if (accepted.length > 0) {
      const existing = new Set(uploadedFiles.map(f => f.name));
      const newFiles = accepted.filter(f => !existing.has(f.name));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      setFolderSummary(null);
      addToast({
        type: "success",
        title: `${newFiles.length} file${newFiles.length !== 1 ? "s" : ""} added`,
        message: formatKb(newFiles.reduce((s, f) => s + f.sizeKb, 0)) + " total",
      });
    }
  };

  // ── Folder upload ─────────────────────────────────────────────────────────────
  const handleFolderUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    (input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true;

    input.onchange = () => {
      const fileList = input.files;
      if (!fileList || fileList.length === 0) {
        addToast({ type: "error", title: "Empty folder", message: "No files found in the selected folder." });
        return;
      }

      const rawFiles = Array.from(fileList);
      const firstRelative = (rawFiles[0] as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
      const folderName = firstRelative.split("/")[0] || "Selected Folder";

      const { accepted, rejected } = processFiles(rawFiles);

      setUploadedFiles(accepted);
      setFolderSummary({ folderName, accepted, ignored: rejected });

      if (accepted.length === 0) {
        addToast({
          type: "warning",
          title: "No supported files",
          message: `${rejected.length} file${rejected.length !== 1 ? "s" : ""} ignored — no supported formats found.`,
        });
      } else {
        addToast({
          type: "success",
          title: `${accepted.length} file${accepted.length !== 1 ? "s" : ""} ready`,
          message: `${rejected.length} unsupported file${rejected.length !== 1 ? "s" : ""} ignored.`,
        });
      }
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 100);
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = Array.from(e.dataTransfer.files);
    if (items.length === 0) return;

    const { accepted, rejected } = processFiles(items);

    if (accepted.length === 0) {
      addToast({ type: "error", title: "Unsupported file type.", message: "No dropped files are supported by the pipeline." });
      return;
    }
    if (rejected.length > 0) {
      addToast({ type: "warning", title: "Unsupported file type.", message: `${rejected.length} dropped file(s) were ignored.` });
    }

    const existing = new Set(uploadedFiles.map(f => f.name));
    const newFiles = accepted.filter(f => !existing.has(f.name));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setFolderSummary(null);
    addToast({
      type: "success",
      title: `${newFiles.length} file${newFiles.length !== 1 ? "s" : ""} dropped`,
      message: formatKb(newFiles.reduce((s, f) => s + f.sizeKb, 0)) + " total",
    });
  };

  // ── File list actions ─────────────────────────────────────────────────────────
  const removeFile = (name: string) => {
    const next = uploadedFiles.filter(f => f.name !== name);
    setUploadedFiles(next);
    if (next.length === 0) setFolderSummary(null);
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setFolderSummary(null);
    addToast({ type: "info", title: "Files cleared", message: "Upload area is now empty." });
  };

  // ── Summary group counts ──────────────────────────────────────────────────────
  const summaryGroupCounts = SUMMARY_GROUPS.map(g => ({
    label: g.label,
    count: uploadedFiles.filter(f => g.exts.includes(f.extension)).length,
  })).filter(g => g.count > 0);

  const canAnalyse = uploadedFiles.length > 0 && jobDescription.trim().length >= 10 && !isAnalysing;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="rounded-xl2 border border-violet-100 bg-white p-6 shadow-panel">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-orchid-500" />
            <h2 className="font-display text-lg font-semibold text-ink">Analysis Input</h2>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-600">
            Active Batch
          </span>
        </div>

        {/* ── Upload section ─────────────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink/70">Upload Resumes</p>
            {uploadedFiles.length > 0 && !isAnalysing && (
              <button
                onClick={clearAllFiles}
                className="flex items-center gap-1 text-xs font-semibold text-rose-400 transition-colors hover:text-rose-600"
              >
                <Trash2 size={11} /> Clear all
              </button>
            )}
          </div>

          {/* Upload buttons */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <button
              onClick={handleFolderUpload}
              disabled={isAnalysing}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 py-6 text-ink/50 transition-colors hover:border-orchid-400 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FolderInput size={22} strokeWidth={1.75} />
              <span className="text-sm font-medium">Folder Upload</span>
            </button>
            <button
              onClick={() => setShowDriveModal(true)}
              disabled={isAnalysing}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 py-6 text-ink/50 transition-colors hover:border-orchid-400 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HardDriveDownload size={22} strokeWidth={1.75} />
              <span className="text-sm font-medium">Google Drive</span>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isAnalysing ? handleFileSelect : undefined}
            className={cn(
              "mb-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-4 text-center transition-all",
              isAnalysing && "cursor-not-allowed opacity-50",
              isDragOver
                ? "border-orchid-400 bg-orchid-50/30 scale-[1.01]"
                : "border-violet-100 bg-violet-50/20 hover:border-violet-300 hover:bg-violet-50/40",
            )}
          >
            <UploadCloud
              size={20}
              className={cn("transition-colors", isDragOver ? "text-orchid-500" : "text-violet-300")}
            />
            <p className="text-xs font-medium text-ink/50">
              {isDragOver ? "Drop files here" : "Drag & drop files or click to browse"}
            </p>
            <p className="text-[10px] text-ink/30">
              PDF · JSON · JSONL · MD · TXT · PNG · JPG · BMP · TIFF
            </p>
          </div>

          {/* File list or empty state */}
          {uploadedFiles.length > 0 ? (
            <div className="rounded-xl border border-violet-100 bg-violet-50/30">
              {/* Folder summary header */}
              {folderSummary ? (
                <div className="border-b border-violet-100 bg-violet-50/60 px-3 py-2.5">
                  <p className="mb-1 text-xs font-bold text-violet-700">
                    📁 {folderSummary.folderName}
                  </p>
                  <p className="text-[11px] font-semibold text-ink/60">
                    Supported files found:{" "}
                    <span className="text-violet-700">{folderSummary.accepted.length}</span>
                    {folderSummary.ignored.length > 0 && (
                      <>
                        {" "}·{" "}Ignored:{" "}
                        <span className="text-rose-500">{folderSummary.ignored.length}</span>
                      </>
                    )}
                  </p>
                  {summaryGroupCounts.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {summaryGroupCounts.map(g => (
                        <span
                          key={g.label}
                          className="rounded-md border border-violet-100 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-violet-600"
                        >
                          {g.label}: {g.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-violet-100 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-violet-500" />
                    <span className="text-xs font-semibold text-violet-700">
                      {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} · {formatKb(totalSizeKb)}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {summaryGroupCounts.map(g => (
                      <span key={g.label} className="text-[10px] font-medium text-ink/40">
                        {g.label}: {g.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual file rows */}
              <ul className="max-h-40 divide-y divide-violet-50 overflow-y-auto scrollbar-thin">
                {uploadedFiles.map(f => (
                  <li key={f.name} className="flex items-center gap-2 px-3 py-1.5">
                    <FileIcon ext={f.extension} size={12} />
                    <span className="flex-1 truncate text-xs text-ink/70" title={f.name}>
                      {f.name}
                    </span>
                    <span className="shrink-0 rounded bg-violet-50 px-1 py-0.5 font-mono text-[10px] font-medium uppercase text-violet-400">
                      {f.extension.replace(".", "")}
                    </span>
                    <span className="shrink-0 text-[10px] text-ink/35">{formatKb(f.sizeKb)}</span>
                    {!isAnalysing && (
                      <button
                        onClick={() => removeFile(f.name)}
                        className="ml-1 shrink-0 rounded p-0.5 text-ink/30 transition-colors hover:bg-rose-100 hover:text-rose-500"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-violet-100 bg-cream-50/50 py-6 text-center">
              <HardDrive size={20} className="mb-1.5 text-violet-200" />
              <p className="text-xs font-medium text-ink/40">No files uploaded yet</p>
              <p className="mt-0.5 text-[10px] text-ink/30">PDF · JSON · JSONL · MD · TXT · Images</p>
            </div>
          )}

          {/* Ignored files warning panel */}
          {folderSummary && folderSummary.ignored.length > 0 && (
            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-500" />
                <p className="text-xs font-bold text-amber-700">Ignored Files</p>
              </div>
              <ul className="mb-2 max-h-24 space-y-0.5 overflow-y-auto scrollbar-thin">
                {folderSummary.ignored.map(name => (
                  <li key={name} className="flex items-center gap-1.5">
                    <File size={11} className="shrink-0 text-amber-400" />
                    <span className="truncate text-[11px] text-amber-700/80" title={name}>
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] leading-relaxed text-amber-600/80">
                These file types are not supported by the Resume Embedding Pipeline.
              </p>
            </div>
          )}
        </div>

        {/* ── Job Metadata Panel ─────────────────────────────────────────────── */}
        <div className="mb-4 rounded-xl border border-violet-100 bg-cream-50/40 p-3">
          <div className="mb-2">
            <p className="text-xs font-bold text-ink">{JOB_META.title}</p>
            <p className="text-[11px] text-ink/50">{JOB_META.subtitle}</p>
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {JOB_META.requiredSkills.map(skill => (
              <span key={skill} className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {JOB_META.modules.map(mod => (
              <span
                key={mod}
                className={cn(
                  "rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium",
                  "border-orchid-200/60 bg-orchid-50/50 text-orchid-600",
                )}
              >
                {mod}
              </span>
            ))}
          </div>
        </div>

        {/* ── Job description textarea ─────────────────────────────────────── */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-ink/70">Job Requirements & Description</p>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            disabled={isAnalysing}
            placeholder="Paste the full job description here…"
            className="w-full resize-none rounded-xl border border-violet-100 bg-cream-50/60 p-3 font-mono text-xs text-ink placeholder:text-rose-300/70 focus:border-orchid-400 focus:outline-none focus:ring-2 focus:ring-orchid-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* ── Top Candidates slider ───────────────────────────────────────── */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink/70">Top Candidates to Display</p>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">
              {topCount}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={topCount}
            disabled={isAnalysing}
            onChange={e => setTopCount(Number(e.target.value))}
            className="w-full accent-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="mt-1 flex justify-between text-[11px] font-medium uppercase tracking-wide text-ink/35">
            <span>Focus</span>
            <span>Broad Review</span>
          </div>
        </div>

        {/* ── Analyse button ──────────────────────────────────────────────── */}
        {hasError ? (
          <button
            onClick={retryAnalysis}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 py-3.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            <RotateCcw size={16} />
            Retry Analysis
          </button>
        ) : (
          <button
            onClick={startAnalysis}
            disabled={!canAnalyse}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient-soft py-3.5 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-[1.005] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAnalysing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                {analysisStatus === "done" ? "Re-analyse" : "Analyse Candidates"}
              </>
            )}
          </button>
        )}

        {/* ── Progress steps / status block ──────────────────────────────── */}
        {isAnalysing ? (
          <ProgressSteps steps={analysisSteps} />
        ) : hasError ? (
          <div className="mt-5 flex gap-3 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>Analysis failed. Check your inputs and try again.</p>
          </div>
        ) : (
          <div className="mt-5 flex gap-3 rounded-xl bg-peach-300/50 p-4 text-sm text-ink/70">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-peach-500 text-[11px] font-bold text-white">
              i
            </span>
            <p>
              <span className="font-semibold text-ink">Pro Tip:</span>{" "}
              Higher score thresholds ensure better technical alignment for specialised roles like Senior AI Engineers.
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input — individual file selection with accept restriction */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden
      />

      <GoogleDriveModal isOpen={showDriveModal} onClose={() => setShowDriveModal(false)} />
    </>
  );
}
