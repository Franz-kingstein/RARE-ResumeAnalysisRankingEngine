import { Calendar, Download } from "lucide-react";

export default function AnalyticsHeader() {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Reports &amp; Analytics
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Comprehensive hiring intelligence and talent insights.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink/70 hover:bg-violet-50">
          <Calendar size={15} />
          Last 30 days
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-violet-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-violet-600">
          <Download size={15} />
          Export Report
        </button>
      </div>
    </div>
  );
}
