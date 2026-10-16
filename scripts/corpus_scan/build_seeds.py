#!/usr/bin/env python3
"""Build and embed the archive seed set used to rank scan hits.

Seeds are ~300-word chunks of texts already in the archive:
  - curated document_sections in data/*-import/document_sections.json
    (transcript-type sections; editorial notes are skipped unless
    --include-editorial, since modern prose would pull the ranking toward it)
  - nitrous oxide:ether/texts/first_hand/*.txt
  - latin-american-psychedelic-research/texts/*.txt
  - data/squarespace-import/body-text/*.txt

Junk seeds (category "junk") stand for what the ranking should push down:
indexes, materia medica and price lists, adverts. They come from, in order:
"no" decisions in data/corpus-scan/decisions.jsonl with reason
reference_or_index or advertisement (the snapshot excerpt); candidates that
screen_hits.py labelled reference_or_index or commercial_or_advertisement
with archive_fit <= 2 (best excerpt, from data/corpus-scan/pool/); and hits with digit_frac >= --junk-digit-frac, from the --junk-run scan dirs.
rank_hits.py subtracts each hit's similarity to them from its relevance.

Each seed is tagged with zero or more categories (experience, ethnography,
policy, pharmacology) by keyword rules over its title, document type, tags and
genre, so rank_hits.py can take the top-k per category and stop medicine from
swamping first-person accounts. Long sources are capped at --max-chunks-per-doc
chunks, spaced evenly through the text.

Writes to data/corpus-scan/seeds/ by default: seeds.jsonl (one row per seed,
in id order) and the shard-*.npy / .ids.txt embeddings. Resumable.

  python build_seeds.py --dry-run     # chunk and tag only, print counts
  python build_seeds.py               # chunk, tag and embed
"""

from __future__ import annotations

import argparse
import collections
import glob
import hashlib
import json
import re
import sys
from pathlib import Path

from postscan_common import embed_to_shards, iter_hits, read_jsonl, write_jsonl

REPO = Path(__file__).resolve().parents[2]

EDITORIAL_TYPES = {"source_note", "overview", "note", "historical_context", "editorial_note"}

# Category rules: a seed belongs to a category when any pattern matches its
# metadata string (title | document type | tags | genre | heading | path).
CATEGORY_RULES = {
    "experience": r"self[- ]experiment|first[- ]person|first_hand|testimony|visionary|anaesthetic revelation|"
                  r"trip\b|subjective effects|consciousness under|dream reports|personal history|interview",
    "ethnography": r"ethnograph|ethnobotan|indigenous|ritual|native american church|field notes|field science|"
                   r"archaeolog|mazatec|koryak|kamchatka|siberia|amazonia|shaman|cultural|colloquy",
    "policy": r"court|mkultra|\bcia\b|drug policy|controlled substances|government|religious freedom|prohibition|"
              r"\bdea\b|inspector general|regulatory|congress|hearing|first amendment|memorand|unwitting",
    "pharmacology": r"pharmacolog|medic|chemi|alkaloid|harmine|harmala|clinical|psychiatr|anaesthe|anesthe|"
                    r"experimental compound|toxic|narcotic pepper|physiolog",
}
CATEGORY_RES = {k: re.compile(v, re.IGNORECASE) for k, v in CATEGORY_RULES.items()}


def categories(meta: str) -> list[str]:
    return [k for k, rx in CATEGORY_RES.items() if rx.search(meta)]


def chunk_text(text: str, target: int = 300, max_words: int = 450, min_words: int = 80) -> list[str]:
    """Greedy paragraph packing to ~target words; long paragraphs are split."""
    paras = [p.split() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks, cur = [], []
    for words in paras:
        while len(words) > max_words:
            if cur:
                chunks.append(cur)
                cur = []
            chunks.append(words[:target])
            words = words[target:]
        if cur and len(cur) + len(words) > max_words:
            chunks.append(cur)
            cur = []
        cur += words
        if len(cur) >= target:
            chunks.append(cur)
            cur = []
    if cur:
        if chunks and len(cur) < min_words:
            chunks[-1] += cur
        else:
            chunks.append(cur)
    return [" ".join(c) for c in chunks if len(c) >= min_words or len(chunks) == 1]


def spaced(items: list, k: int) -> list:
    if len(items) <= k:
        return items
    return [items[round(i * (len(items) - 1) / (k - 1))] for i in range(k)] if k > 1 else items[:1]


def strip_markdown(s: str) -> str:
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"\[\^[^\]]+\]:?", "", s)
    s = re.sub(r"^#+\s*", "", s, flags=re.M)
    return re.sub(r"[*_`>]+", "", s)


def load_import_dir(d: Path) -> tuple[dict, dict]:
    """documents by id, and tag names by document id, for one import dir."""
    def load(name):
        p = d / name
        return json.loads(p.read_text()) if p.exists() else []
    docs = {r["id"]: r for r in load("documents.json")}
    tags = {t["id"]: t.get("name") or t.get("label") or "" for t in load("tags.json")}
    by_doc = collections.defaultdict(list)
    for r in load("document_tags.json"):
        by_doc[r["document_id"]].append(tags.get(r["tag_id"], ""))
    return docs, by_doc


def manifest_meta(texts_dir: Path) -> dict:
    out = {}
    m = texts_dir / "manifest.jsonl"
    if m.exists():
        for line in m.read_text().splitlines():
            if line.strip():
                r = json.loads(line)
                out[Path(r.get("local_path") or r.get("filename", "")).name] = r
    return out


def collect_sources(include_editorial: bool) -> list[dict]:
    """One dict per source text: source, doc, title, meta (for categories), text."""
    sources = []
    for f in sorted(glob.glob(str(REPO / "data" / "*-import" / "document_sections.json"))):
        d = Path(f).parent
        docs, doc_tags = load_import_dir(d)
        by_doc = collections.defaultdict(list)
        for s in json.loads(Path(f).read_text()):
            if not include_editorial and s.get("section_type") in EDITORIAL_TYPES:
                continue
            by_doc[s["document_id"]].append(s)
        for doc_id, secs in by_doc.items():
            secs.sort(key=lambda s: float(s.get("position") or 0))
            doc = docs.get(doc_id, {})
            meta = " | ".join([doc.get("title") or "", doc.get("document_type") or "", doc.get("medium") or "",
                               *doc_tags.get(doc_id, []), *(s.get("heading") or "" for s in secs)])
            sources.append({"source": f"{d.name}/document_sections", "doc": doc.get("slug") or doc_id,
                            "title": doc.get("title") or "", "meta": meta,
                            "text": "\n\n".join(strip_markdown(s.get("body") or "") for s in secs)})

    sq_docs, sq_tags = load_import_dir(REPO / "data" / "squarespace-import")
    sq_by_slug = {r.get("slug"): r for r in sq_docs.values()}
    text_dirs = [
        (REPO / "nitrous oxide:ether" / "texts" / "first_hand", "nitrous-ether/first_hand"),
        (REPO / "latin-american-psychedelic-research" / "texts", "latin-american-psychedelic-research"),
        (REPO / "data" / "squarespace-import" / "body-text", "squarespace/body-text"),
    ]
    for tdir, label in text_dirs:
        mm = manifest_meta(tdir)
        for p in sorted(tdir.glob("*.txt")):
            m = mm.get(p.name, {})
            doc = sq_by_slug.get(p.stem, {}) if label.startswith("squarespace") else {}
            meta = " | ".join(str(x) for x in [label, p.stem, m.get("title", ""), m.get("genre", ""),
                                               m.get("report_type", ""), doc.get("title", ""),
                                               doc.get("document_type", ""), *sq_tags.get(doc.get("id"), [])])
            sources.append({"source": label, "doc": p.stem, "title": m.get("title") or doc.get("title") or p.stem,
                            "meta": meta, "text": p.read_text(encoding="utf-8", errors="replace")})
    return sources


JUNK_REASONS = {"reference_or_index", "advertisement"}
JUNK_KINDS = {"reference_or_index", "commercial_or_advertisement"}


def junk_seeds(runs: list[str], decisions: Path, digit_frac: float, limit: int) -> list[dict]:
    """(source, doc, text) rows for junk seeds, strongest evidence first."""
    out: list[dict] = []
    if decisions.exists():
        latest = {d["candidate_id"]: d for d in read_jsonl(decisions)}
        for d in latest.values():
            text = (d.get("snapshot") or {}).get("best_excerpt") or ""
            if d.get("decision") == "no" and JUNK_REASONS & set(d.get("reasons") or []) and text:
                out.append({"source": "junk:decision", "doc": d["candidate_id"], "text": text})
    labelled, heuristic = [], []
    llm_path = REPO / "data" / "corpus-scan" / "llm.jsonl"
    if llm_path.exists():
        bad = {r["candidate_id"] for r in read_jsonl(llm_path)
               if r["llm"].get("kind") in JUNK_KINDS and (r["llm"].get("archive_fit") or 5) <= 2}
        for pool in sorted((REPO / "data" / "corpus-scan" / "pool").glob("*.jsonl.gz")):
            for c in read_jsonl(pool):
                if c["candidate_id"] in bad and c.get("excerpts"):
                    bad.discard(c["candidate_id"])
                    labelled.append({"source": "junk:llm", "doc": c["candidate_id"], "text": c["excerpts"][0]["text"]})
    for run in runs:
        for h in iter_hits(Path(run)):
            if (h.get("digit_frac") or 0) >= digit_frac:
                heuristic.append({"source": "junk:digit_frac", "doc": h["hit_id"], "text": h["window"],
                                  "digit_frac": h["digit_frac"]})
    heuristic.sort(key=lambda r: -r.pop("digit_frac"))
    return (out + labelled + heuristic)[:limit]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=str(REPO / "data" / "corpus-scan" / "seeds"))
    ap.add_argument("--words", type=int, default=300)
    ap.add_argument("--max-chunks-per-doc", type=int, default=60)
    ap.add_argument("--include-editorial", action="store_true")
    ap.add_argument("--cap", type=float, default=1.0)
    ap.add_argument("--junk-run", action="append", default=[], help="scan run dir to draw junk seeds from (repeatable)")
    ap.add_argument("--decisions", default=str(REPO / "data" / "corpus-scan" / "decisions.jsonl"))
    ap.add_argument("--junk-digit-frac", type=float, default=0.25)
    ap.add_argument("--junk-max", type=int, default=400)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    seeds, seen = [], set()
    for src in collect_sources(args.include_editorial):
        cats = categories(src["meta"])
        for i, chunk in enumerate(spaced(chunk_text(src["text"], args.words), args.max_chunks_per_doc)):
            h = hashlib.sha1(" ".join(chunk.lower().split()).encode()).hexdigest()[:16]
            if h in seen:
                continue
            seen.add(h)
            seeds.append({"seed_id": f"{src['source']}:{src['doc']}:{i}:{h[:6]}", "source": src["source"],
                          "doc": src["doc"], "title": src["title"], "categories": cats,
                          "words": len(chunk.split()), "text": chunk})

    for j in junk_seeds(args.junk_run, Path(args.decisions), args.junk_digit_frac, args.junk_max):
        h = hashlib.sha1(" ".join(j["text"].lower().split()).encode()).hexdigest()[:16]
        if h in seen:
            continue
        seen.add(h)
        seeds.append({"seed_id": f"{j['source']}:{j['doc']}:{h[:6]}", "source": j["source"], "doc": j["doc"],
                      "title": "", "categories": ["junk"], "words": len(j["text"].split()), "text": j["text"]})

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    write_jsonl(out / "seeds.jsonl", seeds)
    by_src = collections.Counter(s["source"] for s in seeds)
    by_cat = collections.Counter(c for s in seeds for c in s["categories"] or ["(none)"])
    print(f"{len(seeds):,} seeds from {len({(s['source'], s['doc']) for s in seeds})} documents, "
          f"{sum(s['words'] for s in seeds):,} words")
    for k, v in by_src.most_common():
        print(f"  {v:5d}  {k}")
    print("categories:", dict(by_cat.most_common()))
    if not args.dry_run:
        embed_to_shards([(s["seed_id"], s["text"]) for s in seeds], out, cap=args.cap)
    return 0


if __name__ == "__main__":
    sys.exit(main())
