#!/usr/bin/env python3
"""Screen ranked candidates with a cheap LLM (default openai/gpt-6-luna).

One excerpt per request, reasoning off, structured JSON output:
  relevant, kind, substances, summary, why_notable, archive_fit (1-5), ocr_quality

Reads <run>/candidates.jsonl (from rank_hits.py) and appends one verdict per
line to <run>/screened.jsonl. Resumable: hit_ids already in the output are
skipped, and failures are retried on the next run. A spend ledger
(<run>/screen_spend.json) stops the run at --cap dollars.

  python screen_hits.py /tmp/cs-local --limit 20      # spot check
  python screen_hits.py data/corpus-scan/runs/A --top 5000
"""

from __future__ import annotations

import argparse
import json
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from postscan_common import CHAT_URL, AccountError, Ledger, api_key, post_json, read_jsonl

KINDS = ["first_person_experience", "ethnographic_observation", "medical_or_scientific", "legal_or_policy",
         "literary", "commercial_or_advertisement", "reference_or_index", "other"]

SYSTEM = """You screen excerpts from digitised historical books and newspapers for the Psychedelic History Archive, an open scholarly archive (UC Santa Cruz and Harvard historians) of primary sources on the history of psychedelics broadly construed: peyote, mescaline, cannabis/hashish, ayahuasca/yagé, psilocybin mushrooms, fly agaric, ololiuqui, DMT snuffs, iboga, kava, datura, nitrous oxide and ether, LSD and related drugs, and their ritual, medical, literary, legal and political histories. The archive wants primary sources that would interest a historian: first-hand experience reports, ethnographic observations, early scientific or medical studies, legal and policy records, and notable literary or journalistic treatments.

Rate the excerpt. archive_fit: 5 = a primary source the archive should almost certainly add (substantive, specific, historically interesting); 4 = probably worth adding or tracing to the full source; 3 = relevant but routine or thin (passing mention, standard pharmacopoeia entry, reprinted wire story with little detail); 2 = only tangentially about these substances; 1 = not relevant (a homograph, metaphor, OCR noise, unrelated topic). Advertisements, price lists, indexes and dictionary entries rarely exceed 2 unless unusually revealing. Plain opium, alcohol or tobacco material without a visionary, ritual or psychoactive-research angle scores low. Judge the excerpt itself, not the topic in general. Write summary and why_notable in English, one sentence each; why_notable may say "Not notable." Use common English names in substances (e.g. "peyote", "hashish", "nitrous oxide"); empty list if none. ocr_quality: good = reads cleanly; fair = errors but readable; poor = hard to read."""

SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "screen",
        "strict": True,
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "required": ["relevant", "kind", "substances", "summary", "why_notable", "archive_fit", "ocr_quality"],
            "properties": {
                "relevant": {"type": "boolean"},
                "kind": {"type": "string", "enum": KINDS},
                "substances": {"type": "array", "items": {"type": "string"}},
                "summary": {"type": "string"},
                "why_notable": {"type": "string"},
                "archive_fit": {"type": "integer", "enum": [1, 2, 3, 4, 5]},
                "ocr_quality": {"type": "string", "enum": ["good", "fair", "poor"]},
            },
        },
    },
}


def clean(v) -> str:
    return "" if v in (None, "None", "") else str(v)


def user_message(c: dict, max_chars: int) -> str:
    meta = [("Collection", c.get("collection")), ("Date", clean(c.get("date")) or clean(c.get("year"))),
            ("Title", clean(c.get("title"))), ("Creator", clean(c.get("creator"))),
            ("Language", clean(c.get("language"))), ("Identifier", c.get("identifier")),
            ("Matched terms", ", ".join(sorted({*c.get("strong_terms", {}), *c.get("weak_terms", {})})))]
    head = "\n".join(f"{k}: {v}" for k, v in meta if v)
    return f"{head}\n\nExcerpt:\n{c['window'][:max_chars]}"


def screen_one(c: dict, args, key: str) -> dict:
    body = {"model": args.model,
            "messages": [{"role": "system", "content": SYSTEM}, {"role": "user", "content": user_message(c, args.max_chars)}],
            "response_format": SCHEMA, "reasoning": {"enabled": False}, "max_tokens": 400, "temperature": 0,
            "usage": {"include": True}}
    d = post_json(CHAT_URL, body, key, timeout=120, tries=4)
    content = d["choices"][0]["message"]["content"]
    verdict = json.loads(content)
    u = d.get("usage") or {}
    return {"hit_id": c["hit_id"], "model": d.get("model", args.model), **verdict,
            "_cost": float(u.get("cost") or 0.0), "_in": u.get("prompt_tokens"), "_out": u.get("completion_tokens")}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("run", help="run dir with candidates.jsonl")
    ap.add_argument("--candidates", help="default: <run>/candidates.jsonl")
    ap.add_argument("--out", help="default: <run>/screened.jsonl")
    ap.add_argument("--model", default="openai/gpt-6-luna")
    ap.add_argument("--top", type=int, help="screen only the first N candidates (by score)")
    ap.add_argument("--limit", type=int, help="screen at most N more items this run (testing)")
    ap.add_argument("--concurrency", type=int, default=16)
    ap.add_argument("--max-chars", type=int, default=3000)
    ap.add_argument("--cap", type=float, default=5.0)
    args = ap.parse_args()

    run = Path(args.run)
    cands = read_jsonl(Path(args.candidates or run / "candidates.jsonl"))
    if args.top:
        cands = cands[: args.top]
    out = Path(args.out or run / "screened.jsonl")
    done = {r["hit_id"] for r in read_jsonl(out)} if out.exists() else set()
    todo = [c for c in cands if c["hit_id"] not in done and c.get("window")]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(todo):,} to screen ({len(done):,} already done, {len(cands):,} candidates)", flush=True)
    if not todo:
        return 0
    key = api_key()
    ledger = Ledger(run / "screen_spend.json", args.cap)
    lock = threading.Lock()
    t0, n_ok, n_err = time.time(), 0, 0
    with open(out, "a", encoding="utf-8") as fh, ThreadPoolExecutor(args.concurrency) as pool:
        futs = {pool.submit(screen_one, c, args, key): c for c in todo}
        for fut in as_completed(futs):
            try:
                r = fut.result()
            except AccountError:
                pool.shutdown(cancel_futures=True)
                raise
            except Exception as e:  # malformed output or persistent error: retry next run
                n_err += 1
                print(f"  error {futs[fut]['hit_id']}: {str(e)[:200]}", flush=True)
                continue
            with lock:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")
                fh.flush()
                n_ok += 1
                ledger.add(r["_cost"], (r["_in"] or 0) + (r["_out"] or 0))
                if n_ok % 100 == 0:
                    print(f"  {n_ok:,}/{len(todo):,} | ${ledger.spent:.4f} | {(time.time() - t0) / 60:.1f} min", flush=True)
    print(f"screened {n_ok:,} ({n_err} errors) | total spend ${ledger.spent:.4f} -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
