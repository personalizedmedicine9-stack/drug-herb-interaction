import { Clock, FlaskConical, Leaf, ChevronRight } from "lucide-react";
import type { SearchHistoryEntry } from "../types";

interface Props {
  history: SearchHistoryEntry[];
  onRerun: (drug: string, herb: string) => void;
}

export default function SearchHistory({ history, onRerun }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        <Clock size={14} />
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {history.slice(0, 10).map((entry) => (
          <button
            key={entry.id}
            onClick={() => onRerun(entry.drug, entry.herb)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-sm text-slate-600 transition-all shadow-sm group"
          >
            <FlaskConical size={12} className="text-blue-400" />
            <span className="font-medium">{entry.drug}</span>
            <span className="text-slate-300">+</span>
            <Leaf size={12} className="text-emerald-400" />
            <span className="font-medium">{entry.herb}</span>
            <span className="text-slate-400 text-xs">({entry.results_count})</span>
            <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
