#!/usr/bin/env python3
"""Rank embedded scan hits by similarity to the archive seed passages.

For each canonical (deduplicated) hit window:
  sim_top5   mean of its 5 highest cosine similarities to the seeds
  score      sim_top5 + --strong-bonus per distinct strong term (up to 3)
             - --digit-penalty when digit_frac > --digit-threshold
             (indexes, price lists, tables)
  cat_<c>    the same, using the mean top-3 within one seed category
             (experience, ethnography, policy, pharmacology)

Only the best window per source document is kept. The candidate list for
screening is the top --top documents overall plus the top --per-category in
each category, so first-person accounts are not swamped by medicine.

Writes to <emb dir>/.. (the run dir) by default:
  ranked.jsonl.gz    every document's best window, best first
  candidates.jsonl   the screening set, with picked_by
and prints a score histogram with an estimated knee.

  python rank_hits.py /tmp/cs-local --top 300 --per-category 75
"""

from __future__ import annotations

import argparse
import collections
import gzip
import json
import sys
from pathlib import Path

import numpy as np

from postscan_common import doc_key, iter_hits, load_shards, read_jsonl, write_jsonl

REPO = Path(__file__).resolve().parents[2]
CATS = ["experience", "ethnography", "policy", "pharmacology"]


def topk_mean(sims: np.ndarray, k: int) -> np.ndarray:
    k = min(k, sims.shape[1])
    if k == 0:
        return np.zeros(len(sims), dtype=np.float32)
    return np.partition(sims, -k, axis=1)[:, -k:].mean(axis=1)


def knee(values: np.ndarray) -> int:
    """Index of the knee of a descending curve (max distance below the chord)."""
    n = len(values)
    if n < 3:
        return n
    x = np.linspace(0, 1, n)
    y = (values - values[-1]) / max(1e-9, values[0] - values[-1])
    return int(np.argmax((1 - x) - y)) + 1


def histogram(values: np.ndarray, bins: int = 20, width: int = 50) -> str:
    counts, edges = np.histogram(values, bins=bins)
    top = max(1, counts.max())
    return "\n".join(f"  {edges[i]:.3f}–{edges[i + 1]:.3f} {counts[i]:7d} {'#' * int(width * counts[i] / top)}"
                     for i in range(bins))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("runs", nargs="+", help="scan_parquet.py output dirs (for hit metadata)")
    ap.add_argument("--emb", help="hit embedding dir (default: <first run>/emb)")
    ap.add_argument("--seeds", default=str(REPO / "data" / "corpus-scan" / "seeds"))
    ap.add_argument("--out", help="output dir (default: first run dir)")
    ap.add_argument("--k", type=int, default=5, help="top-k seeds averaged for the overall score")
    ap.add_argument("--cat-k", type=int, default=3, help="top-k seeds averaged within a category")
    ap.add_argument("--strong-bonus", type=float, default=0.01)
    ap.add_argument("--digit-threshold", type=float, default=0.12)
    ap.add_argument("--digit-penalty", type=float, default=0.05)
    ap.add_argument("--top", type=int, default=4000, help="overall candidates for screening")
    ap.add_argument("--per-category", type=int, default=500, help="extra candidates per seed category")
    ap.add_argument("--keep-text", type=int, default=50000,
                    help="keep window text in ranked.jsonl.gz for this many top documents")
    ap.add_argument("--already-in-archive", type=float, default=0.92,
                    help="flag hits whose nearest seed is at least this similar")
    args = ap.parse_args()

    run0 = Path(args.runs[0])
    emb_dir = Path(args.emb or run0 / "emb")
    out = Path(args.out or run0)
    hit_ids, H = load_shards(emb_dir)
    seed_ids, S = load_shards(Path(args.seeds))
    if not len(hit_ids) or not len(seed_ids):
        raise SystemExit("no hit or seed embeddings found; run embed_hits.py and build_seeds.py first")
    seeds = {s["seed_id"]: s for s in read_jsonl(Path(args.seeds) / "seeds.jsonl")}
    seed_meta = [seeds.get(i, {}) for i in seed_ids]
    cat_idx = {c: np.array([j for j, s in enumerate(seed_meta) if c in s.get("categories", [])]) for c in CATS}
    print(f"{len(hit_ids):,} hit vectors, {len(seed_ids):,} seed vectors "
          f"({', '.join(f'{c} {len(v)}' for c, v in cat_idx.items())})", flush=True)

    copies = collections.Counter()
    dedup = emb_dir / "dedup.tsv.gz"
    if dedup.exists():
        with gzip.open(dedup, "rt") as fh:
            next(fh)
            for line in fh:
                copies[line.split("\t", 2)[1]] += 1

    pos = {h: i for i, h in enumerate(hit_ids)}

    St = S.astype(np.float32).T
    n = len(hit_ids)
    sim5 = np.zeros(n, np.float32)
    simmax = np.zeros(n, np.float32)
    nearest = np.zeros(n, np.int64)
    cat = {c: np.zeros(n, np.float32) for c in CATS}
    for a in range(0, n, 8192):
        sims = H[a : a + 8192].astype(np.float32) @ St
        sim5[a : a + 8192] = topk_mean(sims, args.k)
        nearest[a : a + 8192] = sims.argmax(axis=1)
        simmax[a : a + 8192] = sims.max(axis=1)
        for c, idx in cat_idx.items():
            if len(idx):
                cat[c][a : a + 8192] = topk_mean(sims[:, idx], args.cat_k)

    def adjust(base: float, h: dict) -> float:
        bonus = args.strong_bonus * min(3, len(h.get("strong_terms") or {}))
        pen = args.digit_penalty if (h.get("digit_frac") or 0) > args.digit_threshold else 0.0
        return base + bonus - pen

    def hits():
        for r in args.runs:
            yield from iter_hits(Path(r))

    # Pass 1: best window per document, keeping only small tuples in memory.
    best: dict[str, tuple[float, int]] = {}
    n_windows = collections.Counter()
    found = 0
    for h in hits():
        i = pos.get(h["hit_id"])
        if i is None:
            continue  # a duplicate, or not embedded yet
        found += 1
        k = doc_key(h)
        n_windows[k] += 1
        sc = adjust(float(sim5[i]), h)
        if k not in best or sc > best[k][0]:
            best[k] = (sc, i)
    if found < n:
        print(f"warning: {n - found:,} embedded hits not found in the run dirs; skipped", flush=True)
    order = sorted(best.values(), key=lambda t: -t[0])
    rank = {i: r for r, (_, i) in enumerate(order)}

    # Pass 2: full records for the winners; window text only for the top --keep-text.
    docs: list[dict | None] = [None] * len(order)
    for h in hits():
        i = pos.get(h["hit_id"])
        r = rank.get(i) if i is not None else None
        if r is None or docs[r] is not None:
            continue
        rec = dict(h)
        if r >= args.keep_text:
            rec.pop("window", None)
        rec.update(
            score=round(order[r][0], 4),
            sim_top5=round(float(sim5[i]), 4),
            sim_max=round(float(simmax[i]), 4),
            nearest_seed=seed_ids[nearest[i]],
            nearest_seed_title=seed_meta[nearest[i]].get("title", ""),
            likely_in_archive=bool(simmax[i] >= args.already_in_archive),
            n_copies=copies.get(h["hit_id"], 1),
            doc_windows_embedded=n_windows[doc_key(h)],
            **{f"cat_{c}": round(adjust(float(cat[c][i]), h), 4) for c in CATS if len(cat_idx[c])},
        )
        docs[r] = rec
    scores = np.array([r["score"] for r in docs])
    write_jsonl(out / "ranked.jsonl.gz", docs, gz=True)

    picked: dict[str, dict] = {}
    for r in docs[: args.top]:
        picked.setdefault(r["hit_id"], {**r, "picked_by": []})["picked_by"].append("overall")
    for c in CATS:
        if not len(cat_idx[c]):
            continue
        for r in sorted(docs[: args.keep_text], key=lambda r: -r[f"cat_{c}"])[: args.per_category]:
            picked.setdefault(r["hit_id"], {**r, "picked_by": []})["picked_by"].append(c)
    cands = sorted(picked.values(), key=lambda r: -r["score"])
    write_jsonl(out / "candidates.jsonl", cands)

    kn = knee(scores)
    print(f"{len(docs):,} documents (best window each) from {n:,} windows")
    print(f"score histogram:\n{histogram(scores)}")
    print(f"knee at rank {kn:,} (score {scores[kn - 1]:.3f}); "
          f"top-{args.top} cut at {scores[min(args.top, len(scores)) - 1]:.3f}")
    print(f"{len(cands):,} candidates -> {out / 'candidates.jsonl'} "
          f"({sum(r['likely_in_archive'] for r in cands)} likely already in the archive)")
    print("\ntop 15:")
    for r in docs[:15]:
        print(f"  {r['score']:.3f} {r.get('year') or '----'} {r['collection'][:18]:18s} "
              f"{(r.get('title') or r['identifier'])[:50]:50s} ~ {r['nearest_seed_title'][:30]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
