import type { StudyResult } from "../types";

type FilterType = "All" | "High" | "Moderate" | "Low";
export type SortType = "composite" | "relevance" | "citations" | "evidence" | "journal" | "year";

interface Props {
  results: StudyResult[];
  filter: FilterType;
  sort: SortType;
  onFilterChange: (f: FilterType) => void;
  onSortChange: (s: SortType) => void;
}

const FILTERS: FilterType[] = ["All", "High", "Moderate", "Low"];

const FILTER_ACTIVE: Record<FilterType, string> = {
  All: "bg-slate-800 text-white shadow",
  High: "bg-emerald-600 text-white shadow",
  Moderate: "bg-amber-500 text-white shadow",
  Low: "bg-rose-500 text-white shadow",
};

const FILTER_INACTIVE: Record<FilterType, string> = {
  All: "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
  High: "bg-white text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50",
  Moderate: "bg-white text-amber-700 border border-amber-200 hover:border-amber-300 hover:bg-amber-50",
  Low: "bg-white text-rose-700 border border-rose-200 hover:border-rose-300 hover:bg-rose-50",
};

export default function FilterBar({ results, filter, sort, onFilterChange, onSortChange }: Props) {
  const counts: Record<FilterType, number> = {
    All: results.length,
    High: results.filter((r) => r.evidenceLevel === "High").length,
    Moderate: results.filter((r) => r.evidenceLevel === "Moderate").length,
    Low: results.filter((r) => r.evidenceLevel === "Low").length,
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${filter === f ? FILTER_ACTIVE[f] : FILTER_INACTIVE[f]}`}
          >
            {f} <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortType)}
        className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer shadow-sm"
      >
        <option value="composite">Sort: Best Match</option>
        <option value="relevance">Sort: Relevance</option>
        <option value="citations">Sort: Most Cited</option>
        <option value="evidence">Sort: Evidence Level</option>
        <option value="journal">Sort: Journal Quality</option>
        <option value="year">Sort: Most Recent</option>
      </select>
    </div>
  );
}
