"""Shared helpers for turning scan hits into reviewable candidates.

Contract and rationale: docs/corpus-scan/candidate-review.md. One candidate is
one document (book, issue page, report), not one excerpt window. Ranking
scripts (bootstrap_candidates.py now; rank_hits.py / train_ranker.py later)
build candidates with these helpers and write them with `write_batch`, and the
/admin/candidates queue reads the result.
"""

from __future__ import annotations

import collections
import datetime as dt
import gzip
import json
import math
import random
import re
import unicodedata
import zlib
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[2]
CANDIDATE_ROOT = REPO / "data" / "corpus-scan"

# ---------------------------------------------------------------------------
# Reading hits and grouping them into documents
# ---------------------------------------------------------------------------

CHUNK_SUFFIX = re.compile(r"_\d+$")  # common_corpus splits books into rows: <id>_14, <id>_15, ...


def iter_hits(run_dir: Path):
    for p in sorted((Path(run_dir) / "hits").rglob("*.jsonl.gz")):
        with gzip.open(p, "rt", encoding="utf-8") as fh:
            for line in fh:
                yield json.loads(line)


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")


def base_identifier(hit: dict) -> str:
    ident = str(hit.get("identifier") or "")
    if hit.get("collection") == "US-PD-Newspapers" or ident.startswith("http"):
        return ident  # one newspaper page / one URL is already a document
    return CHUNK_SUFFIX.sub("", ident) or f"{hit['source_file']}#{hit['row']}"


def group_documents(hits) -> list[dict]:
    """Collapse windows into one record per (collection, base identifier)."""
    docs: dict[tuple[str, str], dict] = {}
    for h in hits:
        key = (h.get("collection") or h["dataset"], base_identifier(h))
        d = docs.get(key)
        if d is None:
            d = docs[key] = {
                "candidate_id": f"{slug(key[0])}:{key[1]}",
                "dataset": h["dataset"], "collection": key[0], "revision": h.get("revision"),
                "identifier": h.get("identifier"), "base_identifier": key[1],
                "source_file": h["source_file"], "row": h["row"],
                "title": _clean(h.get("title")), "creator": _clean(h.get("creator")),
                "year": h.get("year"), "date": h.get("date"), "language": h.get("language"),
                "page": h.get("page"), "edition": h.get("edition"),
                "doc_words": 0, "windows": [], "_rows": set(),
            }
        if (h["source_file"], h["row"]) not in d["_rows"]:  # a book is split over several rows
            d["_rows"].add((h["source_file"], h["row"]))
            d["doc_words"] += int(h.get("doc_words") or 0)
        d["windows"].append(h)
    return list(docs.values())


def _clean(v):
    return None if v in (None, "", "None", "null") else str(v)


# ---------------------------------------------------------------------------
# Source links
# ---------------------------------------------------------------------------

def source_url(doc: dict) -> str | None:
    ident = str(doc.get("identifier") or "")
    base = doc.get("base_identifier") or ident
    coll = doc.get("collection") or ""
    if ident.startswith("http"):
        return ident.split()[0]
    m = re.match(r"^(sn\d+|[a-z]{1,3}\d{6,})_(\d{4}-\d{2}-\d{2})_(\d+)_(\d+)", ident)
    if m:  # Chronicling America page: lccn_date_edition_seq
        return f"https://chroniclingamerica.loc.gov/lccn/{m[1]}/{m[2]}/ed-{m[3]}/seq-{m[4]}/"
    if base.startswith("bpt6k"):
        return f"https://gallica.bnf.fr/ark:/12148/{base}"
    if coll == "Gutenberg" and re.match(r"^\d+", base):
        return f"https://www.gutenberg.org/ebooks/{base.split('-')[0]}"
    if re.match(r"^[A-Za-z0-9][A-Za-z0-9._-]{4,}$", base) and not base.isdigit() and not base.startswith(("ost-", "darwin-online")):
        if coll in IA_COLLECTIONS:
            return f"https://archive.org/details/{base}"
    return None


IA_COLLECTIONS = {
    "English-PD", "US-PD-Books", "LoC-PD-Books", "French-PD-diverse", "German-PD", "Latin-PD", "Italian-PD",
    "Spanish-PD-Books", "Portuguese-PD", "Multilingual-PD", "Dutch-PD", "Greek-PD", "Polish-PD", "Czech-PD",
    "Russian-PD", "Catalan-PD",
}

# ---------------------------------------------------------------------------
# Novelty: already in the archive, or canonical
# ---------------------------------------------------------------------------

# Famous texts: shown but demoted. Patterns are matched against title + creator + best excerpt.
CANONICAL = [
    ("De Quincey, Confessions of an English Opium-Eater", r"de quincey|opium[- ]eater"),
    ("Baudelaire, Les Paradis artificiels", r"paradis artificiels|baudelaire"),
    ("Gautier, Le Club des Hachichins", r"club des hach?ich?ins|th[ée]ophile gautier"),
    ("Moreau de Tours, Du hachisch et de l'aliénation mentale", r"moreau de tours|du hachisch et de l.ali[ée]nation"),
    ("Ludlow, The Hasheesh Eater", r"hasheesh eater|fitz ?hugh ludlow"),
    ("Bayard Taylor on hasheesh", r"bayard taylor"),
    ("Davy, Researches … Nitrous Oxide", r"researches,? chemical and philosophical|humphry davy"),
    ("James, Varieties of Religious Experience", r"varieties of religious experience"),
    ("Blood, The Anaesthetic Revelation", r"benjamin paul blood|anaesthetic revelation and the gist"),
    ("Ellis, Mescal: A Study of a Divine Plant", r"havelock ellis|divine plant"),
    ("Weir Mitchell on mescal", r"weir mitchell"),
    ("Lewin, Phantastica", r"louis lewin|phantastica"),
    ("Huxley, The Doors of Perception", r"doors of perception|aldous huxley"),
    ("Mooney on the peyote cult", r"james mooney"),
    ("Coleridge, Kubla Khan / opium", r"kubla khan"),
    ("Rig Veda soma hymns", r"rig[- ]?veda"),
]
_CANON_RX = [(name, re.compile(p, re.I)) for name, p in CANONICAL]
STOP = set("the a an of and in on to for by with from at as la le les de des du et en el los las y der die das und von zu im".split())


def _norm_tokens(s: str | None) -> set[str]:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return {t for t in re.findall(r"[a-z0-9]{3,}", s) if t not in STOP}


def load_archive_index(repo: Path = REPO) -> list[dict]:
    """Titles/creators already in the archive: staged imports, drafts, bibliography."""
    out = []
    for f in repo.glob("data/*/documents.json"):
        try:
            for d in json.loads(f.read_text()):
                out.append({"title": d.get("title"), "creator": d.get("citation"), "year": d.get("date_start"), "where": f.parent.name})
        except Exception:
            continue
    for f in (repo / "data" / "draft-sources" / "sources").glob("*.json"):
        try:
            d = json.loads(f.read_text())
            out.append({"title": d.get("title"), "creator": d.get("author"), "year": d.get("year"), "where": "draft-sources"})
        except Exception:
            continue
    for f in list(repo.glob("data/*/bibliography_items.json")) + [repo / "data" / "bibliography-seed" / "items.json"]:
        if f.exists():
            for d in json.loads(f.read_text()):
                out.append({"title": d.get("title"), "creator": d.get("publication_title"), "year": d.get("year"), "where": "bibliography"})
    for r in out:
        r["tokens"] = _norm_tokens(r["title"])
    return [r for r in out if len(r["tokens"]) >= 2]


def novelty_flags(doc: dict, best_text: str, archive_index: list[dict]) -> list[dict]:
    flags = []
    hay = " ".join(filter(None, [doc.get("title"), doc.get("creator"), best_text[:1200]]))
    for name, rx in _CANON_RX:
        if rx.search(hay):
            flags.append({"type": "canonical", "match": name})
    toks = _norm_tokens(doc.get("title"))
    if len(toks) >= 2:
        for r in archive_index:
            inter = len(toks & r["tokens"])
            if inter >= 2 and inter / len(toks | r["tokens"]) >= 0.6:
                flags.append({"type": "in_archive", "match": f"{r['title']} ({r['where']})"})
                break
    return flags


# ---------------------------------------------------------------------------
# Reprint clustering (MinHash LSH over 5-word shingles of the best excerpt)
# ---------------------------------------------------------------------------

_P = (1 << 61) - 1
_RNG = np.random.default_rng(20261016)
_A = _RNG.integers(1, _P, 32, dtype=np.uint64)
_B = _RNG.integers(0, _P, 32, dtype=np.uint64)


def _signature(text: str) -> np.ndarray | None:
    words = re.findall(r"[a-z]{2,}", unicodedata.normalize("NFKD", text.lower()))
    mid = len(words) // 2
    words = words[max(0, mid - 60) : mid + 60]
    if len(words) < 12:
        return None
    sh = np.array([zlib.crc32(" ".join(words[i : i + 5]).encode()) for i in range(len(words) - 4)], dtype=np.uint64)
    with np.errstate(over="ignore"):
        return ((np.outer(_A, sh) + _B[:, None]) % _P).min(axis=1)


def cluster_reprints(cands: list[dict], bands: int = 8) -> list[dict]:
    """Merge near-duplicate candidates (Jaccard ≳ 0.5); keep the earliest, then longest, as representative."""
    sigs = {i: _signature(c["excerpts"][0]["text"]) for i, c in enumerate(cands)}
    rows = 32 // bands
    buckets = collections.defaultdict(list)
    for i, s in sigs.items():
        if s is not None:
            for b in range(bands):
                buckets[(b, s[b * rows : (b + 1) * rows].tobytes())].append(i)
    parent = list(range(len(cands)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for members in buckets.values():
        for j in members[1:]:
            a, b = find(members[0]), find(j)
            if a != b and (sigs[members[0]] == sigs[j]).mean() >= 0.5:
                parent[b] = a
    groups = collections.defaultdict(list)
    for i in range(len(cands)):
        groups[find(i)].append(cands[i])
    out = []
    for g in groups.values():
        g.sort(key=lambda c: (c.get("year") or 9999, -c["doc_words"]))
        rep = g[0]
        rep["reprints"] = {
            "count": len(g),
            "members": [{"identifier": c["identifier"], "year": c.get("year"), "collection": c["collection"], "source_url": c.get("source_url")} for c in g[1:51]],
        }
        out.append(rep)
    return out


# ---------------------------------------------------------------------------
# Bootstrap scores (no embeddings, no LLM)
# ---------------------------------------------------------------------------

FIRST_PERSON = re.compile(r"\b(?:I|me|my|myself|je|j.ai|moi|ich|mir|mich|yo|mí|io|eu)\b")
AD_CUES = re.compile(r"\$\s?\d|\bcents?\b|\bprice\b|\bfor sale\b|\bguarantee\w*|\bsold by\b|\bdruggists?\b|\bcure[sd]?\b|\bper (?:box|bottle|lb)\b|\bfrancs\b", re.I)
JUNK_TOKEN = re.compile(r"^[^\w]*$|[^\w'’.,;:!?()\-«»\"“”]{2,}")


def excerpt_list(doc: dict, limit: int = 4) -> list[dict]:
    ws = sorted(doc["windows"], key=_window_key, reverse=True)[:limit]
    out = []
    for w in ws:
        forms = {f for tier in ("strong_terms", "weak_terms", "context_terms") for fs in w[tier].values() for f in fs}
        out.append({"hit_id": w["hit_id"], "text": w["window"], "highlights": sorted(forms, key=len, reverse=True), "digit_frac": w.get("digit_frac", 0.0)})
    return out


def doc_terms(doc: dict) -> dict:
    t = {"strong": set(), "weak": set(), "context": set()}
    for w in doc["windows"]:
        t["strong"] |= set(w["strong_terms"])
        t["weak"] |= set(w["weak_terms"])
        t["context"] |= set(w["context_terms"])
    return {k: sorted(v) for k, v in t.items()}


REFERENCE_TITLE = re.compile(
    r"dictionar|dictionnaire|diccionario|dizionario|w[öo]rterbuch|lexi[ck]on|encyclop|cyclop[a]?edia|pharmacop|"
    r"materia medica|arzneimittel|therapeutics|formulary|dispensatory|catalog|index|handbook|manual|text-?book|"
    r"lehrbuch|trait[ée] de|annuaire|almanac|directory|report of the|proceedings|transactions", re.I)


def _window_key(w: dict):
    return (bool(w["strong_terms"]), w["score"], -w.get("digit_frac", 0))


def bootstrap_scores(c: dict) -> dict:
    """Heuristic scores from the best window, so breadth across a long reference book doesn't win."""
    best = c["excerpts"][0]
    best_w = max(c["_windows"], key=_window_key)
    text, words = best["text"], best["text"].split()
    n_strong = len(best_w["strong_terms"])
    strong_windows = sum(1 for w in c["_windows"] if w["strong_terms"])
    relevance = 0.25 + 0.2 * min(n_strong, 3) + (0.15 if best_w["context_terms"] else 0) + (0.1 if strong_windows >= 2 else 0)
    relevance -= 2.0 * max(0.0, best["digit_frac"] - 0.05)
    if not n_strong:
        relevance -= 0.2
    fp = len(FIRST_PERSON.findall(text)) / max(1, len(words)) * 100
    ads = len(AD_CUES.findall(text))
    reference = bool(REFERENCE_TITLE.search(c.get("title") or ""))
    kind = (0.4 + min(0.35, fp * 0.07) + (0.15 if len(c["_windows"]) >= 3 and not reference else 0)
            - (0.3 if ads >= 2 else 0) - (0.3 if best["digit_frac"] > 0.12 else 0) - (0.25 if reference else 0))
    flags = {f["type"] for f in c["novelty_flags"]}
    novelty = 0.15 if "in_archive" in flags else 0.5 if "canonical" in flags else 1.0
    junk = sum(1 for w in words if JUNK_TOKEN.search(w)) / max(1, len(words))
    feasibility = 0.45 + (0.3 if c.get("source_url") else 0) + (0.25 if c["doc_words"] >= 300 else 0) - (0.35 if junk > 0.2 else 0)
    s = {k: round(min(1.0, max(0.05, v)), 3) for k, v in
         {"relevance": relevance, "kind": kind, "novelty": novelty, "feasibility": feasibility}.items()}
    s["model_p"] = None
    s["priority"] = round(s["relevance"] * s["kind"] ** 0.7 * s["novelty"] ** 0.5 * s["feasibility"] ** 0.3, 4)
    s["first_person_per_100w"] = round(fp, 2)
    s["ocr_junk_frac"] = round(junk, 3)
    return s


# ---------------------------------------------------------------------------
# Build, queue, write
# ---------------------------------------------------------------------------

def build_candidates(run_dirs: list[Path], archive_index: list[dict] | None = None) -> list[dict]:
    archive_index = load_archive_index() if archive_index is None else archive_index
    docs = group_documents(h for r in run_dirs for h in iter_hits(r))
    cands = []
    for d in docs:
        windows = d.pop("windows")
        d.pop("_rows")
        d["_windows"] = windows
        d["excerpts"] = excerpt_list({"windows": windows})
        d["terms"] = doc_terms({"windows": windows})
        d["source_url"] = source_url(d)
        d["novelty_flags"] = novelty_flags(d, d["excerpts"][0]["text"], archive_index)
        d["llm"] = None
        cands.append(d)
    return cluster_reprints(cands)


def decade(c: dict) -> str:
    return f"{c['year'] // 10 * 10}s" if c.get("year") else "undated"


def stratum(c: dict) -> tuple:
    return (c.get("language") or "?", decade(c), (c["terms"]["strong"] or c["terms"]["weak"] or ["?"])[0])


def build_queue(cands: list[dict], decisions: dict[str, dict], n: int = 100, explore_frac: float = 0.2,
                seed: int = 1) -> list[dict]:
    """80% top priority; 20% from the middle of the ranking, preferring strata Ben has seen least."""
    pool = sorted((c for c in cands if c["candidate_id"] not in decisions), key=lambda c: -c["scores"]["priority"])
    n_explore = int(round(n * explore_frac))
    exploit = pool[: n - n_explore]
    for c in exploit:
        c["lane"], c["lane_reason"] = "exploit", "top priority" if c["scores"]["model_p"] is None else "top model score"
    middle = pool[len(exploit) : max(len(exploit) + 1, int(len(pool) * 0.8))]
    seen = collections.Counter(stratum(d["snapshot"]) for d in decisions.values() if "snapshot" in d and "terms" in d["snapshot"])
    rnd = random.Random(seed)
    rnd.shuffle(middle)
    by_stratum = collections.defaultdict(list)
    for c in middle:
        by_stratum[stratum(c)].append(c)
    explore = []
    while len(explore) < n_explore and any(by_stratum.values()):
        for key in sorted((k for k in by_stratum if by_stratum[k]), key=lambda k: (seen[k], rnd.random())):
            c = by_stratum[key].pop()
            c["lane"], c["lane_reason"] = "explore", f"under-reviewed: {key[0]}, {key[1]}, {key[2]}"
            explore.append(c)
            seen[key] += 1
            if len(explore) >= n_explore:
                break
    queue = exploit + explore
    rnd.shuffle(queue)  # don't let position reveal the lane
    for i, c in enumerate(queue, 1):
        c["rank"] = i
    return queue


def load_decisions(root: Path = CANDIDATE_ROOT) -> dict[str, dict]:
    """Latest decision per candidate_id."""
    p = root / "decisions.jsonl"
    out = {}
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if line.strip():
                d = json.loads(line)
                out[d["candidate_id"]] = d
    return out


def write_batch(batch: str, queue: list[dict], meta: dict, root: Path = CANDIDATE_ROOT) -> Path:
    out = root / "candidates" / batch
    out.mkdir(parents=True, exist_ok=True)
    keep = ["candidate_id", "batch", "rank", "lane", "lane_reason", "dataset", "collection", "revision", "identifier",
            "source_file", "row", "title", "creator", "year", "date", "language", "page", "edition", "doc_words",
            "source_url", "reprints", "terms", "excerpts", "novelty_flags", "scores", "llm"]
    tmp = out / "candidates.jsonl.tmp"
    with tmp.open("w", encoding="utf-8") as fh:
        for c in sorted(queue, key=lambda c: c["rank"]):
            c["batch"] = batch
            fh.write(json.dumps({k: c.get(k) for k in keep}, ensure_ascii=False) + "\n")
    tmp.replace(out / "candidates.jsonl")
    (out / "batch.json").write_text(json.dumps({"batch": batch, "created_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                                                "n": len(queue), **meta}, indent=1))
    return out
