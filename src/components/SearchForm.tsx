import { useState } from "react";
import { Search, FlaskConical, Leaf } from "lucide-react";

interface Props {
  onSearch: (drug: string, herb: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [drug, setDrug] = useState("");
  const [herb, setHerb] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (drug.trim() && herb.trim()) onSearch(drug.trim(), herb.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            <FlaskConical size={15} className="text-blue-500" />
            Drug Name
          </label>
          <input
            type="text"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
            placeholder="Enter any drug name…"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            <Leaf size={15} className="text-emerald-500" />
            Herb Name
          </label>
          <input
            type="text"
            value={herb}
            onChange={(e) => setHerb(e.target.value)}
            placeholder="Enter any herb name…"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !drug.trim() || !herb.trim()}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Searching…
          </>
        ) : (
          <>
            <Search size={18} />
            Search Scientific Literature
          </>
        )}
      </button>
    </form>
  );
}
