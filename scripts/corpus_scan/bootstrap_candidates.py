#!/usr/bin/env python3
"""Build a review batch from scan runs with no-cost bootstrap scores.

  python bootstrap_candidates.py /tmp/cs-local --batch local-test-2026-10-16 --n 100

Writes data/corpus-scan/candidates/<batch>/{candidates.jsonl,batch.json} for
/admin/candidates. Candidates already decided in data/corpus-scan/decisions.jsonl
are skipped. Once embeddings exist, rank_hits.py replaces these scores.
"""

from __future__ import annotations

import argparse
import collections
from pathlib import Path

import candidates as cl


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("runs", nargs="+", type=Path, help="scan_parquet.py output directories")
    ap.add_argument("--batch", required=True)
    ap.add_argument("--n", type=int, default=100)
    ap.add_argument("--explore", type=float, default=0.2)
    ap.add_argument("--seed", type=int, default=1)
    args = ap.parse_args()

    cands = cl.build_candidates(args.runs)
    for c in cands:
        c["scores"] = cl.bootstrap_scores(c)
    decisions = cl.load_decisions()
    queue = cl.build_queue(cands, decisions, n=args.n, explore_frac=args.explore, seed=args.seed)
    out = cl.write_batch(args.batch, queue, {"scoring": "bootstrap", "source_runs": [str(r) for r in args.runs],
                                             "pool_size": len(cands), "explore_frac": args.explore})
    flags = collections.Counter(f["type"] for c in cands for f in c["novelty_flags"])
    reprinted = sum(1 for c in cands if c["reprints"]["count"] > 1)
    print(f"{len(cands)} candidate documents ({reprinted} with reprints; novelty flags {dict(flags)})")
    print(f"wrote {len(queue)} to {out}  lanes: {collections.Counter(c['lane'] for c in queue)}")
    for c in sorted(queue, key=lambda c: -c["scores"]["priority"])[:12]:
        print(f"  {c['scores']['priority']:.3f} {c['lane'][:3]} {c['collection'][:22]:22} {c.get('year') or 'n.d.':>5} {(c.get('title') or '')[:55]}")


if __name__ == "__main__":
    main()
