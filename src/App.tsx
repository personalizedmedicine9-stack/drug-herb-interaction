import { useState, useEffect, useCallback } from "react";
import { Microscope, Database, AlertTriangle, Globe, Beaker, Leaf } from "lucide-react";
import SearchForm from "./components/SearchForm";
import StudyCard from "./components/StudyCard";
import ResultsSummary from "./components/ResultsSummary";
import FilterBar, { type SortType } from "./components/FilterBar";
import SearchHistory from "./components/SearchHistory";
import { supabase } from "./lib/supabase";
import type { StudyResult, SearchResponse, SearchHistoryEntry, FdaDrugData } from "./types";

type FilterType = "All" | "High" | "Moderate" | "Low";

const EVIDENCE_RANK: Record<string, number> = { High: 0, Moderate: 1, Low: 2 };
const JOURNAL_RANK: Record<string, number> = { "High-impact journal": 0, "Medium-impact journal": 1, "Low/uncertain quality": 2 };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const EXAMPLE_SEARCHES = [
  { drug: "Warfarin", herb: "St. John's Wort" },
  { drug: "Cyclosporine", herb: "Ginkgo biloba" },
  { drug: "Metformin", herb: "Ginseng" },
  { drug: "Atorvastatin", herb: "Garlic" },
  { drug: "Tacrolimus", herb: "Curcumin" },
];

const API_SOURCES = [
  { name: "PubMed", desc: "NCBI E-utilities", color: "blue" },
  { name: "CrossRef", desc: "DOI resolution", color: "cyan" },
  { name: "OpenAlex", desc: "Citation counts", color: "teal" },
  { name: "OpenFDA", desc: "Drug warnings", color: "orange" },
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([]);
  const [fdaData, setFdaData] = useState<FdaDrugData | null>(null);
  const [topCitationCount, setTopCitationCount] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [lastDrug, setLastDrug] = useState("");
  const [lastHerb, setLastHerb] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filter, setFilter] = useState<FilterType>("All");
  const [sort, setSort] = useState<SortType>("relevance");
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("search_history")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as SearchHistoryEntry[]);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSearch = async (drug: string, herb: string) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(false);
    setFilter("All");
    setSort("relevance");
    setFdaData(null);
    setSourcesUsed([]);
    setFromCache(false);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/drug-herb-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ drug, herb }),
      });

      const data: SearchResponse = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "An unexpected error occurred.");
        return;
      }

      setResults(data.results);
      setSourcesUsed(data.sourcesUsed);
      setFdaData(data.fdaData);
      setTopCitationCount(data.topCitationCount);
      setFromCache(data.fromCache ?? false);
      setLastDrug(drug);
      setLastHerb(herb);
      setHasSearched(true);

      await supabase.from("search_history").insert({
        drug,
        herb,
        results_count: data.total,
        sources_used: data.sourcesUsed,
        top_citation_count: data.topCitationCount,
        has_fda_data: !!data.fdaData,
      });
      loadHistory();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const sortedFiltered = results
    .filter((r) => filter === "All" || r.evidenceLevel === filter)
    .slice()
    .sort((a, b) => {
      switch (sort) {
        case "citations": return b.citationCount - a.citationCount;
        case "evidence": return EVIDENCE_RANK[a.evidenceLevel] - EVIDENCE_RANK[b.evidenceLevel];
        case "journal": return JOURNAL_RANK[a.journalQuality] - JOURNAL_RANK[b.journalQuality];
        case "year": return (parseInt(b.pubYear) || 0) - (parseInt(a.pubYear) || 0);
        case "relevance": return b.relevanceScore - a.relevanceScore;
        default: return b.compositeScore - a.compositeScore;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Microscope size={21} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Dr. Mahmoud Global Drug–Herb Interaction Engine</h1>
            <p className="text-slate-400 text-xs hidden sm:block">PubMed · CrossRef · OpenAlex · OpenFDA</p>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            {API_SOURCES.map((s) => (
              <span key={s.name} className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${s.color}-100 text-${s.color}-700 border border-${s.color}-200`}>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          {/* API source legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {API_SOURCES.map((s) => (
              <div key={s.name} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Database size={14} className="text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-700">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <SearchForm onSearch={handleSearch} loading={loading} />
          <SearchHistory history={history} onRerun={handleSearch} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-6">
            <AlertTriangle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && results.length > 0 && (
          <>
            <ResultsSummary
              results={results}
              drug={lastDrug}
              herb={lastHerb}
              sourcesUsed={sourcesUsed}
              fdaData={fdaData}
              topCitationCount={topCitationCount}
              fromCache={fromCache}
            />
            <FilterBar
              results={results}
              filter={filter}
              sort={sort}
              onFilterChange={setFilter}
              onSortChange={setSort}
            />
            <div className="space-y-4">
              {sortedFiltered.map((study, i) => (
                <StudyCard key={study.pmid} study={study} index={i} />
              ))}
              {sortedFiltered.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
                  No studies match the selected filter.
                </div>
              )}
            </div>
          </>
        )}

        {/* No results */}
        {hasSearched && results.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Microscope size={28} className="text-slate-400" />
            </div>
            <h3 className="text-slate-600 font-semibold mb-2">No studies found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              No published studies were found across PubMed for this combination. Try using generic drug names, Latin herb names, or alternative spellings.
            </p>
          </div>
        )}

        {/* Landing state */}
        {!hasSearched && !loading && !error && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Globe size={38} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Scientific Research Engine</h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
                Search any drug–herb combination against the global scientific literature.
                Results are enriched with DOI links from CrossRef, citation counts from OpenAlex,
                and drug warnings from OpenFDA — all ranked by relevance and evidence strength.
              </p>
            </div>

            {/* What each API provides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Database size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-800">PubMed (Primary)</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">Searches NCBI E-utilities API for peer-reviewed studies. Returns titles, abstracts, PMIDs, authors, journals and publication years. Up to 30 results per search.</p>
              </div>
              <div className="bg-white rounded-2xl border border-cyan-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
                    <Database size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-800">CrossRef (DOI)</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">Resolves Digital Object Identifiers for each study, providing permanent, citable links directly to the published paper.</p>
              </div>
              <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                    <Database size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-800">OpenAlex (Impact)</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">Fetches real-world citation counts for each study from OpenAlex's global citation graph, enabling research impact ranking.</p>
              </div>
              <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Database size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-800">OpenFDA (Safety)</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">Retrieves FDA drug label data including boxed warnings, drug interaction sections, and brand name information for the searched drug.</p>
              </div>
            </div>

            {/* Example searches */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Beaker size={14} />
                Example Searches
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {EXAMPLE_SEARCHES.map(({ drug, herb }) => (
                  <button
                    key={drug + herb}
                    onClick={() => handleSearch(drug, herb)}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Beaker size={12} className="text-blue-400" />
                        <span className="font-semibold text-slate-700 text-sm truncate">{drug}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Leaf size={12} className="text-emerald-400" />
                        <span className="text-slate-500 text-xs truncate">{herb}</span>
                      </div>
                    </div>
                    <span className="text-blue-400 text-xs font-medium group-hover:text-blue-600 flex-shrink-0">Search →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-16 py-6 text-center bg-white">
        <p className="text-slate-400 text-xs">
          © 2026 Dr. Mahmoud Mostafa — All Rights Reserved
Data sourced from PubMed (NCBI), CrossRef, OpenAlex, and OpenFDA
This tool is intended for scientific research purposes only and is not intended for clinical or medical decision-making.
        </p>
      </footer>
    </div>
  );
}
