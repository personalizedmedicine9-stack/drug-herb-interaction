import { BarChart3, CheckCircle, AlertCircle, Info, Database, TrendingUp, Shield, Zap } from "lucide-react";
import type { StudyResult, FdaDrugData } from "../types";

interface Props {
  results: StudyResult[];
  drug: string;
  herb: string;
  sourcesUsed: string[];
  fdaData: FdaDrugData | null;
  topCitationCount: number;
  fromCache: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  PubMed: "bg-blue-600 text-white",
  CrossRef: "bg-cyan-600 text-white",
  OpenAlex: "bg-teal-600 text-white",
  OpenFDA: "bg-orange-500 text-white",
};

export default function ResultsSummary({ results, drug, herb, sourcesUsed, fdaData, topCitationCount, fromCache }: Props) {
  const highCount = results.filter((r) => r.evidenceLevel === "High").length;
  const moderateCount = results.filter((r) => r.evidenceLevel === "Moderate").length;
  const lowCount = results.filter((r) => r.evidenceLevel === "Low").length;
  const highRelevance = results.filter((r) => r.relevanceLabel === "HIGH").length;
  const withDoi = results.filter((r) => r.doi).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-blue-500" />
            <span className="font-bold text-slate-800 text-base">
              {results.length} {results.length === 1 ? "study" : "studies"} found
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            <span className="font-semibold text-slate-700">{drug}</span>
            <span className="text-slate-400 mx-2">+</span>
            <span className="font-semibold text-slate-700">{herb}</span>
            <span className="text-slate-400 mx-2">•</span>
            <span>Global literature search</span>
          </p>
        </div>

        {/* Data sources used + cache badge */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {sourcesUsed.map((src) => (
            <span key={src} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${SOURCE_COLORS[src] ?? "bg-slate-500 text-white"}`}>
              <Database size={10} />
              {src}
            </span>
          ))}
          {fromCache && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              <Zap size={10} />
              Cached
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Evidence</div>
          <div className="flex gap-2 flex-wrap">
            {highCount > 0 && <span className="text-xs font-bold text-emerald-600">{highCount} High</span>}
            {moderateCount > 0 && <span className="text-xs font-bold text-amber-600">{moderateCount} Mod</span>}
            {lowCount > 0 && <span className="text-xs font-bold text-rose-500">{lowCount} Low</span>}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Relevance</div>
          <div className="text-sm font-bold text-slate-700">{highRelevance} HIGH match</div>
        </div>

        <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
          <div className="flex items-center gap-1 text-xs text-teal-500 uppercase tracking-wide font-semibold mb-1">
            <TrendingUp size={10} /> Top Citations
          </div>
          <div className="text-sm font-bold text-teal-700">{topCitationCount > 0 ? topCitationCount.toLocaleString() : "—"}</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">With DOI</div>
          <div className="text-sm font-bold text-slate-700">{withDoi} / {results.length}</div>
        </div>
      </div>

      {/* FDA brand names */}
      {fdaData && fdaData.brandNames.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold text-orange-600">
            <Shield size={12} /> FDA Brand Names:
          </span>
          {fdaData.brandNames.map((name) => (
            <span key={name} className="px-2 py-0.5 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700 font-medium">{name}</span>
          ))}
        </div>
      )}

      {/* Evidence breakdown pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {highCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle size={13} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">{highCount} High Evidence</span>
          </div>
        )}
        {moderateCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={13} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">{moderateCount} Moderate Evidence</span>
          </div>
        )}
        {lowCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl">
            <Info size={13} className="text-rose-500" />
            <span className="text-xs font-semibold text-rose-600">{lowCount} Low Evidence</span>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
        <strong>Research use only.</strong> Data sourced from PubMed (NCBI), CrossRef, OpenAlex, and OpenFDA. Results are for informational and scientific research purposes only. Do not use for clinical decision-making. Always consult a qualified healthcare professional.
      </div>
    </div>
  );
}
