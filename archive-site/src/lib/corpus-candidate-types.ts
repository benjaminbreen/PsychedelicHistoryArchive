// Shapes for the Common Corpus candidate queue (docs/corpus-scan/candidate-review.md).
// Shared by the server loader and the client review component.

export type CandidateDecisionValue = "add" | "maybe" | "no" | "clear";

export type CandidateExcerpt = { hit_id: string; text: string; highlights: string[]; digit_frac: number };

export type Candidate = {
  candidate_id: string;
  batch: string;
  rank: number;
  lane: "exploit" | "explore";
  lane_reason: string;
  dataset: string;
  collection: string;
  revision: string | null;
  identifier: string;
  title: string | null;
  creator: string | null;
  year: number | null;
  date: string | null;
  language: string | null;
  page: string | null;
  edition: string | null;
  doc_words: number;
  source_url: string | null;
  reprints: { count: number; members: Array<{ identifier: string; year: number | null; collection: string; source_url?: string | null }> };
  terms: { strong: string[]; weak: string[]; context: string[] };
  excerpts: CandidateExcerpt[];
  novelty_flags: Array<{ type: "canonical" | "in_archive"; match: string }>;
  scores: { relevance: number; kind: number; novelty: number; feasibility: number; model_p: number | null; priority: number };
  llm: { kind?: string; pitch?: string; substances?: string[]; ocr_quality?: string; archive_fit?: number } | null;
};

// Metadata fixes noted during review; independent of whether the source is worth adding.
export type CandidateCorrections = { date_wrong?: boolean; year?: number | null };

export type CandidateDecision = {
  candidate_id: string;
  batch: string;
  decision: CandidateDecisionValue;
  reasons: string[];
  why: string[];
  note: string;
  corrections?: CandidateCorrections;
  decided_at: string;
  editor: string;
  lane?: string;
  rank?: number;
};

export type CandidateBatchSummary = { batch: string; n: number; created_at?: string; scoring?: string };

// Why a candidate is not worth adding. Keys 1–9 and 0 toggle these in the queue.
export const NO_REASONS: Array<{ key: string; label: string; help: string }> = [
  { key: "off_topic", label: "Off topic", help: "Term matched, but the passage is about something else" },
  { key: "passing_mention", label: "Passing mention", help: "On topic, but only a sentence in passing" },
  { key: "already_in_archive", label: "Already in archive", help: "We already have this source" },
  { key: "too_well_known", label: "Too well known", help: "Canonical and covered elsewhere" },
  { key: "bad_ocr", label: "Bad OCR", help: "Too garbled to transcribe" },
  { key: "fragment", label: "Fragment", help: "Too short or incomplete to stand alone" },
  { key: "reference_or_index", label: "Reference / index", help: "Index, dictionary, price list" },
  { key: "advertisement", label: "Advertisement", help: "Advert or notice" },
  { key: "duplicate", label: "Duplicate", help: "Same text as an earlier card" },
  { key: "secondary", label: "Secondary", help: "Later scholarship about a source, not the source" },
  { key: "other", label: "Other", help: "Explain in the note" }
];

// What makes an add or maybe worth having. Clickable only.
export const WHY_TAGS: Array<{ key: string; label: string }> = [
  { key: "first_person", label: "First-person" },
  { key: "ethnographic", label: "Ethnographic" },
  { key: "policy", label: "Policy / legal" },
  { key: "clinical", label: "Clinical" },
  { key: "literary", label: "Literary" },
  { key: "visual", label: "Visual" },
  { key: "unusual_language", label: "Unusual language" },
  { key: "unusual_period", label: "Unusual period" }
];
