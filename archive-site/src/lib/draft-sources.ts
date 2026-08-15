import fs from "node:fs";
import path from "node:path";
import type { SourceCreator, SourceType } from "@/lib/types";

export type DraftReviewStatus = "unreviewed" | "accepted" | "rejected" | "hold";
export type DraftStatus = "proposed" | "verified" | "needs-work" | "rejected";
export type DraftConfidence = "high" | "medium" | "low";

export type DraftTextSource = {
  url?: string;
  kind?: string;
  fetchedOn?: string;
  rawFile?: string;
  scope?: string;
};

export type DraftTextQuality = {
  ocrPass?: "none" | "haiku-corrected" | "hand-checked";
  confidence?: DraftConfidence;
  notes?: string;
  uncertainReadings?: string[];
};

export type DraftMeta = {
  status?: DraftStatus;
  proposedBy?: string;
  proposedOn?: string;
  bucket?: string;
  rationale?: string;
  textSource?: DraftTextSource;
  textQuality?: DraftTextQuality;
  duplicateCheck?: string;
  importedOn?: string;
  reviewStatus?: DraftReviewStatus;
  reviewNote?: string;
  reviewedOn?: string;
};

export type DraftSource = {
  slug: string;
  title: string;
  shortTitle?: string;
  subtitle?: string;
  author: string;
  creators?: SourceCreator[];
  year: number;
  displayDate: string;
  type: SourceType;
  medium: string;
  era: string;
  region: string;
  language: string;
  contentLanguage?: string;
  substances: string[];
  people?: string[];
  tags?: string[];
  summary: string;
  excerpt?: string;
  citation: string;
  rights: string;
  sourceUrl: string;
  accessType: "hosted" | "external" | "metadata_only";
  hostingStatus?: string;
  readerMode?: string;
  transcript?: string;
  translationText?: string;
  translationLanguage?: string;
  translationProvider?: string;
  translationNote?: string;
  wordCount?: number;
  draft: DraftMeta;
};

export type DraftSourceRecord = DraftSource & {
  file: string;
  transcriptWords: number;
  rawFileExists: boolean;
  issues: string[];
};

const ROOT = path.resolve(process.cwd(), "..");
const DRAFT_DIR = path.join(ROOT, "data", "draft-sources");
const SOURCES_DIR = path.join(DRAFT_DIR, "sources");

export function draftSourcesDirectory() {
  return SOURCES_DIR;
}

export function listDraftSources(): DraftSourceRecord[] {
  if (!fs.existsSync(SOURCES_DIR)) return [];
  const records: DraftSourceRecord[] = [];

  for (const file of fs.readdirSync(SOURCES_DIR).filter((name) => name.endsWith(".json")).sort()) {
    const full = path.join(SOURCES_DIR, file);
    let parsed: DraftSource;
    try {
      parsed = JSON.parse(fs.readFileSync(full, "utf8")) as DraftSource;
    } catch {
      continue;
    }
    records.push(decorate(parsed, file));
  }

  return records.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
}

/** Files that failed to parse. Skipping them silently would hide a broken draft entirely. */
export function listBrokenDraftFiles(): Array<{ file: string; error: string }> {
  if (!fs.existsSync(SOURCES_DIR)) return [];
  const broken: Array<{ file: string; error: string }> = [];

  for (const file of fs.readdirSync(SOURCES_DIR).filter((name) => name.endsWith(".json")).sort()) {
    try {
      JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, file), "utf8"));
    } catch (error) {
      broken.push({ file, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return broken;
}

export function getDraftSource(slug: string): DraftSourceRecord | null {
  const file = `${slug}.json`;
  const full = path.join(SOURCES_DIR, file);
  if (!fs.existsSync(full)) return null;
  try {
    return decorate(JSON.parse(fs.readFileSync(full, "utf8")) as DraftSource, file);
  } catch {
    return null;
  }
}

export function readDraftRawText(rawFile: string, limit = 20_000): string | null {
  // rawFile is recorded relative to data/draft-sources; refuse anything that escapes it.
  const full = path.resolve(DRAFT_DIR, rawFile);
  if (!full.startsWith(DRAFT_DIR + path.sep) || !fs.existsSync(full)) return null;
  const text = fs.readFileSync(full, "utf8");
  return text.length > limit ? `${text.slice(0, limit)}\n\n[…raw file truncated for display…]` : text;
}

export function writeDraftReview(slug: string, reviewStatus: DraftReviewStatus, reviewNote: string) {
  const full = path.join(SOURCES_DIR, `${slug}.json`);
  if (!fs.existsSync(full)) throw new Error(`No draft named ${slug}`);
  const data = JSON.parse(fs.readFileSync(full, "utf8")) as DraftSource;
  data.draft = {
    ...data.draft,
    reviewStatus,
    reviewNote: reviewNote.trim(),
    reviewedOn: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export type DraftFacets = {
  total: number;
  byReview: Record<DraftReviewStatus, number>;
  byAccess: Record<string, number>;
  byEra: Record<string, number>;
  byConfidence: Record<string, number>;
  substances: Array<{ name: string; count: number }>;
  hostedWords: number;
  flagged: number;
};

export function summarizeDrafts(records: DraftSourceRecord[]): DraftFacets {
  const byReview: Record<DraftReviewStatus, number> = { unreviewed: 0, accepted: 0, rejected: 0, hold: 0 };
  const byAccess: Record<string, number> = {};
  const byEra: Record<string, number> = {};
  const byConfidence: Record<string, number> = {};
  const substances = new Map<string, number>();
  let hostedWords = 0;

  for (const record of records) {
    byReview[reviewStatusOf(record)] += 1;
    byAccess[record.accessType] = (byAccess[record.accessType] ?? 0) + 1;
    byEra[record.era] = (byEra[record.era] ?? 0) + 1;
    const confidence = record.draft?.textQuality?.confidence ?? "unrecorded";
    byConfidence[confidence] = (byConfidence[confidence] ?? 0) + 1;
    for (const substance of record.substances ?? []) {
      substances.set(substance, (substances.get(substance) ?? 0) + 1);
    }
    if (record.accessType === "hosted") hostedWords += record.transcriptWords;
  }

  return {
    total: records.length,
    byReview,
    byAccess,
    byEra,
    byConfidence,
    substances: [...substances.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    hostedWords,
    flagged: records.filter((record) => record.issues.length > 0).length,
  };
}

export function reviewStatusOf(record: DraftSourceRecord): DraftReviewStatus {
  const status = record.draft?.reviewStatus;
  return status === "accepted" || status === "rejected" || status === "hold" ? status : "unreviewed";
}

export const ERA_ORDER = ["Pre-1800", "1800-1950", "1950-1970", "1970-2000", "2000-Present"];

function decorate(draft: DraftSource, file: string): DraftSourceRecord {
  const transcript = typeof draft.transcript === "string" ? draft.transcript : "";
  const transcriptWords = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const rawFile = draft.draft?.textSource?.rawFile;
  const rawFileExists = Boolean(rawFile && fs.existsSync(path.resolve(DRAFT_DIR, rawFile)));

  const issues: string[] = [];
  if (draft.accessType === "hosted" && transcriptWords < 250) issues.push("Hosted draft with little or no transcript");
  if (draft.accessType === "hosted" && !rawFileExists) issues.push("No raw fetched text on disk to check the transcript against");
  if (draft.draft?.textQuality?.confidence === "low") issues.push("Text quality marked low");
  if (draft.accessType === "hosted" && draft.draft?.textQuality?.ocrPass === "none") issues.push("No correction pass recorded");
  if (!draft.draft?.textSource?.url) issues.push("No fetch URL recorded");
  if (draft.year >= 1930 && draft.accessType === "hosted" && !/government|public domain|no.?renewal|not renewed/i.test(draft.rights ?? "")) {
    issues.push("Post-1930 text hosted in full — check rights");
  }

  return { ...draft, file, transcriptWords, rawFileExists, issues };
}
