#!/usr/bin/env python3
"""Score scan candidates with embeddings and write a review batch.

Contract: docs/corpus-scan/candidate-review.md. Candidates (one per document,
reprints clustered) come from candidates.build_candidates. This script
replaces the bootstrap relevance with an embedding one:

  sim_seed   mean of the top-5 cosines between a window and the archive seeds
  sim_junk   mean of the top-3 cosines to junk seeds (indexes, lists, adverts)
  relevance  rescaled contrast of the document's best window, where contrast is
             --junk-mode hinge (default): sim_seed - max(0, sim_junk - sim_seed)
             --junk-mode subtract:        sim_seed - sim_junk

Why hinge: junk seeds are themselves OCR'd historical text, so plain
subtraction also penalises "looks like a 19th-century scan". Against Luna's
fit >= 4 verdicts on the local test (278 items, junk-seed hits excluded),
AUC was 0.666 for sim_seed alone, 0.550 for subtract and 0.671 for hinge;
bootstrap relevance was 0.610.

kind and feasibility stay bootstrap until screen_hits.py labels a candidate
(labels are read from data/corpus-scan/llm.jsonl). novelty is the bootstrap
title/canonical check plus an embedding check: a window at least
--in-archive-sim similar to one archive seed is flagged in_archive.

  priority = relevance × kind^0.7 × novelty^0.5 × feasibility^0.3
  (with a model from train_ranker.py: priority = model_p × novelty^0.5)

Writes:
  data/corpus-scan/pool/<batch>.jsonl.gz      every scored candidate, best first,
                                              plus the hit_id of its embedding window
  data/corpus-scan/candidates/<batch>/        the review batch (candidates.write_batch)

  python rank_hits.py /tmp/cs-local --batch local-embed-2026-10-16 --n 100
"""

from __future__ import annotations

import argparse
import datetime as dt
import gzip
import json
import sys
from pathlib import Path

import numpy as np

import candidates as C
from postscan_common import load_shards, read_jsonl, write_jsonl

POOL_ROOT = C.CANDIDATE_ROOT / "pool"
LLM_PATH = C.CANDIDATE_ROOT / "llm.jsonl"

# Luna kind -> `kind` score (candidate-review.md §2)
KIND_WEIGHT = {
    "first_person_experience": 1.0, "ethnographic_observation": 0.9, "legal_or_policy": 0.8,
    "medical_or_scientific": 0.7, "literary": 0.6, "other": 0.4, "passing_mention": 0.2,
    "reference_or_index": 0.05, "commercial_or_advertisement": 0.05,
}
OCR_FACTOR = {"good": 1.0, "fair": 0.8, "poor": 0.4}

# relevance = clip((contrast - lo) / (hi - lo)). Fixed, not per-run, so scores stay comparable
# across batches. Set from the 2026-10-16 local test: hinge contrast ran from about 0.3 (lists,
# adverts, homographs) to 0.8 (close matches to archive texts); subtract from -0.1 to 0.35.
REL_RANGE = {"hinge": (0.30, 0.75), "subtract": (-0.05, 0.35)}


def topk_mean(sims: np.ndarray, k: int) -> np.ndarray:
    k = min(k, sims.shape[1])
    if k == 0:
        return np.zeros(len(sims), dtype=np.float32)
    return np.partition(sims, -k, axis=1)[:, -k:].mean(axis=1)


def load_vectors(emb_dirs: list[Path]) -> tuple[dict[str, int], np.ndarray]:
    """hit_id -> row, including duplicates resolved through dedup.tsv.gz."""
    ids, mats = [], []
    for d in emb_dirs:
        i, X = load_shards(d)
        ids += i
        mats.append(X)
    X = np.vstack(mats) if mats else np.zeros((0, 1024), np.float16)
    pos = {h: n for n, h in enumerate(ids)}
    for d in emb_dirs:
        p = d / "dedup.tsv.gz"
        if p.exists():
            with gzip.open(p, "rt") as fh:
                next(fh)
                for line in fh:
                    hid, canon, _ = line.rstrip("\n").split("\t")
                    if hid not in pos and canon in pos:
                        pos[hid] = pos[canon]
    return pos, X


def load_seeds(seed_dir: Path) -> tuple[np.ndarray, np.ndarray, list[dict]]:
    """(archive seed vectors, junk seed vectors, archive seed metadata)."""
    ids, S = load_shards(seed_dir)
    meta = {s["seed_id"]: s for s in read_jsonl(seed_dir / "seeds.jsonl")}
    keep = [n for n, i in enumerate(ids) if i in meta]  # shards can hold seeds dropped by a rebuild
    ids, S = [ids[n] for n in keep], S[keep]
    junk = np.array(["junk" in meta.get(i, {}).get("categories", []) for i in ids], dtype=bool)
    good_meta = [meta.get(i, {}) for i, j in zip(ids, junk) if not j]
    return S[~junk].astype(np.float32), S[junk].astype(np.float32), good_meta


def live_decisions(root: Path = C.CANDIDATE_ROOT) -> dict[str, dict]:
    """Latest decision per candidate, with "clear" lines removing it (as /admin/candidates does)."""
    return {k: d for k, d in C.load_decisions(root).items() if d.get("decision") != "clear"}


def load_llm(path: Path = LLM_PATH) -> dict[str, dict]:
    return {r["candidate_id"]: r["llm"] for r in read_jsonl(path)} if path.exists() else {}


def apply_llm(c: dict, llm: dict | None) -> None:
    """Fill c['llm'] and let it set `kind` and adjust `feasibility`."""
    s = c["scores"]
    s.setdefault("kind_bootstrap", s["kind"])
    s.setdefault("feasibility_bootstrap", s["feasibility"])
    c["llm"] = llm
    if llm:
        s["kind"] = KIND_WEIGHT.get(llm.get("kind"), 0.4)
        s["feasibility"] = round(max(0.05, s["feasibility_bootstrap"] * OCR_FACTOR.get(llm.get("ocr_quality"), 1.0)), 3)
    else:
        s["kind"], s["feasibility"] = s["kind_bootstrap"], s["feasibility_bootstrap"]


def set_priority(c: dict) -> None:
    s = c["scores"]
    if s.get("model_p") is not None:
        s["priority"] = round(s["model_p"] * s["novelty"] ** 0.5, 4)
    else:
        s["priority"] = round(s["relevance"] * s["kind"] ** 0.7 * s["novelty"] ** 0.5 * s["feasibility"] ** 0.3, 4)


def score_candidates(runs: list[Path], emb_dirs: list[Path], seed_dir: Path, *, k: int = 5, junk_k: int = 3,
                     in_archive_sim: float = 0.92, junk_mode: str = "hinge") -> tuple[list[dict], np.ndarray]:
    """Build and score candidates. Returns (candidates, embedding matrix aligned to them)."""
    cands = C.build_candidates(runs)
    pos, H = load_vectors(emb_dirs)
    S, J, seed_meta = load_seeds(seed_dir)
    if not len(S):
        raise SystemExit(f"no archive seed embeddings in {seed_dir}; run build_seeds.py")
    llm = load_llm()
    vecs = np.zeros((len(cands), H.shape[1] if len(H) else 1024), np.float32)
    kept = []
    n_missing = 0
    for c in cands:
        wins = [w for w in c.pop("_windows") if w["hit_id"] in pos]
        c["scores"] = C.bootstrap_scores({**c, "_windows": wins or [{"strong_terms": {}}]})
        c["scores"]["relevance_terms"] = c["scores"]["relevance"]
        if not wins:
            n_missing += 1
            continue
        W = H[[pos[w["hit_id"]] for w in wins]].astype(np.float32)
        sims = W @ S.T
        sim_seed = topk_mean(sims, k)
        sim_junk = topk_mean(W @ J.T, junk_k) if len(J) else np.zeros(len(W), np.float32)
        contrast = sim_seed - sim_junk if junk_mode == "subtract" else sim_seed - np.maximum(0, sim_junk - sim_seed)
        lo, hi = REL_RANGE[junk_mode]
        b = int(np.argmax(contrast))
        near = int(np.argmax(sims[b]))
        s = c["scores"]
        s.update(relevance=round(float(np.clip((contrast[b] - lo) / (hi - lo), 0.05, 1.0)), 3),
                 sim_seed=round(float(sim_seed[b]), 4), sim_junk=round(float(sim_junk[b]), 4))
        smax = float(sims.max())
        if smax >= in_archive_sim:
            j = int(np.unravel_index(np.argmax(sims), sims.shape)[1])
            c["novelty_flags"].append({"type": "in_archive", "method": "embedding", "similarity": round(smax, 3),
                                       "match": seed_meta[j].get("title") or seed_meta[j].get("doc", "")})
            s["novelty"] = min(s["novelty"], 0.15)
        c["nearest_seed"] = {"title": seed_meta[near].get("title") or seed_meta[near].get("doc", ""),
                             "similarity": round(float(sims[b, near]), 3)}
        c["embedding_hit_id"] = wins[b]["hit_id"]
        # best embedding window first on the card
        c["excerpts"].sort(key=lambda e: e["hit_id"] != c["embedding_hit_id"])
        if c["excerpts"][0]["hit_id"] != c["embedding_hit_id"]:
            w = wins[b]
            c["excerpts"].insert(0, {"hit_id": w["hit_id"], "text": w["window"], "digit_frac": w.get("digit_frac", 0.0),
                                     "highlights": sorted({f for t in ("strong_terms", "weak_terms", "context_terms")
                                                           for fs in w[t].values() for f in fs}, key=len, reverse=True)})
            c["excerpts"] = c["excerpts"][:4]
        apply_llm(c, llm.get(c["candidate_id"]))
        set_priority(c)
        vecs[len(kept)] = W[b]
        kept.append(c)
    if n_missing:
        print(f"warning: {n_missing:,} candidates have no embedded window; skipped (run embed_hits.py)", flush=True)
    return kept, vecs[: len(kept)]


def write_pool(name: str, cands: list[dict]) -> Path:
    POOL_ROOT.mkdir(parents=True, exist_ok=True)
    path = POOL_ROOT / f"{name}.jsonl.gz"
    write_jsonl(path, sorted(cands, key=lambda c: -c["scores"]["priority"]), gz=True)
    return path


def histogram(values: np.ndarray, bins: int = 10, width: int = 40) -> str:
    counts, edges = np.histogram(values, bins=bins, range=(0, 1))
    top = max(1, counts.max())
    return "\n".join(f"  {edges[i]:.1f}–{edges[i + 1]:.1f} {counts[i]:7d} {'#' * int(width * counts[i] / top)}"
                     for i in range(bins))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("runs", nargs="+", type=Path, help="scan_parquet.py output dirs")
    ap.add_argument("--emb", action="append", type=Path, help="hit embedding dir(s) (default: <run>/emb for each run)")
    ap.add_argument("--seeds", type=Path, default=C.CANDIDATE_ROOT / "seeds")
    ap.add_argument("--batch", default=f"embed-{dt.date.today().isoformat()}")
    ap.add_argument("--n", type=int, default=100, help="cards in the review batch")
    ap.add_argument("--explore-frac", type=float, default=0.2)
    ap.add_argument("--no-batch", action="store_true", help="write the pool only")
    ap.add_argument("--in-archive-sim", type=float, default=0.92)
    ap.add_argument("--junk-mode", choices=["hinge", "subtract"], default="hinge")
    args = ap.parse_args()

    emb_dirs = args.emb or [r / "emb" for r in args.runs]
    cands, _ = score_candidates(args.runs, emb_dirs, args.seeds, in_archive_sim=args.in_archive_sim,
                                junk_mode=args.junk_mode)
    pool = write_pool(args.batch, cands)
    rel = np.array([c["scores"]["relevance"] for c in cands])
    pri = np.array([c["scores"]["priority"] for c in cands])
    print(f"{len(cands):,} candidates -> {pool}")
    print(f"relevance:\n{histogram(rel)}\npriority:\n{histogram(pri)}")
    print(f"{sum(c['reprints']['count'] > 1 for c in cands)} reprint clusters, "
          f"{sum(any(f['type'] == 'in_archive' for f in c['novelty_flags']) for c in cands)} flagged in_archive, "
          f"{sum(any(f['type'] == 'canonical' for f in c['novelty_flags']) for c in cands)} canonical, "
          f"{sum(c['llm'] is not None for c in cands)} with LLM labels")
    if not args.no_batch:
        decisions = live_decisions()
        queue = C.build_queue(cands, decisions, n=args.n, explore_frac=args.explore_frac)
        out = C.write_batch(args.batch, queue, {
            "source_runs": [str(r) for r in args.runs], "scoring": "embedding",
            "notes": f"relevance = top-5 seed cosine, junk contrast {args.junk_mode}; {len(cands):,} in pool {pool.name}"})
        print(f"batch of {len(queue)} ({sum(c['lane'] == 'explore' for c in queue)} explore) -> {out}")
    print("\ntop 12 by priority:")
    for c in sorted(cands, key=lambda c: -c["scores"]["priority"])[:12]:
        s = c["scores"]
        print(f"  {s['priority']:.3f} rel {s['relevance']:.2f} kind {s['kind']:.2f} nov {s['novelty']:.2f} "
              f"{c.get('year') or '----'} {c['collection'][:16]:16s} {(c.get('title') or c['identifier'])[:48]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
