import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Candidate, CandidateBatchSummary, CandidateDecision } from "@/lib/corpus-candidate-types";

// File-backed, like /admin/qa: batches are written by scripts/corpus_scan/*,
// decisions are appended here and read back by the ranking scripts.
const ROOT = path.resolve(process.cwd(), "..");
const SCAN_DIR = path.join(ROOT, "data", "corpus-scan");
const BATCH_DIR = path.join(SCAN_DIR, "candidates");
const DECISIONS_FILE = path.join(SCAN_DIR, "decisions.jsonl");
const BATCH_NAME = /^[A-Za-z0-9._-]+$/;

export function listCandidateBatches(): CandidateBatchSummary[] {
  if (!fs.existsSync(BATCH_DIR)) return [];
  return fs.readdirSync(BATCH_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && BATCH_NAME.test(entry.name) && fs.existsSync(path.join(BATCH_DIR, entry.name, "candidates.jsonl")))
    .map(entry => {
      try { return { batch: entry.name, ...JSON.parse(fs.readFileSync(path.join(BATCH_DIR, entry.name, "batch.json"), "utf8")) } as CandidateBatchSummary; }
      catch { return { batch: entry.name, n: 0 }; }
    })
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

export function readCandidateBatch(batch: string): Candidate[] {
  if (!BATCH_NAME.test(batch)) return [];
  const file = path.join(BATCH_DIR, batch, "candidates.jsonl");
  if (!fs.existsSync(file)) return [];
  return readJsonl<Candidate>(file).sort((a, b) => a.rank - b.rank);
}

/** Latest decision per candidate; a "clear" decision returns the card to the queue. */
export function readCandidateDecisions(): Map<string, CandidateDecision> {
  const latest = new Map<string, CandidateDecision>();
  if (!fs.existsSync(DECISIONS_FILE)) return latest;
  for (const decision of readJsonl<CandidateDecision>(DECISIONS_FILE)) {
    if (decision.decision === "clear") latest.delete(decision.candidate_id);
    else latest.set(decision.candidate_id, decision);
  }
  return latest;
}

export function appendCandidateDecision(record: CandidateDecision & { snapshot?: unknown }) {
  fs.mkdirSync(SCAN_DIR, { recursive: true });
  fs.appendFileSync(DECISIONS_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

function readJsonl<T>(file: string): T[] {
  const rows: T[] = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line) as T); } catch { /* a torn final line from an interrupted write */ }
  }
  return rows;
}
