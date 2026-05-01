import { ExternalLink, BookOpen, ChevronDown, ChevronUp, Users, Calendar, Quote, Copy, Check, TrendingUp, AlertTriangle, Link2 } from "lucide-react";
import { useState } from "react";
import type { StudyResult } from "../types";

interface Props {
  study: StudyResult;
  index: number;
}

const EVIDENCE_STYLES: Record<string, string> = {
  High: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Moderate: "bg-amber-100 text-amber-800 border border-amber-200",
  Low: "bg-rose-100 text-rose-800 border border-rose-200",
};

const JOURNAL_STYLES: Record<string, string> = {
  "High-impact journal": "bg-blue-100 text-blue-800 border border-blue-200",
  "Medium-impact journal": "bg-sky-100 text-sky-800 border border-sky-200",
  "Low/uncertain quality": "bg-slate-100 text-slate-500 border border-slate-200",
};

const RELEVANCE_STYLES: Record<string, string> = {
  HIGH: "bg-emerald-600 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-slate-400 text-white",
};

const STUDY_TYPE_ABBR: Record<string, string> = {
  "Meta-analysis": "MA",
  "Systematic Review": "SR",
  "Randomized Controlled Trial": "RCT",
  "Cohort Study": "CS",
  "Case-Control": "CC",
  "Case Report": "CR",
  "Narrative Review": "NR",
  "Animal Study": "AS",
  "In Vitro": "IV",
  "Mechanistic Study": "MS",
};

function buildCitation(study: StudyResult): string {
  const authors = study.authors.length > 0
    ? study.authors.join(", ") + (study.authors.length >= 3 ? " et al." : "")
    : "Unknown Authors";
  const doi = study.doi ? ` DOI: ${study.doi}.` : "";
  return `${authors} "${study.title}." ${study.journal}${study.pubYear ? ` (${study.pubYear})` : ""}. PMID: ${study.pmid}.${doi}`;
}

export default function StudyCard({ study, index }: Props) {
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [fdaOpen, setFdaOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCitation(study));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasFdaWarnings = study.fdaWarnings.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        {/* Top row: index + title + open link */}
        <div className="flex items-start gap-3 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-800 font-semibold text-sm leading-snug">
              {study.title}
            </h3>
          </div>
          <a
            href={study.pubmedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
            title="Open on PubMed"
          >
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Badge row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
            PubMed #{study.pmid}
          </span>

          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${RELEVANCE_STYLES[study.relevanceLabel]}`}>
            {study.relevanceLabel} Relevance
          </span>

          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-white">
            {STUDY_TYPE_ABBR[study.studyType] ?? "??"}&nbsp;{study.studyType}
          </span>

          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${EVIDENCE_STYLES[study.evidenceLevel]}`}>
            {study.evidenceLevel} Evidence
          </span>

          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${JOURNAL_STYLES[study.journalQuality]}`}>
            {study.journalQuality}
          </span>

          {study.citationCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              <TrendingUp size={10} />
              {study.citationCount.toLocaleString()} citations
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Score {study.compositeScore}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} />
            <span className="font-medium">{study.journal || "Unknown Journal"}</span>
          </span>
          {study.pubYear && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {study.pubYear}
            </span>
          )}
          {study.authors.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              {study.authors.join(", ")}{study.authors.length >= 3 ? " et al." : ""}
            </span>
          )}
        </div>

        {/* Links row: DOI + Copy citation */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {study.doiLink && (
            <a
              href={study.doiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Link2 size={12} />
              <span className="font-mono">{study.doi}</span>
            </a>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs text-slate-600 hover:text-blue-700 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy citation"}
          </button>
        </div>

        {/* Expandable controls */}
        <div className="flex items-center gap-4">
          {study.abstract && (
            <button
              onClick={() => setAbstractOpen(!abstractOpen)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {abstractOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {abstractOpen ? "Hide abstract" : "Show abstract"}
            </button>
          )}
          {hasFdaWarnings && (
            <button
              onClick={() => setFdaOpen(!fdaOpen)}
              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
            >
              <AlertTriangle size={12} />
              {fdaOpen ? "Hide FDA data" : "Show FDA warnings"}
            </button>
          )}
        </div>
      </div>

      {/* Abstract panel */}
      {abstractOpen && study.abstract && (
        <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 pt-4 mb-2">
            <Quote size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Abstract</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{study.abstract}</p>
        </div>
      )}

      {/* FDA warnings panel */}
      {fdaOpen && hasFdaWarnings && (
        <div className="px-5 pb-5 border-t border-amber-100 bg-amber-50/40">
          <div className="flex items-center gap-1.5 pt-4 mb-2">
            <AlertTriangle size={13} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">FDA Label Data</span>
          </div>
          <div className="space-y-2">
            {study.fdaWarnings.map((w, i) => (
              <p key={i} className="text-amber-800 text-xs leading-relaxed border-l-2 border-amber-300 pl-3">{w}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
