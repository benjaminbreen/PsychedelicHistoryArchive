import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Candidate, CandidateBatchSummary, CandidateDecision } from "@/lib/corpus-candidate-types";
import { getAdminSupabaseClient } from "@/lib/admin-cms";

// File-backed, like /admin/qa: batches are written by scripts/corpus_scan/*,
// decisions are appended here and read back by the ranking scripts.
const ROOT = path.resolve(process.cwd(), "..");
const SCAN_DIR = path.join(ROOT, "data", "corpus-scan");
const BATCH_DIR = path.join(SCAN_DIR, "candidates");
const DECISIONS_FILE = path.join(SCAN_DIR, "decisions.jsonl");
const BATCH_NAME = /^[A-Za-z0-9._-]+$/;

export const sharedCandidateQueue = process.env.NODE_ENV === "production";

export function candidateClient() {
  const client = getAdminSupabaseClient();
  if (!client) throw new Error("Connect Supabase to use the shared review queue.");
  return client;
}

export async function listCandidateBatches(): Promise<CandidateBatchSummary[]> {
  if (sharedCandidateQueue) {
    const { data, error } = await candidateClient().from("corpus_candidate_batches").select("summary").order("batch");
    if (error) throw new Error(error.message);
    return (data || []).map(row => row.summary as CandidateBatchSummary).sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  }
  if (!fs.existsSync(BATCH_DIR)) return [];
  return fs.readdirSync(BATCH_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && BATCH_NAME.test(entry.name) && fs.existsSync(path.join(BATCH_DIR, entry.name, "candidates.jsonl")))
    .map(entry => {
      try { return { batch: entry.name, ...JSON.parse(fs.readFileSync(path.join(BATCH_DIR, entry.name, "batch.json"), "utf8")) } as CandidateBatchSummary; }
      catch { return { batch: entry.name, n: 0 }; }
    })
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

export async function readCandidateBatch(batch: string): Promise<Candidate[]> {
  if (!BATCH_NAME.test(batch)) return [];
  if (sharedCandidateQueue) {
    const rows: Candidate[] = [];
    for (let from = 0; ; from += 500) {
      const { data, error } = await candidateClient().from("corpus_candidates").select("payload").eq("batch", batch).order("rank").order("candidate_id").range(from, from + 499);
      if (error) throw new Error(error.message);
      rows.push(...(data || []).map(row => row.payload as Candidate));
      if (!data || data.length < 500) return rows;
    }
  }
  const file = path.join(BATCH_DIR, batch, "candidates.jsonl");
  if (!fs.existsSync(file)) return [];
  return readJsonl<Candidate>(file).sort((a, b) => a.rank - b.rank);
}

/** Latest decision per candidate; a "clear" decision returns the card to the queue. */
export async function readCandidateDecisions(): Promise<Map<string, CandidateDecision>> {
  const latest = new Map<string, CandidateDecision>();
  if (sharedCandidateQueue) {
    for (let from = 0; ; from += 500) {
      const { data, error } = await candidateClient().from("corpus_candidate_decisions").select("payload").order("id").range(from, from + 499);
      if (error) throw new Error(error.message);
      for (const row of data || []) {
        const decision = row.payload as CandidateDecision;
        if (decision.decision === "clear") latest.delete(decision.candidate_id);
        else latest.set(decision.candidate_id, decision);
      }
      if (!data || data.length < 500) return latest;
    }
  }
  if (!fs.existsSync(DECISIONS_FILE)) return latest;
  for (const decision of readJsonl<CandidateDecision>(DECISIONS_FILE)) {
    if (decision.decision === "clear") latest.delete(decision.candidate_id);
    else latest.set(decision.candidate_id, decision);
  }
  return latest;
}

export async function appendCandidateDecision(record: CandidateDecision & { snapshot?: unknown }) {
  if (sharedCandidateQueue) {
    const { error } = await candidateClient().from("corpus_candidate_decisions").insert({ candidate_id: record.candidate_id, batch: record.batch, payload: record });
    if (error) throw new Error(error.message);
    return;
  }
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
