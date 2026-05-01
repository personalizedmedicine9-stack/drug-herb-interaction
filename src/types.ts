export type EvidenceLevel = "High" | "Moderate" | "Low";
export type JournalQuality = "High-impact journal" | "Medium-impact journal" | "Low/uncertain quality";
export type RelevanceLabel = "HIGH" | "MEDIUM" | "LOW";

export interface StudyResult {
  title: string;
  source: "PubMed";
  pubmedLink: string;
  pmid: string;
  doi?: string;
  doiLink?: string;
  journal: string;
  pubYear: string;
  authors: string[];
  abstract: string;
  citationCount: number;
  studyType: string;
  evidenceLevel: EvidenceLevel;
  journalQuality: JournalQuality;
  relevanceLabel: RelevanceLabel;
  relevanceScore: number;
  compositeScore: number;
  fdaWarnings: string[];
}

export interface FdaDrugData {
  warnings: string[];
  interactions: string[];
  brandNames: string[];
}

export interface SearchResponse {
  results: StudyResult[];
  total: number;
  sourcesUsed: string[];
  fdaData: FdaDrugData | null;
  topCitationCount: number;
  fromCache: boolean;
  error?: string;
}

export interface SearchHistoryEntry {
  id: string;
  drug: string;
  herb: string;
  results_count: number;
  searched_at: string;
  sources_used: string[];
  top_citation_count: number;
  has_fda_data: boolean;
}
