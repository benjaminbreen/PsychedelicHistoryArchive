#!/usr/bin/env python3
"""Summarise a scan_parquet.py run: hits per term, collection and decade, plus a
random sample of excerpts for hand review.

  python summarize_hits.py runs/local --sample 50 --seed 1 > runs/local/summary.md
  python summarize_hits.py runs/local --sample 50 --strong-only   # only windows with a strong term
"""

from __future__ import annotations

import argparse
import collections
import gzip
import json
import random
from pathlib import Path


def iter_hits(run: Path):
    for p in sorted((run / "hits").rglob("*.jsonl.gz")):
        with gzip.open(p, "rt", encoding="utf-8") as fh:
            for line in fh:
                yield json.loads(line)


def table(counter: collections.Counter, title: str, limit: int = 40) -> str:
    rows = [f"### {title}", "", "| | windows |", "|---|---:|"]
    rows += [f"| {k} | {v} |" for k, v in counter.most_common(limit)]
    return "\n".join(rows) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("run", type=Path)
    ap.add_argument("--sample", type=int, default=50)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--strong-only", action="store_true")
    ap.add_argument("--chars", type=int, default=900, help="excerpt characters shown per sampled hit")
    args = ap.parse_args()

    hits = list(iter_hits(args.run))
    by_term, by_coll, by_dec, by_tier, docs = (collections.Counter() for _ in range(5))
    for h in hits:
        for t in h["matched_terms"]:
            by_term[t] += 1
        by_coll[h["collection"]] += 1
        by_dec[f"{h['year'] // 10 * 10}s" if h.get("year") else "undated"] += 1
        by_tier["has strong term" if h["strong_terms"] else "weak + context only"] += 1
        docs[(h["source_file"], h["row"])] += 1

    stats = [json.loads(p.read_text()) for p in (args.run / "stats").rglob("*.json")]
    rows = sum(s["rows"] for s in stats)
    pre = sum(s["prefiltered_rows"] for s in stats)
    print(f"# Scan summary: {args.run}\n")
    print(f"- files: {len(stats)}; rows scanned: {rows:,}; rows passing RE2 prefilter: {pre:,}")
    print(f"- excerpt windows: {len(hits):,} from {len(docs):,} documents\n")
    print(table(by_tier, "Windows by tier"))
    print(table(by_term, "Windows per term (a window can count for several terms)", 60))
    print(table(by_coll, "Windows per collection"))
    print(table(collections.Counter(dict(sorted(by_dec.items()))), "Windows per decade", 80))

    pool = [h for h in hits if h["strong_terms"]] if args.strong_only else hits
    rnd = random.Random(args.seed)
    sample = rnd.sample(pool, min(args.sample, len(pool)))
    print(f"## Random sample of {len(sample)} windows (seed {args.seed}{', strong only' if args.strong_only else ''})\n")
    for i, h in enumerate(sample, 1):
        terms = {**h["strong_terms"], **h["weak_terms"]}
        ctx = list(h["context_terms"])
        w = h["window"]
        mid = w.lower().find(h["anchor_text"].lower())
        lo = max(0, mid - args.chars // 2)
        print(f"**{i}. {h['collection']} | {h.get('year') or 'n.d.'} | {h.get('title') or ''} | {h['identifier']}**  ")
        print(f"terms: {terms} context: {ctx}  ")
        print(f"> {w[lo: lo + args.chars]}\n")


if __name__ == "__main__":
    main()
