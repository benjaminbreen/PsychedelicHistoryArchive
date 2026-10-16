#!/usr/bin/env python3
"""Fit model_p from Ben's decisions and re-rank the next review batch.

Contract: docs/corpus-scan/candidate-review.md §2-§5. Steps:

1. Score every candidate as rank_hits.py does (embedding relevance, LLM kind,
   novelty, feasibility).
2. Join data/corpus-scan/decisions.jsonl (latest line per candidate; a
   "clear" line removes it) to them. Reviewer year corrections
   (`corrections.year`, §4) replace catalogue and snapshot years for
   stratification; a reported wrong date is metadata, never a label.
   A decided candidate missing from the current runs falls back to its
   snapshot: the best excerpt is embedded (cached under
   data/corpus-scan/decision_emb/) and the snapshot scores are used.
3. Fit a logistic regression (ranker_model.py) on a PCA projection of the
   embedding plus relevance, kind and feasibility. Targets are add = 1,
   maybe = 0.5, no = 0. Novelty is left out on purpose, so "already known" is
   never learned as "good".
4. Report held-out AUC (5-fold, add vs no) next to the formula priority's
   AUC on the same rows, and add-rate by lane and batch, plus the reject
   reasons.
5. With at least --min-decisions decisions (or --force), set
   priority = model_p × novelty^0.5 and write the next batch (80% exploit,
   20% stratified explore, via candidates.build_queue). Otherwise the
   formula priority stays and the batch is still written.

Writes data/corpus-scan/models/<stamp>.npz and <stamp>.json (the report), the
pool data/corpus-scan/pool/<batch>.jsonl.gz and the batch.

  python train_ranker.py /tmp/cs-local --batch model-2026-10-20 --n 50
  python train_ranker.py /tmp/cs-local --report-only
"""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import sys
from pathlib import Path

import numpy as np

import candidates as C
import ranker_model as M
from postscan_common import embed_to_shards, load_shards
from rank_hits import apply_year_corrections, live_decisions, score_candidates, set_priority, write_pool

MODEL_ROOT = C.CANDIDATE_ROOT / "models"
FEATS = M.SCORE_FEATURES


def snapshot_vectors(decs: list[dict], cap: float) -> dict[str, np.ndarray]:
    """Embeddings of snapshot excerpts for decided candidates not in the current runs."""
    d = C.CANDIDATE_ROOT / "decision_emb"
    recs = [(x["candidate_id"], x["snapshot"]["best_excerpt"]) for x in decs if (x.get("snapshot") or {}).get("best_excerpt")]
    if recs:
        embed_to_shards(recs, d, cap=cap)
    ids, X = load_shards(d)
    return {i: X[n].astype(np.float32) for n, i in enumerate(ids)}


def rate_table(rows: list[dict], key) -> list[str]:
    groups = collections.defaultdict(list)
    for r in rows:
        groups[key(r)].append(r["decision"])
    out = []
    for k in sorted(groups, key=str):
        ds = collections.Counter(groups[k])
        n = sum(ds.values())
        out.append(f"  {str(k):34s} n={n:4d}  add {ds['add']:3d} ({ds['add'] / n:5.1%})  maybe {ds['maybe']:3d}  no {ds['no']:3d}")
    return out


def date_wrong_table(rows: list[dict]) -> list[str]:
    by = collections.defaultdict(lambda: [0, 0])
    for r in rows:
        k = (r.get("snapshot") or {}).get("collection") or "?"
        by[k][0] += 1
        by[k][1] += bool((r.get("corrections") or {}).get("date_wrong"))
    return [f"  {k:34s} {w:3d}/{n:<4d} ({w / n:5.1%})" for k, (n, w) in sorted(by.items(), key=lambda kv: -kv[1][1]) if w]\
        or ["  none reported"]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("runs", nargs="+", type=Path, help="scan_parquet.py output dirs")
    ap.add_argument("--emb", action="append", type=Path, help="hit embedding dir(s) (default: <run>/emb)")
    ap.add_argument("--seeds", type=Path, default=C.CANDIDATE_ROOT / "seeds")
    ap.add_argument("--decisions-root", type=Path, default=C.CANDIDATE_ROOT, help="dir holding decisions.jsonl")
    ap.add_argument("--batch", default=f"model-{dt.date.today().isoformat()}")
    ap.add_argument("--n", type=int, default=50)
    ap.add_argument("--explore-frac", type=float, default=0.2)
    ap.add_argument("--min-decisions", type=int, default=100, help="use model_p only once this many decisions exist")
    ap.add_argument("--force", action="store_true", help="use model_p even below --min-decisions")
    ap.add_argument("--pca-k", type=int, default=16)
    ap.add_argument("--l2", type=float, default=1.0)
    ap.add_argument("--junk-mode", choices=["hinge", "subtract"], default="hinge")
    ap.add_argument("--no-snapshot-fallback", action="store_true")
    ap.add_argument("--cap", type=float, default=0.5, help="spend cap for embedding snapshot excerpts")
    ap.add_argument("--report-only", action="store_true", help="fit and report; write no batch")
    args = ap.parse_args()

    emb_dirs = args.emb or [r / "emb" for r in args.runs]
    cands, V = score_candidates(args.runs, emb_dirs, args.seeds, junk_mode=args.junk_mode)
    apply_year_corrections(cands, args.decisions_root)
    idx = {c["candidate_id"]: i for i, c in enumerate(cands)}
    decisions = live_decisions(args.decisions_root)
    print(f"{len(cands):,} candidates, {len(decisions):,} decisions", flush=True)
    if not decisions:
        raise SystemExit("no decisions yet; review a batch in /admin/candidates first")

    missing = [d for d in decisions.values() if d["candidate_id"] not in idx]
    snap = {} if args.no_snapshot_fallback or not missing else snapshot_vectors(missing, args.cap)
    rows, E, F = [], [], []
    for d in decisions.values():
        if d.get("decision") not in M.LABEL:
            continue
        if d["candidate_id"] in idx:
            i = idx[d["candidate_id"]]
            vec, scores, src = V[i], cands[i]["scores"], "current"
        elif d["candidate_id"] in snap:
            vec, scores, src = snap[d["candidate_id"]], (d.get("snapshot") or {}).get("scores") or {}, "snapshot"
        else:
            continue
        rows.append({**d, "_src": src, "_formula": scores.get("priority")})
        E.append(vec)
        F.append([float(scores.get(f) if scores.get(f) is not None else 0.5) for f in FEATS])
    if len(rows) < 10:
        raise SystemExit(f"only {len(rows)} usable decisions; need at least 10 to fit")
    E, F = np.vstack(E), np.array(F)
    y = np.array([M.LABEL[r["decision"]] for r in rows])
    binary = np.isin(y, [0.0, 1.0])

    oof = M.cross_validate(V, E, F, y, k=args.pca_k, l2=args.l2)
    ok = binary & ~np.isnan(oof)
    auc_model = M.auc(y[ok].astype(int), oof[ok])
    formula = np.array([r["_formula"] if r["_formula"] is not None else np.nan for r in rows])
    okf = binary & ~np.isnan(formula)
    auc_formula = M.auc(y[okf].astype(int), formula[okf])
    model = M.train(V, E, F, y, k=args.pca_k, l2=args.l2)

    use_model = args.force or len(rows) >= args.min_decisions
    reasons = collections.Counter(r for d in rows if d["decision"] == "no" for r in d.get("reasons") or ["(none)"])
    why = collections.Counter(w for d in rows if d["decision"] in ("add", "maybe") for w in d.get("why") or [])
    fmt = lambda a: "n/a" if a is None else f"{a:.3f}"
    lines = [
        f"{len(rows)} decisions used ({sum(r['_src'] == 'snapshot' for r in rows)} from snapshots): "
        f"add {int((y == 1).sum())}, maybe {int((y == 0.5).sum())}, no {int((y == 0).sum())}",
        f"held-out AUC, add vs no: model {fmt(auc_model)} | formula priority {fmt(auc_formula)}",
        "add-rate by lane:", *rate_table(rows, lambda r: r.get("lane") or "?"),
        "add-rate by batch and lane:", *rate_table(rows, lambda r: f"{r.get('batch')} / {r.get('lane') or '?'}"),
        f"reject reasons: {dict(reasons.most_common())}",
        "date reported wrong, by collection (metadata only; not a label):", *date_wrong_table(rows),
        f"why tags: {dict(why.most_common())}",
        f"model_p {'ACTIVE' if use_model else f'not used yet (needs {args.min_decisions} decisions; --force to override)'}",
    ]
    print("\n".join(lines))

    MODEL_ROOT.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    model.save(MODEL_ROOT / f"{stamp}.npz")
    (MODEL_ROOT / f"{stamp}.json").write_text(json.dumps({
        "created_at": stamp, "n_decisions": len(rows), "auc_model": auc_model, "auc_formula": auc_formula,
        "active": use_model, "pca_k": args.pca_k, "l2": args.l2, "features": FEATS, "junk_mode": args.junk_mode,
        "source_runs": [str(r) for r in args.runs], "report": lines}, indent=1))
    print(f"model -> {MODEL_ROOT / stamp}.npz")
    if args.report_only:
        return 0

    p = model.predict(V, np.array([[c["scores"][f] for f in FEATS] for c in cands]))
    for c, pi in zip(cands, p):
        c["scores"]["model_p_shadow"] = round(float(pi), 4)
        if use_model:
            c["scores"]["model_p"] = round(float(pi), 4)
        set_priority(c)
    pool = write_pool(args.batch, cands)
    queue = C.build_queue(cands, decisions, n=args.n, explore_frac=args.explore_frac)
    out = C.write_batch(args.batch, queue, {
        "source_runs": [str(r) for r in args.runs], "scoring": "model" if use_model else "embedding",
        "model": f"{stamp}.npz", "notes": f"held-out AUC model {fmt(auc_model)} vs formula {fmt(auc_formula)} "
                                         f"on {len(rows)} decisions; pool {pool.name}"})
    print(f"batch of {len(queue)} ({sum(c['lane'] == 'explore' for c in queue)} explore) -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
