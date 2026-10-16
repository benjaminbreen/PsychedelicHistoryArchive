import { CandidateReview } from "@/components/admin/candidate-review";
import { listCandidateBatches, readCandidateBatch, readCandidateDecisions } from "@/lib/corpus-candidates";

export const dynamic = "force-dynamic";

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  const batches = listCandidateBatches();
  const batch = (await searchParams).batch || batches[0]?.batch;
  if (!batch) {
    return <><div className="cms-heading"><div><h1>Candidates</h1><p>Sources surfaced by the Common Corpus scan, ranked for review.</p></div></div><div className="cms-card"><h2>No candidate batches yet</h2><p>Build one from a scan run with <code>python scripts/corpus_scan/bootstrap_candidates.py &lt;run-dir&gt; --batch &lt;name&gt;</code>, then reload. See <code>docs/corpus-scan/candidate-review.md</code>.</p></div></>;
  }
  const candidates = readCandidateBatch(batch);
  const decisions = Object.fromEntries(readCandidateDecisions());
  return <CandidateReview batch={batch} batches={batches} candidates={candidates} initialDecisions={decisions} />;
}
