export type SearchMode = "best" | "keyword" | "semantic";

export type SearchMatchSummary = {
  href?: string;
  label: string;
  mode: SearchMode;
  score?: number;
  snippet?: string;
};

export function parseSearchMode(value?: string): SearchMode {
  if (value === "best" || value === "hybrid") return "best";
  if (value === "keyword") return "keyword";
  if (value === "word") return "keyword";
  if (value === "semantic" || value === "concept") return "semantic";
  return "best";
}

export function searchModeParam(mode: SearchMode) {
  return mode === "best" ? undefined : mode;
}
