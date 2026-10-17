import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createDraft, getSource, saveDraft } from "@/lib/cms/repository";
import type { Proposal, SourceEditModel } from "@/lib/cms/model";
import { readCandidateDecisions } from "@/lib/corpus-candidates";
import type { CandidateDecision } from "@/lib/corpus-candidate-types";

// Bridge from the local scan review to the shared workspace: every add / maybe
// decision becomes a private draft marked as a proposal, once. A cleaned-up
// nomination in data/draft-sources (scripts/corpus_scan/nominate.py) is used when
// one exists; otherwise the proposal is built from the decision snapshot.
const ROOT = path.resolve(process.cwd(), "..");
const SCAN = path.join(ROOT, "data", "corpus-scan");
const SENT = path.join(SCAN, "workspace.jsonl");
const DRAFTS = path.join(ROOT, "data", "draft-sources", "sources");

type Snapshot = { title?: string | null; creator?: string | null; year?: number | null; language?: string | null; collection: string; dataset?: string; revision?: string | null; identifier: string; source_url?: string | null; best_excerpt?: string; llm?: { pitch?: string; archive_fit?: number; kind?: string } | null };
type Decision = CandidateDecision & { snapshot?: Snapshot };
type DraftFile = { slug: string; title: string; author: string; year: number | null; displayDate: string; type: string; language: string; summary: string; excerpt: string; citation: string; rights: string; sourceUrl: string; draft: { rationale: string; status: string; corpusScan?: { candidate_id: string } } };
export type PendingNomination = { candidateId: string; title: string; year: number | null; decision: string };

function readJsonl<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).flatMap(line => { try { return [JSON.parse(line) as T]; } catch { return []; } });
}

function sentIds() {
  return new Set(readJsonl<{ candidate_id: string }>(SENT).map(r => r.candidate_id));
}

function draftFiles(): Map<string, DraftFile> {
  const byCandidate = new Map<string, DraftFile>();
  for (const n of readJsonl<{ candidate_id: string; slug: string }>(path.join(SCAN, "nominations.jsonl"))) {
    const file = path.join(DRAFTS, `${n.slug}.json`);
    if (!/^[a-z0-9-]+$/.test(n.slug) || !fs.existsSync(file)) continue;
    try { byCandidate.set(n.candidate_id, JSON.parse(fs.readFileSync(file, "utf8"))); } catch { /* skip unreadable draft */ }
  }
  return byCandidate;
}

function latestPitches() {
  const out = new Map<string, { pitch?: string; archive_fit?: number; kind?: string }>();
  for (const r of readJsonl<{ candidate_id: string; llm: { pitch?: string; archive_fit?: number; kind?: string } }>(path.join(SCAN, "llm.jsonl"))) out.set(r.candidate_id, r.llm);
  return out;
}

export function pendingNominations(): PendingNomination[] {
  const sent = sentIds();
  const files = draftFiles();
  return [...readCandidateDecisions().values()]
    .filter(d => (d.decision === "add" || d.decision === "maybe") && !sent.has(d.candidate_id) && (d as Decision).snapshot)
    .map(d => {
      const snap = (d as Decision).snapshot!;
      const file = files.get(d.candidate_id);
      return { candidateId: d.candidate_id, title: file?.title || snap.title || snap.identifier, year: file?.year ?? d.corrections?.year ?? snap.year ?? null, decision: d.decision };
    });
}

// Scan windows are centred on the hit: keep the middle, trimmed to sentence or word edges.
function middleOf(raw: string, limit = 520) {
  const text = raw.split(/\s+/).join(" ");
  if (text.length <= limit) return text;
  let lo = Math.max(0, Math.floor(text.length / 2 - limit / 2));
  let hi = Math.min(text.length, Math.floor(text.length / 2 + limit / 2));
  const startDot = text.indexOf(". ", lo);
  lo = startDot >= 0 && startDot < lo + 160 ? startDot + 2 : text.indexOf(" ", lo) + 1;
  const endDot = text.lastIndexOf(". ", hi);
  hi = endDot > hi - 160 ? endDot + 1 : text.lastIndexOf(" ", hi);
  const s = text.slice(lo, hi).trim();
  return `${lo > 0 ? "… " : ""}${s}${s.endsWith(".") ? "" : " …"}`;
}

const cleanCreator = (raw?: string | null) => {
  const first = (raw || "").split("|")[0].split(";")[0].replace(/\s*\([^)]*\)/g, "").replace(/,?\s*(?:d\.\s*)?\d{3,4}\??-?(?:\d{3,4})?\??\.?/g, "").replace(/,?\s*n\s*\d+/g, "").trim().replace(/^[ ,.;]+|[ ,.;]+$/g, "");
  return /[A-Za-z]/.test(first) ? first : "";
};

function proposalFor(d: Decision, file: DraftFile | undefined, llm: { pitch?: string; archive_fit?: number; kind?: string } | undefined) {
  const snap = d.snapshot!;
  const pitch = llm?.pitch || snap.llm?.pitch || "";
  const year = file?.year ?? d.corrections?.year ?? snap.year ?? null;
  const author = file ? (file.author === "Unknown" ? "" : file.author) : cleanCreator(snap.creator);
  const lead = /^lead:/i.test(pitch) || /\b(trace|check|original|fuller)\b/i.test(d.note || "");
  const rationale = file?.draft.rationale || [lead ? "Lead: trace the full source before drafting a transcript." : "", d.decision === "maybe" ? "Marked maybe in scan review." : "", pitch, d.note ? `Editor note: ${d.note}` : ""].filter(Boolean).join(" ");
  const proposal: Proposal = {
    status: "proposed", origin: "corpus-scan", rationale,
    excerpt: file?.excerpt || middleOf(snap.best_excerpt || ""),
    provenance: { candidate_id: d.candidate_id, decision: d.decision, collection: snap.collection, identifier: snap.identifier, dataset: snap.dataset || null, revision: snap.revision || null, archive_fit: llm?.archive_fit ?? snap.llm?.archive_fit ?? null },
  };
  const newspaper = /Newspapers|Europeana|Zeitungsportal|Anno/.test(snap.collection);
  const document = {
    title: file?.title || snap.title || `Untitled item (${snap.collection} ${snap.identifier})`,
    display_date: year ? String(year) : "", date_start: year,
    document_type: file?.type || (newspaper ? "Newspaper Article" : "Book"), medium: "Text",
    language: file?.language && file.language !== "To be determined" ? file.language : snap.language || "",
    summary: (file?.summary && file.summary !== "To be determined" ? file.summary : pitch.replace(/^lead:\s*/i, "")) || "",
    citation: file?.citation || "", rights_statement: file?.rights || "Public domain (per Common Corpus); confirm before hosting",
    source_url: file?.sourceUrl || snap.source_url || "", access_type: "external", hosting_status: "external_link",
  };
  const notes = [
    "Proposed from the Common Corpus scan. Only the ~300-word OCR excerpt below has been seen; fetch and check the full text before writing a transcript.",
    year ? "" : "Date unknown: find it from the original.",
    file ? `Staged draft: data/draft-sources/sources/${file.slug}.json` : "",
    `Scan excerpt:\n${snap.best_excerpt || ""}`,
  ].filter(Boolean).join("\n\n");
  return { document, proposal, author, notes };
}

/** Create one private, proposed draft per unsent add/maybe decision. */
export async function sendNominationsToWorkspace(limit = 200) {
  const sent = sentIds();
  const files = draftFiles();
  const pitches = latestPitches();
  const results: Array<{ candidateId: string; id?: string; error?: string }> = [];
  const todo = [...readCandidateDecisions().values()].filter(d => (d.decision === "add" || d.decision === "maybe") && !sent.has(d.candidate_id) && (d as Decision).snapshot).slice(0, limit) as Decision[];
  for (const d of todo) {
    try {
      const { document, proposal, author, notes } = proposalFor(d, files.get(d.candidate_id), pitches.get(d.candidate_id));
      const id = await createDraft(String(document.title), String(document.source_url));
      const source = await getSource(id);
      if (!source) throw new Error("The new draft could not be read back.");
      const model: SourceEditModel = {
        ...source.model,
        document: { ...source.model.document, ...document },
        people: author ? [{ name: author, role: "author" }] : [],
        editorNotes: notes,
        proposal,
      };
      await saveDraft(id, model, source.version);
      fs.appendFileSync(SENT, `${JSON.stringify({ candidate_id: d.candidate_id, document_id: id, sent_at: new Date().toISOString() })}\n`, "utf8");
      results.push({ candidateId: d.candidate_id, id });
    } catch (error) {
      results.push({ candidateId: d.candidate_id, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return results;
}
