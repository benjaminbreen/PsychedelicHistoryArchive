"use server";
import { revalidatePath } from "next/cache";
import { sendNominationsToWorkspace } from "@/lib/corpus-nominations";
import { requireEditor } from "@/lib/cms/auth";
import { appendCandidateDecision, readCandidateBatch } from "@/lib/corpus-candidates";
import { NO_REASONS, WHY_TAGS, type CandidateCorrections, type CandidateDecision, type CandidateDecisionValue } from "@/lib/corpus-candidate-types";

const DECISIONS: CandidateDecisionValue[] = ["add", "maybe", "no", "clear"];
const REASON_KEYS = new Set(NO_REASONS.map(reason => reason.key));
const WHY_KEYS = new Set(WHY_TAGS.map(tag => tag.key));

export async function recordCandidateDecision(input: { batch: string; candidateId: string; decision: CandidateDecisionValue; reasons: string[]; why: string[]; note: string; corrections?: CandidateCorrections }) {
  const editor = await requireEditor();
  if (!DECISIONS.includes(input.decision)) throw new Error("Choose add, maybe, or no.");
  // The snapshot comes from the batch file, not the browser, so decisions stay trustworthy training data.
  const candidate = readCandidateBatch(input.batch).find(item => item.candidate_id === input.candidateId);
  if (!candidate) throw new Error("That candidate is not in this batch any more. Reload the queue.");
  const record: CandidateDecision & { snapshot?: unknown } = {
    candidate_id: candidate.candidate_id,
    batch: input.batch,
    decision: input.decision,
    reasons: input.decision === "clear" ? [] : input.reasons.filter(key => REASON_KEYS.has(key)),
    why: input.decision === "clear" ? [] : input.why.filter(key => WHY_KEYS.has(key)),
    note: input.note.trim().slice(0, 2000),
    corrections: input.decision === "clear" ? undefined : cleanCorrections(input.corrections),
    decided_at: new Date().toISOString(),
    editor: editor.name,
    lane: candidate.lane,
    rank: candidate.rank
  };
  if (input.decision !== "clear") {
    record.snapshot = {
      title: candidate.title, creator: candidate.creator, year: candidate.year, language: candidate.language,
      collection: candidate.collection, dataset: candidate.dataset, revision: candidate.revision,
      identifier: candidate.identifier, source_url: candidate.source_url, terms: candidate.terms,
      scores: candidate.scores, novelty_flags: candidate.novelty_flags, reprint_count: candidate.reprints?.count ?? 1,
      llm: candidate.llm, best_excerpt: candidate.excerpts[0]?.text ?? ""
    };
  }
  appendCandidateDecision(record);
  return { ok: true as const, decidedAt: record.decided_at };
}

function cleanCorrections(input?: CandidateCorrections): CandidateCorrections | undefined {
  if (!input) return undefined;
  const year = Number(input.year);
  const valid = Number.isInteger(year) && year >= 1000 && year <= 2100 ? year : null;
  if (!input.date_wrong && valid === null) return undefined;
  return { date_wrong: true, year: valid };
}

export async function sendToWorkspace() {
  await requireEditor();
  const results = await sendNominationsToWorkspace();
  revalidatePath("/admin/candidates");
  revalidatePath("/admin/sources");
  return { sent: results.filter(r => r.id).length, failed: results.filter(r => r.error).map(r => `${r.candidateId}: ${r.error}`) };
}
