#!/usr/bin/env python3
"""Embed scan hits with Qwen3-Embedding-8B (1024 dims) via OpenRouter.

Reads <run>/hits/**/*.jsonl.gz from a scan_parquet.py run, drops exact and
near-exact duplicate windows (newspapers reprint the same story widely), and
embeds one window per duplicate group. Writes to <run>/emb/ by default:

  dedup.tsv.gz         hit_id, canonical hit_id, dedup key, for every hit
  shard-NNNNN.npy      float16, L2-normalised vectors, one row per canonical hit
  shard-NNNNN.ids.txt  the hit_ids for those rows, in order
  spend.json           running cost and tokens; the run stops at --cap dollars

Resumable: rerun the same command and finished shards are skipped. Several
run dirs can be passed; hit_ids already include the dataset slug.

  python embed_hits.py /tmp/cs-local --limit 200      # small paid test
  python embed_hits.py data/corpus-scan/runs/*        # everything
"""

from __future__ import annotations

import argparse
import gzip
import os
import sys
from pathlib import Path

from postscan_common import dedup_key, embed_to_shards, iter_hits


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("runs", nargs="+", help="scan_parquet.py output dirs")
    ap.add_argument("--out", help="embedding dir (default: <first run>/emb)")
    ap.add_argument("--batch", type=int, default=96, help="windows per request (64-128)")
    ap.add_argument("--shard-size", type=int, default=8192)
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--cap", type=float, default=10.0, help="stop when this many dollars have been spent")
    ap.add_argument("--limit", type=int, help="embed at most N more windows (testing)")
    ap.add_argument("--dedup-words", type=int, default=30)
    args = ap.parse_args()

    out = Path(args.out or Path(args.runs[0]) / "emb")
    out.mkdir(parents=True, exist_ok=True)
    seen: dict[str, str] = {}
    records: list[tuple[str, str]] = []
    n = 0
    tmp = out / "dedup.tsv.gz.tmp"
    with gzip.open(tmp, "wt", encoding="utf-8") as fh:
        fh.write("hit_id\tcanonical\tkey\n")
        for run in args.runs:
            for h in iter_hits(Path(run)):
                n += 1
                k = dedup_key(h["window"], args.dedup_words)
                canon = seen.setdefault(k, h["hit_id"])
                if canon == h["hit_id"]:
                    records.append((h["hit_id"], h["window"]))
                fh.write(f"{h['hit_id']}\t{canon}\t{k}\n")
    os.replace(tmp, out / "dedup.tsv.gz")
    print(f"{n:,} windows, {len(records):,} after dedup ({n - len(records):,} duplicates)", flush=True)
    embed_to_shards(records, out, batch=args.batch, shard_size=args.shard_size,
                    concurrency=args.concurrency, cap=args.cap, limit=args.limit)
    return 0


if __name__ == "__main__":
    sys.exit(main())
