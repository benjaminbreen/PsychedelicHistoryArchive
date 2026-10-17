#!/usr/bin/env python3
"""Turn add / maybe decisions from /admin/candidates into draft-source nominations.

  python nominate.py --dry-run     # show what would be written
  python nominate.py               # write data/draft-sources/sources/<slug>.json

Each nomination is a metadata-only draft built from the decision snapshot, the
latest Luna label and the reviewer's note and date correction. It enters the
existing draft workflow (data/draft-sources/README.md):

- add → status "proposed"
- maybe → status "needs-work"
- a "Lead:" pitch or a note asking to trace the source → "needs-work", with a
  "trace the full source" rationale

The full text still has to be fetched and checked during completion. Fields the
scan cannot know are left blank or set to "To be determined", so
validate_draft_sources.mjs flags them.

Re-running is safe. It only rewrites drafts it created itself
(draft.proposedBy == "corpus-scan"), and records every nomination in
data/corpus-scan/nominations.jsonl. Candidates whose only substances are out of
scope for drafts (opium, coca and so on, per the validator) are not written;
they are listed in nominations-held.jsonl for an editor to decide. Cannabis-only
candidates are written with draft.scopeException = "visionary-cannabis" (README
scope rule), because the scan only admits cannabis near visionary language.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import unicodedata
from pathlib import Path

import candidates as C

DRAFT_DIR = C.REPO / "data" / "draft-sources" / "sources"
LLM_PATH = C.CANDIDATE_ROOT / "llm.jsonl"
CANNABIS = re.compile(r"^(?:cannabis|hashish|hemp|bhang|ganja|charas|marijuana|marihuana)", re.I)
OUT_OF_SCOPE = re.compile(r"^(?:cannabis|hashish|hemp|bhang|ganja|charas|marijuana|laudanum|opium|morphine|coca|cocaine|alcohol|tobacco)", re.I)
TPL = "To be determined"
SUBSTANCE_NAMES = {"peyote": "Peyote", "mescal": "Peyote", "mescal buttons": "Peyote", "anhalonium": "Peyote", "mescaline": "Mescaline",
                   "nitrous oxide": "Nitrous oxide", "laughing gas": "Nitrous oxide", "ether": "Ether", "fly agaric": "Amanita muscaria",
                   "amanita muscaria": "Amanita muscaria", "niopo": "Yopo", "yopo": "Yopo", "niopo snuff": "Yopo",
                   "psilocybin mushrooms": "Psilocybin mushrooms", "nanacatl": "Psilocybin mushrooms", "ayahuasca": "Ayahuasca"}


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def clean_creator(raw: str | None) -> str:
    """First catalogue creator without life dates or authority ids: 'Murray, J. (John), 1820-, n 94801473' -> 'Murray, J.'."""
    first = (raw or "").split("|")[0].split(";")[0].strip()
    first = re.sub(r"\s*\([^)]*\)", "", first)
    first = re.sub(r",?\s*(?:d\.\s*)?\d{3,4}\??-?(?:\d{3,4})?\??\.?", "", first)
    first = re.sub(r",?\s*n\s*\d+", "", first)
    return first.strip(" ,.;") if re.search(r"[A-Za-z]", first) else ""


def short_slug(author: str, title: str, year) -> str:
    surname = slugify(author.split(",")[0]) if author and author != "Unknown" else ""
    words = [w for w in slugify(title).split("-") if w not in {"the", "a", "an", "of", "de", "la", "le", "des", "du", "and", "et", "y"}][:6]
    return "-".join(filter(None, [surname, "-".join(words), str(year) if year else ""]))[:80].strip("-")


def era(year: int | None) -> str:
    if year is None:
        return ""
    return "Pre-1800" if year < 1800 else "1800-1950" if year < 1950 else "1950-1970" if year < 1970 else "1970-2000" if year < 2000 else "2000-Present"


def text_source_kind(url: str | None) -> str:
    if not url:
        return "other"
    for key, kind in (("archive.org", "internet-archive"), ("gallica", "gallica"), ("chroniclingamerica", "chronicling-america"),
                      ("europeana", "europeana"), ("theeuropeanlibrary", "europeana"), ("gutenberg", "gutenberg"), ("wikisource", "wikisource")):
        if key in url:
            return kind
    return "other"


def excerpt_sentence(text: str, terms: list[str] | None = None, limit: int = 520) -> str:
    """The middle of a scan window (windows are centred on the hit), trimmed to sentence or word edges."""
    text = " ".join(text.split())
    if len(text) <= limit:
        return text
    mid = len(text) // 2
    lo, hi = max(0, mid - limit // 2), min(len(text), mid + limit // 2)
    dot = text.find(". ", lo, lo + 160)
    lo = dot + 2 if dot >= 0 else text.find(" ", lo) + 1
    dot = text.rfind(". ", hi - 160, hi)
    hi = dot + 1 if dot >= 0 else text.rfind(" ", lo, hi)
    s = text[lo:hi].strip()
    return ("… " if lo > 0 else "") + s + ("" if s.endswith(".") else " …")


def build(decision: dict, llm: dict | None, today: str) -> dict:
    snap = decision["snapshot"]
    llm = llm or snap.get("llm") or {}
    corr = decision.get("corrections") or {}
    year = corr.get("year") or snap.get("year")
    ident = snap["identifier"]
    ca = re.match(r"^(sn\d+|[a-z]{1,3}\d{6,})_(\d{4}-\d{2}-\d{2})_\d+_(\d+)", ident)
    if (snap.get("title") or "").strip():
        title = html.unescape(snap["title"]).strip()
    elif ca:
        title = f"Untitled newspaper item, {ca[2]} (Chronicling America {ca[1]}, page {ca[3]})"
    else:
        title = f"Untitled item ({snap['collection']} {ident})"
    newspaper = "Newspapers" in snap["collection"] or snap["collection"] in {"Europeana", "Deutsches Zeitungsportal", "Anno"}
    pitch = llm.get("pitch", "").strip()
    lead = pitch.lower().startswith("lead:") or bool(re.search(r"\b(trace|check|original|fuller)\b", decision.get("note", ""), re.I))
    status = "proposed" if decision["decision"] == "add" and not lead else "needs-work"
    subs = sorted({SUBSTANCE_NAMES.get(s.lower(), s[:1].upper() + s[1:]) for s in llm.get("substances", []) if s})
    best = snap.get("best_excerpt", "")
    terms = snap.get("terms", {}).get("strong", []) + snap.get("terms", {}).get("weak", [])
    url = snap.get("source_url")
    creator = clean_creator(snap.get("creator"))
    rationale = " ".join(filter(None, [
        "Lead: trace the full source before drafting a transcript." if lead else None,
        "Editor marked this maybe in corpus-scan review." if decision["decision"] == "maybe" else None,
        pitch, f"Editor note: {decision['note']}" if decision.get("note") else None]))
    citation = ", ".join(filter(None, [creator or None, f"*{title}*", str(year) if year else "n.d.",
                                       f"{snap['collection']} (Common Corpus) {snap['identifier']}"])) + "."
    return {
        "slug": "",
        "title": title,
        "author": creator or "Unknown",
        "year": year,
        "displayDate": str(year) if year else "Undated",
        "type": "Newspaper Article" if newspaper else "Book",
        "medium": "Text",
        "era": era(year),
        "region": TPL,
        "language": snap.get("language") or TPL,
        "substances": subs,
        "people": [],
        "tags": ["corpus-scan"],
        "summary": pitch.removeprefix("Lead:").strip() or TPL,
        "excerpt": excerpt_sentence(best, terms),
        "citation": citation,
        "rights": "Public domain (per Common Corpus); confirm before hosting",
        "sourceUrl": url or "",
        "accessType": "external",
        "hostingStatus": "external_link",
        "readerMode": "overview",
        "draft": {
            "status": status,
            "proposedBy": "corpus-scan",
            "proposedOn": today,
            "bucket": "corpus-scan-review",
            "rationale": rationale,
            "textSource": {"url": url or "", "kind": text_source_kind(url),
                           "scope": "~300-word OCR excerpt matched by the Common Corpus scan; full text not yet fetched"},
            "textQuality": {"ocrPass": "none", "confidence": "low",
                            "notes": f"Luna OCR rating: {llm.get('ocr_quality', 'n/a')}. Only the scan excerpt has been seen."},
            "duplicateCheck": "; ".join(f"{f['type']}: {f['match']}" for f in snap.get("novelty_flags", [])) or "No title match against archive documents, drafts or bibliography at scan time.",
            "reviewStatus": "unreviewed",
            "corpusScan": {
                "candidate_id": decision["candidate_id"], "decision": decision["decision"], "decided_at": decision["decided_at"],
                "why": decision.get("why", []), "reasons": decision.get("reasons", []), "corrections": corr or None,
                "dataset": snap.get("dataset"), "revision": snap.get("revision"), "collection": snap["collection"],
                "identifier": snap["identifier"], "archive_fit": llm.get("archive_fit"), "kind": llm.get("kind"),
                "scan_excerpt": best,
            },
        },
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    today = dt.date.today().isoformat()
    labels = {}
    if LLM_PATH.exists():
        for line in LLM_PATH.read_text().splitlines():
            if line.strip():
                r = json.loads(line)
                labels[r["candidate_id"]] = r["llm"]
    taken = {p.stem: json.loads(p.read_text()).get("draft", {}).get("proposedBy") for p in DRAFT_DIR.glob("*.json")}
    previous = {}
    log = C.CANDIDATE_ROOT / "nominations.jsonl"
    if log.exists():
        for line in log.read_text().splitlines():
            if line.strip():
                r = json.loads(line)
                previous[r["candidate_id"]] = r["slug"]

    written, held, records = [], [], []
    for cid, d in sorted(C.load_decisions().items(), key=lambda kv: kv[1]["decided_at"]):
        if d["decision"] not in ("add", "maybe") or "snapshot" not in d:
            continue
        draft = build(d, labels.get(cid), today)
        subs = draft["substances"]
        if subs and all(CANNABIS.match(s) for s in subs):
            # Editors kept it, and the scan only admits cannabis near visionary language:
            # the README's visionary-cannabis exception applies.
            draft["draft"]["scopeException"] = "visionary-cannabis"
            draft["draft"]["rationale"] = ("Visionary cannabis (scope exception): kept in review because the passage describes "
                                           "a psychedelic-like state, not mere intoxication. " + draft["draft"]["rationale"])
        elif not subs or all(OUT_OF_SCOPE.match(s) for s in subs):
            held.append({"candidate_id": cid, "decision": d["decision"], "title": draft["title"], "substances": draft["substances"],
                         "why_held": "only substances that draft-sources treats as out of scope on their own (see README scope rule)"})
            continue
        ca = re.match(r"^(sn\d+|[a-z]{1,3}\d{6,})_(\d{4}-\d{2}-\d{2})", draft["draft"]["corpusScan"]["identifier"])
        slug = previous.get(cid) or (f"newspaper-{ca[1]}-{ca[2]}" if ca and draft["title"].startswith("Untitled") else short_slug(draft["author"], draft["title"], draft["year"]))
        base, n = slug, 2
        while slug in taken and taken[slug] != "corpus-scan" and previous.get(cid) != slug:
            slug, n = f"{base}-{n}", n + 1
        draft["slug"] = slug
        taken[slug] = "corpus-scan"
        records.append({"candidate_id": cid, "slug": slug, "status": draft["draft"]["status"], "decision": d["decision"]})
        written.append((slug, draft))

    for slug, draft in written:
        missing = [k for k in ("year", "era") if not draft[k]] + [k for k in ("region", "language", "summary") if draft[k] == TPL]
        print(f"{'(dry) ' if args.dry_run else ''}{draft['draft']['status']:10} {slug}" + (f"   [fill in: {', '.join(missing)}]" if missing else ""))
        if not args.dry_run:
            (DRAFT_DIR / f"{slug}.json").write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for h in held:
        print(f"held       {h['title'][:70]}  ({', '.join(h['substances']) or 'no substances'})")
    if not args.dry_run:
        log.write_text("".join(json.dumps(r) + "\n" for r in records))
        (C.CANDIDATE_ROOT / "nominations-held.jsonl").write_text("".join(json.dumps(h, ensure_ascii=False) + "\n" for h in held))
    print(f"{len(written)} nominations ({sum(1 for _, d in written if d['draft']['status'] == 'proposed')} proposed), {len(held)} held")


if __name__ == "__main__":
    main()
