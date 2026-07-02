/**
 * Single source-of-truth for file types accepted by the Resume Embedding Pipeline.
 *
 * Keep this list in sync with the Flask backend's ALLOWED_EXTENSIONS so that
 * frontend validation always matches what the backend will accept.
 */

export const SUPPORTED_EXTENSIONS = [
  ".json",
  ".jsonl",
  ".pdf",
  ".md",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".bmp",
  ".tiff",
] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

/** Lowercase set for O(1) membership checks. */
export const SUPPORTED_EXT_SET = new Set<string>(SUPPORTED_EXTENSIONS);

/** Accept string for &lt;input type="file"&gt; */
export const ACCEPT_ATTR = SUPPORTED_EXTENSIONS.join(",");

/** Human-readable label mapping used in the upload summary. */
export const EXT_GROUP_LABELS: Record<string, string> = {
  ".pdf":  "PDF",
  ".json": "JSON",
  ".jsonl":"JSONL",
  ".md":   "Markdown",
  ".txt":  "Text",
  ".png":  "Images",
  ".jpg":  "Images",
  ".jpeg": "Images",
  ".bmp":  "Images",
  ".tiff": "Images",
};

/** Returns true when the file's extension is in the supported set. */
export function isSupportedFile(filename: string): boolean {
  const ext = "." + (filename.split(".").pop()?.toLowerCase() ?? "");
  return SUPPORTED_EXT_SET.has(ext);
}

/** Returns the raw lowercase extension (with leading dot). */
export function getExtension(filename: string): string {
  return "." + (filename.split(".").pop()?.toLowerCase() ?? "");
}
