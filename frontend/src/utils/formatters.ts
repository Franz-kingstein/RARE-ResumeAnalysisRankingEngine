/** Convert a 0-1 score to a rounded percentage string (e.g. 0.95 → "95%"). */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/** Format bytes to KB or MB string. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Sleep for the given number of milliseconds (async utility). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
