"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Undo2, ChevronLeft, ChevronRight } from "lucide-react";
import { recordCandidateDecision } from "@/app/admin/candidates/actions";
import { NO_REASONS, WHY_TAGS, type Candidate, type CandidateBatchSummary, type CandidateDecision, type CandidateDecisionValue } from "@/lib/corpus-candidate-types";

type Draft = { reasons: string[]; why: string[]; note: string };
const REASON_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const LABELS: Record<string, string> = { add: "Add", maybe: "Maybe", no: "No" };

export function CandidateReview({ batch, batches, candidates, initialDecisions }: { batch: string; batches: CandidateBatchSummary[]; candidates: Candidate[]; initialDecisions: Record<string, CandidateDecision> }) {
  const router = useRouter();
  const [decisions, setDecisions] = useState(initialDecisions);
  const firstOpen = Math.max(0, candidates.findIndex(c => !initialDecisions[c.candidate_id]));
  const [index, setIndex] = useState(firstOpen);
  const [draft, setDraft] = useState<Draft>(() => draftFor(candidates[firstOpen], initialDecisions));
  const [error, setError] = useState("");
  const [history, setHistory] = useState<number[]>([]);
  const [pending, startTransition] = useTransition();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const card = candidates[index];

  const go = useCallback((next: number) => {
    const clamped = Math.min(candidates.length - 1, Math.max(0, next));
    setIndex(clamped);
    setDraft(draftFor(candidates[clamped], decisions));
    setError("");
  }, [candidates, decisions]);

  const decide = useCallback((value: CandidateDecisionValue, target = index, payload = draft) => {
    const item = candidates[target];
    if (!item) return;
    const record: CandidateDecision = { candidate_id: item.candidate_id, batch, decision: value, reasons: payload.reasons, why: payload.why, note: payload.note, decided_at: new Date().toISOString(), editor: "", lane: item.lane, rank: item.rank };
    const nextDecisions = { ...decisions };
    if (value === "clear") delete nextDecisions[item.candidate_id]; else nextDecisions[item.candidate_id] = record;
    setDecisions(nextDecisions);
    startTransition(async () => {
      try { await recordCandidateDecision({ batch, candidateId: item.candidate_id, decision: value, reasons: payload.reasons, why: payload.why, note: payload.note }); }
      catch (e) { setDecisions(decisions); setError(e instanceof Error ? e.message : "The decision was not saved."); }
    });
    if (value !== "clear") {
      setHistory(h => [...h, target]);
      const after = candidates.findIndex((c, i) => i > target && !nextDecisions[c.candidate_id]);
      const next = after >= 0 ? after : candidates.findIndex(c => !nextDecisions[c.candidate_id]);
      const to = next >= 0 ? next : target;
      setIndex(to);
      setDraft(draftFor(candidates[to], nextDecisions));
    } else {
      setDraft({ reasons: [], why: [], note: "" });
    }
  }, [batch, candidates, decisions, draft, index]);

  const undo = useCallback(() => {
    const last = history[history.length - 1];
    if (last === undefined) return;
    setHistory(h => h.slice(0, -1));
    const previous = decisions[candidates[last].candidate_id];
    setIndex(last);
    decide("clear", last, { reasons: [], why: [], note: "" });
    setDraft(previous ? { reasons: previous.reasons, why: previous.why, note: previous.note } : { reasons: [], why: [], note: "" });
  }, [candidates, decide, decisions, history]);

  const toggle = (field: "reasons" | "why", key: string) => setDraft(d => ({ ...d, [field]: d[field].includes(key) ? d[field].filter(k => k !== key) : [...d[field], key] }));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("textarea, input, select") || event.metaKey || event.ctrlKey || event.altKey) {
        if (event.key === "Escape") (target as HTMLElement).blur();
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "a") decide("add");
      else if (key === "m") decide("maybe");
      else if (key === "n") decide("no");
      else if (key === "z") undo();
      else if (key === "arrowright" || key === "j") go(index + 1);
      else if (key === "arrowleft" || key === "k") go(index - 1);
      else if (key === "/") { event.preventDefault(); noteRef.current?.focus(); }
      else if (REASON_KEYS.includes(key) && NO_REASONS[REASON_KEYS.indexOf(key)]) toggle("reasons", NO_REASONS[REASON_KEYS.indexOf(key)].key);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, go, index, undo]);

  const stats = useMemo(() => {
    const inBatch = candidates.map(c => decisions[c.candidate_id]).filter(Boolean) as CandidateDecision[];
    const count = (fn: (d: CandidateDecision) => boolean) => inBatch.filter(fn).length;
    const reasons = new Map<string, number>();
    inBatch.forEach(d => d.reasons.forEach(r => reasons.set(r, (reasons.get(r) || 0) + 1)));
    const lane = (name: string) => { const ds = inBatch.filter(d => d.lane === name); return ds.length ? `${Math.round(100 * ds.filter(d => d.decision === "add").length / ds.length)}% of ${ds.length}` : "–"; };
    return { done: inBatch.length, add: count(d => d.decision === "add"), maybe: count(d => d.decision === "maybe"), no: count(d => d.decision === "no"), reasons: [...reasons].sort((a, b) => b[1] - a[1]), exploit: lane("exploit"), explore: lane("explore") };
  }, [candidates, decisions]);

  if (!card) return <div className="cms-card">This batch is empty.</div>;
  const decided = decisions[card.candidate_id];

  return <div className="cms-cand">
    <div className="cms-heading">
      <div><h1>Candidates</h1><p>Common Corpus scan · {stats.done} of {candidates.length} reviewed · {stats.add} add · {stats.maybe} maybe · {stats.no} no</p></div>
      <label className="cms-cand-batch">Batch<select value={batch} onChange={e => router.push(`/admin/candidates?batch=${encodeURIComponent(e.target.value)}`)}>{batches.map(b => <option key={b.batch} value={b.batch}>{b.batch} ({b.n}{b.scoring ? `, ${b.scoring}` : ""})</option>)}</select></label>
    </div>

    <div className="cms-cand-grid">
      <aside className="cms-cand-queue" aria-label="Queue">
        {candidates.map((c, i) => { const d = decisions[c.candidate_id]; return <button key={c.candidate_id} className={`cms-cand-item${i === index ? " current" : ""}`} onClick={() => go(i)} aria-current={i === index ? "true" : undefined}>
          <span className={`cms-cand-dot ${d?.decision || "open"}`} aria-label={d ? LABELS[d.decision] : "Not reviewed"} />
          <span className="cms-cand-item-title">{c.title || c.identifier}</span>
          <span className="cms-cand-item-meta">{c.year || "n.d."}</span>
        </button>; })}
      </aside>

      <article className="cms-cand-card">
        <div className="cms-cand-nav">
          <button className="cms-quiet" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous card"><ChevronLeft size={16} /></button>
          <span>{index + 1} / {candidates.length}</span>
          <button className="cms-quiet" onClick={() => go(index + 1)} disabled={index === candidates.length - 1} aria-label="Next card"><ChevronRight size={16} /></button>
          {decided && <span className={`cms-badge cms-cand-verdict ${decided.decision}`}>Marked {LABELS[decided.decision]}</span>}
          <span className="cms-cand-lane" title={card.lane_reason}>{card.lane === "explore" ? "Explore" : "Top ranked"}</span>
        </div>

        <h2 className="cms-cand-title">{card.title || <span className="cms-cand-untitled">Untitled · {card.identifier}</span>}</h2>
        <p className="cms-cand-meta">{[card.creator, card.year || card.date || "Undated", card.language, card.collection, card.page && `p. ${card.page}`].filter(Boolean).join(" · ")}{card.source_url && <> · <a href={card.source_url} target="_blank" rel="noreferrer">Open source <ExternalLink size={12} /></a></>}</p>
        {card.llm?.pitch && <p className="cms-cand-pitch">{card.llm.pitch}</p>}

        <div className="cms-cand-chips">
          {card.terms.strong.map(t => <span key={t} className="cms-cand-chip strong">{t}</span>)}
          {card.terms.weak.map(t => <span key={t} className="cms-cand-chip">{t}</span>)}
          {card.terms.context.map(t => <span key={t} className="cms-cand-chip context">{t}</span>)}
          {card.llm?.kind && <span className="cms-cand-chip kind">{card.llm.kind.replaceAll("_", " ")}</span>}
        </div>
        {(card.novelty_flags.length > 0 || card.reprints.count > 1) && <ul className="cms-cand-flags">
          {card.novelty_flags.map(f => <li key={f.match}>{f.type === "canonical" ? "Canonical text: " : "Possibly already in archive: "}{f.match}</li>)}
          {card.reprints.count > 1 && <li>Reprinted {card.reprints.count} times; earliest shown{card.reprints.members.slice(0, 4).map(m => ` · ${m.collection} ${m.year || "n.d."}`).join("")}</li>}
        </ul>}

        {card.excerpts.map((excerpt, i) => i === 0
          ? <blockquote key={excerpt.hit_id} className="cms-cand-excerpt"><Highlighted text={excerpt.text} terms={excerpt.highlights} /></blockquote>
          : <details key={excerpt.hit_id} className="cms-cand-more"><summary>Another passage ({i + 1} of {card.excerpts.length})</summary><blockquote className="cms-cand-excerpt"><Highlighted text={excerpt.text} terms={excerpt.highlights} /></blockquote></details>)}

        <details className="cms-cand-scores"><summary>Scores and provenance</summary>
          <p>Priority {card.scores.priority.toFixed(3)}{card.scores.model_p != null && ` · model ${card.scores.model_p.toFixed(2)}`} · relevance {card.scores.relevance} · kind {card.scores.kind} · novelty {card.scores.novelty} · feasibility {card.scores.feasibility} · {card.doc_words.toLocaleString()} words · {card.lane_reason}</p>
          <p>{card.dataset}{card.revision && ` @ ${card.revision.slice(0, 10)}`} · {card.identifier}</p>
        </details>

        <div className="cms-cand-decide">
          <div className="cms-cand-buttons">
            <button className="cms-primary" onClick={() => decide("add")} disabled={pending}>Add <kbd>A</kbd></button>
            <button onClick={() => decide("maybe")} disabled={pending}>Maybe <kbd>M</kbd></button>
            <button onClick={() => decide("no")} disabled={pending}>No <kbd>N</kbd></button>
            <button className="cms-quiet" onClick={undo} disabled={!history.length || pending}><Undo2 size={15} /> Undo <kbd>Z</kbd></button>
          </div>
          <fieldset className="cms-cand-tags"><legend>Why not</legend>{NO_REASONS.map((reason, i) => <button key={reason.key} title={reason.help} aria-pressed={draft.reasons.includes(reason.key)} onClick={() => toggle("reasons", reason.key)}>{REASON_KEYS[i] && <kbd>{REASON_KEYS[i]}</kbd>}{reason.label}</button>)}</fieldset>
          <fieldset className="cms-cand-tags"><legend>Why it’s worth having</legend>{WHY_TAGS.map(tag => <button key={tag.key} aria-pressed={draft.why.includes(tag.key)} onClick={() => toggle("why", tag.key)}>{tag.label}</button>)}</fieldset>
          <label>Note <kbd>/</kbd><textarea ref={noteRef} rows={2} value={draft.note} onChange={e => setDraft(d => ({ ...d, note: e.target.value }))} placeholder="Optional: what makes this interesting, or what went wrong" /></label>
          {error && <p className="cms-error">{error}</p>}
          <p className="cms-field-help">Tag reasons first, then decide; the next unreviewed card opens. Arrow keys or J/K move between cards.</p>
        </div>

        <div className="cms-cand-stats">
          <span>Add rate: top ranked {stats.exploit} · explore {stats.explore}</span>
          {stats.reasons.length > 0 && <span>Reasons: {stats.reasons.map(([r, n]) => `${NO_REASONS.find(x => x.key === r)?.label || r} ${n}`).join(" · ")}</span>}
        </div>
      </article>
    </div>
  </div>;
}

function draftFor(card: Candidate | undefined, decisions: Record<string, CandidateDecision>): Draft {
  const d = card && decisions[card.candidate_id];
  return d ? { reasons: d.reasons, why: d.why, note: d.note } : { reasons: [], why: [], note: "" };
}

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  const usable = terms.filter(t => t.trim().length > 1);
  if (!usable.length) return <>{text}</>;
  const pattern = new RegExp(`(${usable.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "giu");
  return <>{text.split(pattern).map((part, i) => i % 2 ? <mark key={i}>{part}</mark> : part)}</>;
}
