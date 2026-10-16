#!/usr/bin/env python3
"""Label candidates with a cheap LLM (default openai/gpt-6-luna) for the `llm` field.

One document per request: its metadata and up to two excerpts. Reasoning is
off and the output follows a strict JSON schema matching the `llm` field of
candidate-review.md §5:
  kind, pitch, substances, ocr_quality, archive_fit (1-5)

Labels are appended to data/corpus-scan/llm.jsonl, keyed by candidate_id, so
every later rank_hits.py / train_ranker.py run picks them up. They set the
`kind` score (KIND_WEIGHT in rank_hits.py) and scale `feasibility` by OCR
quality. Resumable: candidates already labelled are skipped. A spend ledger
stops the run at --cap dollars.

The pool or batch file that was screened is then updated in place (llm,
kind, feasibility, priority); a batch keeps its card order.

  python screen_hits.py --pool local-embed-test --top 300
  python screen_hits.py --batch local-embed-test          # just the cards in a batch
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import candidates as C
from postscan_common import CHAT_URL, AccountError, Ledger, api_key, post_json, read_jsonl, write_jsonl
from rank_hits import KIND_WEIGHT, LLM_PATH, POOL_ROOT, apply_llm, load_llm, set_priority

KINDS = list(KIND_WEIGHT)

SYSTEM = """You screen documents found in digitised historical books and newspapers for the Psychedelic History Archive, an open scholarly archive (UC Santa Cruz and Harvard historians) of primary sources on the history of psychedelics broadly construed: peyote, mescaline, cannabis/hashish, ayahuasca/yagé, psilocybin mushrooms, fly agaric, ololiuqui, DMT snuffs, iboga, kava, datura, nitrous oxide and ether, LSD and related drugs, and their ritual, medical, literary, legal and political histories. It wants primary sources a historian would value: first-hand experience reports, ethnographic observations, early scientific or clinical studies, legal and policy records, and notable literary or journalistic treatments.

You see the document's metadata and one or two excerpts around matched terms. Judge the document as the excerpts show it.

kind: first_person_experience (someone describes taking the substance or witnessing its effects first-hand); ethnographic_observation (use by a community, ritual, trade); legal_or_policy; medical_or_scientific (clinical, pharmacological, botanical study); literary (fiction, poetry, essays); passing_mention (on topic but only a sentence or two, the rest is about something else); reference_or_index (dictionary, index, pharmacopoeia list, table); commercial_or_advertisement; other (including off topic: homographs, metaphors, OCR noise).

archive_fit: 5 = the archive should almost certainly add it (substantive, specific, historically interesting); 4 = probably worth adding or tracing to the full source; 3 = relevant but routine or thin; 2 = tangential; 1 = not relevant. Plain opium, alcohol or tobacco material without a visionary, ritual or psychoactive-research angle scores low.

pitch: one or two sentences in English for the editor: what the document is and, if anything, why it would be worth adding. Be concrete (who, where, when, what substance) and do not oversell; say plainly when it is thin.
substances: common English names (e.g. "peyote", "hashish", "nitrous oxide"); empty list if none.
ocr_quality: good = reads cleanly; fair = errors but readable; poor = hard to read."""

SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "candidate_screen",
        "strict": True,
        "schema": {
            "type": "object",
            "additionalProperties": False,
            "required": ["kind", "pitch", "substances", "ocr_quality", "archive_fit"],
            "properties": {
                "kind": {"type": "string", "enum": KINDS},
                "pitch": {"type": "string"},
                "substances": {"type": "array", "items": {"type": "string"}},
                "ocr_quality": {"type": "string", "enum": ["good", "fair", "poor"]},
                "archive_fit": {"type": "integer", "enum": [1, 2, 3, 4, 5]},
            },
        },
    },
}


def user_message(c: dict, max_chars: int) -> str:
    rep = c.get("reprints") or {}
    meta = [("Collection", c.get("collection")), ("Date", c.get("date") or c.get("year")), ("Title", c.get("title")),
            ("Creator", c.get("creator")), ("Language", c.get("language")), ("Identifier", c.get("identifier")),
            ("Document length", f"{c['doc_words']:,} words" if c.get("doc_words") else None),
            ("Reprinted", f"{rep['count']} copies found in the scan" if rep.get("count", 1) > 1 else None),
            ("Matched terms", ", ".join(c["terms"]["strong"] + c["terms"]["weak"]))]
    head = "\n".join(f"{k}: {v}" for k, v in meta if v not in (None, "", "None"))
    ex, budget = [], max_chars
    for i, e in enumerate(c["excerpts"][:2]):
        text = e["text"][: budget if i == 0 else min(budget, max_chars // 3)]
        if len(text) < 200 and i:
            break
        ex.append(f"Excerpt {i + 1}:\n{text}")
        budget -= len(text)
    return head + "\n\n" + "\n\n".join(ex)


def screen_one(c: dict, args, key: str) -> dict:
    body = {"model": args.model,
            "messages": [{"role": "system", "content": SYSTEM},
                         {"role": "user", "content": user_message(c, args.max_chars)}],
            "response_format": SCHEMA, "reasoning": {"enabled": False}, "max_tokens": 400, "temperature": 0,
            "usage": {"include": True}}
    d = post_json(CHAT_URL, body, key, timeout=120, tries=4)
    llm = json.loads(d["choices"][0]["message"]["content"])
    llm["model"] = d.get("model", args.model)
    u = d.get("usage") or {}
    return {"candidate_id": c["candidate_id"], "llm": llm,
            "screened_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "cost": float(u.get("cost") or 0.0), "tokens": (u.get("prompt_tokens") or 0) + (u.get("completion_tokens") or 0)}


def target_file(args) -> Path:
    if args.batch:
        return C.CANDIDATE_ROOT / "candidates" / args.batch / "candidates.jsonl"
    if args.pool:
        return POOL_ROOT / f"{args.pool}.jsonl.gz"
    pools = sorted(POOL_ROOT.glob("*.jsonl.gz"), key=lambda p: p.stat().st_mtime)
    if not pools:
        raise SystemExit("no pool found; run rank_hits.py first or pass --pool / --batch")
    return pools[-1]


def patch(path: Path, labels: dict[str, dict]) -> int:
    """Fill llm-derived fields in a pool or batch file, keeping line order."""
    rows = read_jsonl(path)
    n = 0
    for c in rows:
        if c["candidate_id"] in labels:
            apply_llm(c, labels[c["candidate_id"]])
            set_priority(c)
            n += 1
    if path.name.endswith(".gz"):
        rows.sort(key=lambda c: -c["scores"]["priority"])
    write_jsonl(path, rows, gz=path.name.endswith(".gz"))
    return n


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--pool", help="pool name under data/corpus-scan/pool/ (default: the newest)")
    src.add_argument("--batch", help="batch name under data/corpus-scan/candidates/")
    ap.add_argument("--top", type=int, default=3000, help="screen the N highest-priority candidates of a pool")
    ap.add_argument("--limit", type=int, help="screen at most N more this run (testing)")
    ap.add_argument("--model", default="openai/gpt-6-luna")
    ap.add_argument("--concurrency", type=int, default=16)
    ap.add_argument("--max-chars", type=int, default=3000)
    ap.add_argument("--cap", type=float, default=5.0)
    ap.add_argument("--rescreen", action="store_true", help="label again even if already labelled")
    args = ap.parse_args()

    path = target_file(args)
    cands = read_jsonl(path)
    if not args.batch:
        cands = sorted(cands, key=lambda c: -c["scores"]["priority"])[: args.top]
    done = set() if args.rescreen else set(load_llm())
    todo = [c for c in cands if c["candidate_id"] not in done and c.get("excerpts")]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{path.name}: {len(todo):,} to screen ({len(cands) - len(todo):,} of {len(cands):,} already labelled or skipped)",
          flush=True)
    if todo:
        key = api_key()
        LLM_PATH.parent.mkdir(parents=True, exist_ok=True)
        ledger = Ledger(C.CANDIDATE_ROOT / "llm_spend.json", args.cap)
        lock = threading.Lock()
        t0, n_ok, n_err = time.time(), 0, 0
        with open(LLM_PATH, "a", encoding="utf-8") as fh, ThreadPoolExecutor(args.concurrency) as pool:
            futs = {pool.submit(screen_one, c, args, key): c for c in todo}
            for fut in as_completed(futs):
                try:
                    r = fut.result()
                except AccountError:
                    pool.shutdown(cancel_futures=True)
                    raise
                except Exception as e:  # malformed output or persistent error: retried next run
                    n_err += 1
                    print(f"  error {futs[fut]['candidate_id']}: {str(e)[:200]}", flush=True)
                    continue
                with lock:
                    fh.write(json.dumps(r, ensure_ascii=False) + "\n")
                    fh.flush()
                    n_ok += 1
                    ledger.add(r["cost"], r["tokens"])
                    if n_ok % 100 == 0:
                        print(f"  {n_ok:,}/{len(todo):,} | ${ledger.spent:.4f} | {(time.time() - t0) / 60:.1f} min", flush=True)
        print(f"screened {n_ok:,} ({n_err} errors) | total spend ${ledger.spent:.4f} -> {LLM_PATH}")
    n = patch(path, load_llm())
    print(f"updated {n:,} candidates in {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
