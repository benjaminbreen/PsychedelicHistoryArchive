#!/usr/bin/env python3
"""Term-filtered full-text scan of Common Corpus / PleIAs parquet files.

For every hit on a strong term (or a weak term with a strong or visionary
context term nearby), write a ~300-word excerpt centred on the hit, with the
row's identifier, collection, date, page and the dataset file and revision.

Two passes per file:
  1. DuckDB (RE2, multithreaded) keeps only rows whose text could match:
     strong OR (weak AND context). This pass is a superset of pass 2.
  2. Python `re` finds exact matches, applies min_year and proximity rules,
     and cuts merged excerpt windows.

Inputs are either local parquet files/globs or a Hugging Face dataset repo at
a pinned revision. Progress is resumable: each finished input is listed in
<out>/done.txt and its outputs are written atomically, so rerunning the same
command skips finished files. With --delete-after, each input file is deleted
once its outputs are safely written (use it for downloaded HF files).

Examples:
  # local test
  python scan_parquet.py --out runs/local ~/Code/CommonCorpusSample/culture/*.parquet

  # cloud: one HF dataset at a pinned commit, downloading and deleting as it goes
  python scan_parquet.py --out runs/us-pd-newspapers \
      --hf-repo PleIAs/US-PD-Newspapers --revision <sha> \
      --download-dir /data/dl --delete-after --workers 14
"""

from __future__ import annotations

import argparse
import bisect
import concurrent.futures as cf
import fnmatch
import gzip
import json
import os
import re
import sys
import time
import tomllib
from dataclasses import dataclass
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_TERMS = HERE / "terms.toml"

# Column aliases across the 2024 per-collection releases and common_corpus.
COLUMN_ALIASES = {
    "identifier": ["identifier", "id", "file_id", "doc_id", "document_id"],
    "file_name": ["file_name", "file"],
    "collection": ["collection", "dataset", "source"],
    "date": ["date", "publication_date", "start_date", "year", "issue_date", "pub_date", "datetime"],
    "title": ["title", "newspaper", "lccn_title", "name"],
    "creator": ["creator", "author", "authors", "publisher"],
    "language": ["language", "lang"],
    "page": ["page", "page_number", "page_num", "seq"],
    "edition": ["edition"],
    "open_type": ["open_type"],
    "license": ["license"],
    "word_count": ["word_count"],
    "text": ["text", "complete_text", "content", "body"],
}

YEAR_RE = re.compile(r"(1[0-9]{3}|20[0-9]{2})")
WORD_RE = re.compile(r"\S+")
CHARS_PER_WORD = 6.5  # approximation used for proximity checks


# ---------------------------------------------------------------------------
# Terms
# ---------------------------------------------------------------------------


@dataclass
class Term:
    idx: int
    label: str
    tier: str
    group: str
    patterns: list[str]
    case_sensitive: bool = False
    min_year: int | None = None
    require_year: bool = False
    needs: str = "any"  # weak terms: "any" (strong or context nearby) or "strong"


def load_terms(path: Path) -> tuple[list[Term], dict]:
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    terms = []
    for i, t in enumerate(data["term"]):
        if t["tier"] not in {"strong", "weak", "context"}:
            raise ValueError(f"bad tier for {t['label']}: {t['tier']}")
        if t.get("needs", "any") not in {"any", "strong"}:
            raise ValueError(f"bad needs for {t['label']}: {t['needs']}")
        terms.append(
            Term(
                idx=i,
                label=t["label"],
                tier=t["tier"],
                group=t.get("group", ""),
                patterns=list(t["patterns"]),
                case_sensitive=bool(t.get("case_sensitive", False)),
                min_year=t.get("min_year"),
                require_year=bool(t.get("require_year", False)),
                needs=t.get("needs", "any"),
            )
        )
    return terms, data.get("settings", {})


def _alt(term: Term, patterns: list[str]) -> str:
    body = "|".join(f"(?:{p})" for p in patterns)
    return f"(?-i:{body})" if term.case_sensitive else body


def build_python_regex(terms: list[Term]) -> re.Pattern:
    parts = [f"(?P<t{t.idx}>{_alt(t, t.patterns)})" for t in terms]
    return re.compile("|".join(parts), re.IGNORECASE)


class Matcher:
    """Exact term matches in a text.

    With google-re2 installed, one RE2 alternation (a superset of the term
    patterns) finds candidates in linear time and each candidate is verified
    with that term's Python regex, which keeps Unicode word boundaries and
    lookaheads. Without it, falls back to the combined Python regex, which is
    roughly 20x slower on long books.
    """

    def __init__(self, terms: list[Term]):
        self.terms = terms
        self.per_term = [re.compile(_alt(t, t.patterns), re.IGNORECASE) for t in terms]
        try:
            import re2  # type: ignore

            opts = re2.Options()
            opts.max_mem = 512 << 20
            opts.case_sensitive = False
            parts = [f"(?P<t{t.idx}>{_alt(t, [to_re2(p) for p in t.patterns])})" for t in terms]
            self.re2 = re2.compile("|".join(parts), opts)
        except ImportError:
            self.re2 = None
            self.py = build_python_regex(terms)

    def finditer(self, text: str):
        """Yield (start, end, term, surface) in text order."""
        if self.re2 is None:
            for m in self.py.finditer(text):
                yield m.start(), m.end(), self.terms[int(m.lastgroup[1:])], m.group(0)
            return
        for m in self.re2.finditer(text):
            idx = int(m.lastgroup[1:])
            v = self.per_term[idx].match(text, m.start())
            if v and v.end() > v.start():
                yield v.start(), v.end(), self.terms[idx], v.group(0)


def _strip_lookarounds(p: str) -> str:
    """Remove (?=...) / (?!...) groups (unsupported by RE2); result is a superset."""
    out, i = [], 0
    while i < len(p):
        if p.startswith(("(?=", "(?!", "(?<=", "(?<!"), i) and (i == 0 or p[i - 1] != "\\"):
            depth, j = 0, i
            while j < len(p):
                if p[j] == "\\":
                    j += 2
                    continue
                if p[j] == "(":
                    depth += 1
                elif p[j] == ")":
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            i = j + 1
            continue
        out.append(p[i])
        i += 1
    return "".join(out)


def to_re2(p: str) -> str:
    """Translate one term pattern into an RE2 pattern that matches a superset."""
    p = _strip_lookarounds(p)
    # Unicode classes blow RE2's program-size limit, so \w becomes \S (a superset).
    # RE2's \b is ASCII-only, which is a superset of Python's Unicode \b only
    # when the neighbouring pattern character is an ASCII letter or digit; keep
    # it there and drop it elsewhere. Matches are verified in Python anyway.
    p = p.replace(r"\w", r"\S")
    lead = p.startswith(r"\b") and re.match(r"[A-Za-z0-9]", p[2:3]) is not None
    if p.startswith(r"\b"):
        p = p[2:]
    trail = p.endswith(r"\b") and re.match(r"[A-Za-z0-9]", p[-3:-2]) is not None and p[-4:-3] != "\\"
    if p.endswith(r"\b") and p[-3:-2] != "\\":
        p = p[:-2]
    p = p.replace(r"\b", "")  # interior boundaries: drop
    return (r"\b" if lead else "") + p + (r"\b" if trail else "")


def build_re2(terms: list[Term], tier: str, chunk: int = 60) -> list[str]:
    """RE2 alternations for one tier, split into chunks small enough to compile."""
    pats = []
    for t in terms:
        if t.tier == tier:
            pats += [f"(?-i:{to_re2(p)})" if t.case_sensitive else to_re2(p) for p in t.patterns]
    return ["|".join(f"(?:{p})" for p in pats[i : i + chunk]) for i in range(0, len(pats), chunk)]


# ---------------------------------------------------------------------------
# Per-row matching and windows
# ---------------------------------------------------------------------------


def row_year(value) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value if 1000 <= value <= 2100 else None
    m = YEAR_RE.search(str(value))
    return int(m.group(1)) if m else None


def window_bounds(text: str, start: int, end: int, half_words: int) -> tuple[int, int]:
    span = int(half_words * 14)
    left = text[max(0, start - span) : start]
    lw = [m.start() for m in WORD_RE.finditer(left)]
    lo = max(0, start - span) + (lw[-half_words] if len(lw) >= half_words else (lw[0] if lw else len(left)))
    right = text[end : end + span]
    rw = [m.end() for m in WORD_RE.finditer(right)]
    hi = end + (rw[half_words - 1] if len(rw) >= half_words else (rw[-1] if rw else 0))
    return lo, hi


def scan_text(text: str, year: int | None, matcher: Matcher, settings: dict) -> tuple[list[dict], int]:
    prox = int(settings.get("proximity_words", 60) * CHARS_PER_WORD)
    half = int(settings.get("window_words", 300)) // 2
    cap = int(settings.get("max_windows_per_doc", 25))

    matches = []  # (start, end, term, surface)
    for s, e, t, surf in matcher.finditer(text):
        if t.min_year and (year < t.min_year if year is not None else t.require_year):
            continue
        matches.append((s, e, t, surf))
    if not matches:
        return [], 0

    anchors = {
        "any": [s for s, _, t, _ in matches if t.tier in ("strong", "context")],
        "strong": [s for s, _, t, _ in matches if t.tier == "strong"],
    }
    hits = []
    for s, e, t, surf in matches:
        if t.tier == "strong":
            hits.append((s, e, t, surf))
        elif t.tier == "weak":
            near = anchors[t.needs]
            k = bisect.bisect_left(near, s - prox)
            if k < len(near) and near[k] <= e + prox:
                hits.append((s, e, t, surf))
    if not hits:
        return [], 0

    windows = []
    cur = None
    for s, e, t, surf in hits:
        if cur and s < cur["hi"]:
            continue  # covered by current window
        lo, hi = window_bounds(text, s, e, half)
        cur = {"lo": lo, "hi": hi, "anchor": (s, e, t, surf)}
        windows.append(cur)

    starts = [m[0] for m in matches]
    out = []
    for w in windows:
        a, b = bisect.bisect_left(starts, w["lo"]), bisect.bisect_left(starts, w["hi"])
        inside = matches[a:b]
        by_tier: dict[str, dict[str, list[str]]] = {"strong": {}, "weak": {}, "context": {}}
        for _, _, t, surf in inside:
            forms = by_tier[t.tier].setdefault(t.label, [])
            if surf.lower() not in forms and len(forms) < 5:
                forms.append(surf.lower())
        s, e, t, surf = w["anchor"]
        n_strong, n_weak, n_ctx = (len(by_tier[k]) for k in ("strong", "weak", "context"))
        tokens = text[w["lo"] : w["hi"]].split()
        out.append(
            {
                "char_start": w["lo"],
                "char_end": w["hi"],
                "anchor_term": t.label,
                "anchor_tier": t.tier,
                "anchor_text": surf,
                "strong_terms": by_tier["strong"],
                "weak_terms": by_tier["weak"],
                "context_terms": by_tier["context"],
                "matched_terms": sorted(set(by_tier["strong"]) | set(by_tier["weak"])),
                "score": 3 * n_strong + n_weak + n_ctx,
                # share of tokens containing a digit: high for indexes, price lists, tables
                "digit_frac": round(sum(any(c.isdigit() for c in tok) for tok in tokens) / max(1, len(tokens)), 3),
                "window": " ".join(tokens),
            }
        )
    total = len(out)
    if total > cap:
        keep = sorted(out, key=lambda r: (r["anchor_tier"] != "strong", -r["score"], r["char_start"]))[:cap]
        out = sorted(keep, key=lambda r: r["char_start"])
    return out, total


# ---------------------------------------------------------------------------
# File processing (runs in worker processes)
# ---------------------------------------------------------------------------

_W: dict = {}


def _init_worker(terms_path: str, duck_threads: int) -> None:
    terms, settings = load_terms(Path(terms_path))
    _W.update(
        terms=terms,
        settings=settings,
        matcher=Matcher(terms),
        strong=build_re2(terms, "strong"),
        weak=build_re2(terms, "weak"),
        context=build_re2(terms, "context"),
        duck_threads=duck_threads,
    )


def _sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def process_file(local_path: str, meta: dict, out_dir: str, where: str | None) -> dict:
    import duckdb

    t0 = time.time()
    settings, matcher = _W["settings"], _W["matcher"]
    con = duckdb.connect()
    con.execute(f"SET threads = {_W['duck_threads']}")
    src = f"read_parquet({_sql_str(local_path)}, file_row_number = true)"
    cols = {r[0] for r in con.execute(f"DESCRIBE SELECT * FROM {src}").fetchall()}

    def pick(key: str) -> str | None:
        return next((c for c in COLUMN_ALIASES[key] if c in cols), None)

    text_col = pick("text")
    if not text_col:
        raise RuntimeError(f"{local_path}: no text column among {sorted(cols)}")
    select = [f'file_row_number AS "_row"']
    for key in COLUMN_ALIASES:
        if key == "text":
            continue
        c = pick(key)
        select.append(f'CAST("{c}" AS VARCHAR) AS "{key}"' if c else f'NULL AS "{key}"')
    select.append(f'"{text_col}" AS "text"')

    t = f'"{text_col}"'

    def any_of(chunks: list[str]) -> str:
        return "(" + " OR ".join(f"regexp_matches({t}, {_sql_str(c)}, 'i')" for c in chunks) + ")"

    cond = f"({any_of(_W['strong'])} OR ({any_of(_W['weak'])} AND {any_of(_W['context'])}))"
    if where:
        cond = f"({where}) AND {cond}"
    total_rows = con.execute(f"SELECT count(*) FROM {src}" + (f" WHERE {where}" if where else "")).fetchone()[0]
    reader = con.execute(f"SELECT {', '.join(select)} FROM {src} WHERE {t} IS NOT NULL AND {cond}").fetch_record_batch(512)

    rel = meta["path"]
    safe = rel.replace("/", "__")
    out_path = Path(out_dir) / "hits" / meta["dataset_slug"] / (safe + ".jsonl.gz")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    tmp = out_path.with_suffix(".tmp")
    stats = {"file": rel, "rows": total_rows, "prefiltered_rows": 0, "hit_rows": 0, "windows": 0,
             "windows_before_cap": 0, "per_term": {}}
    with gzip.open(tmp, "wt", encoding="utf-8") as fh:
        for batch in reader:
            for row in batch.to_pylist():
                stats["prefiltered_rows"] += 1
                text = row.pop("text") or ""
                year = row_year(row.get("date"))
                wins, total = scan_text(text, year, matcher, settings)
                if not wins:
                    continue
                stats["hit_rows"] += 1
                stats["windows_before_cap"] += total
                base = {
                    "dataset": meta["dataset"],
                    "revision": meta.get("revision"),
                    "source_file": rel,
                    "row": row.pop("_row"),
                    "collection": row.get("collection") or meta["dataset"],
                    "year": year,
                    **{k: v for k, v in row.items() if k != "collection"},
                    "doc_words": len(text.split()) if row.get("word_count") is None else int(row["word_count"]),
                    "doc_windows": total,
                }
                for i, w in enumerate(wins):
                    rec = {"hit_id": f"{meta['dataset_slug']}:{safe}:{base['row']}:{w['char_start']}", **base, **w}
                    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    stats["windows"] += 1
                    for lab in w["matched_terms"]:
                        stats["per_term"][lab] = stats["per_term"].get(lab, 0) + 1
    os.replace(tmp, out_path)
    stats["seconds"] = round(time.time() - t0, 1)
    stats_path = Path(out_dir) / "stats" / meta["dataset_slug"] / (safe + ".json")
    stats_path.parent.mkdir(parents=True, exist_ok=True)
    stats_path.write_text(json.dumps(stats, indent=1))
    con.close()
    return stats


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------


def slugify(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()


def list_inputs(args) -> list[dict]:
    if args.hf_repo:
        from huggingface_hub import HfApi

        files = HfApi().list_repo_files(args.hf_repo, repo_type="dataset", revision=args.revision)
        files = sorted(f for f in files if f.endswith(".parquet") and any(fnmatch.fnmatch(f, g) for g in args.include))
        ds = args.dataset or args.hf_repo.split("/")[-1]
        return [{"path": f, "dataset": ds, "dataset_slug": slugify(ds), "revision": args.revision, "hf": True} for f in files]
    items = []
    for p in args.inputs:
        path = Path(p).expanduser()
        ds = args.dataset or path.parent.name
        items.append({"path": str(path), "dataset": ds, "dataset_slug": slugify(ds), "revision": args.revision, "hf": False})
    return items


def fetch(item: dict, args) -> str:
    if not item["hf"]:
        return item["path"]
    from huggingface_hub import hf_hub_download

    for attempt in range(5):
        try:
            return hf_hub_download(args.hf_repo, item["path"], repo_type="dataset", revision=args.revision,
                                   local_dir=args.download_dir)
        except Exception as exc:  # network hiccups: back off and retry
            if attempt == 4:
                raise
            print(f"download retry {attempt + 1} for {item['path']}: {exc}", file=sys.stderr, flush=True)
            time.sleep(10 * (attempt + 1))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inputs", nargs="*", help="local parquet files (ignored with --hf-repo)")
    ap.add_argument("--out", required=True, help="output directory (hits/, stats/, done.txt, errors.txt)")
    ap.add_argument("--terms", default=str(DEFAULT_TERMS))
    ap.add_argument("--hf-repo", help="HF dataset repo, e.g. PleIAs/US-PD-Newspapers")
    ap.add_argument("--revision", help="pinned commit SHA (recorded in every hit)")
    ap.add_argument("--include", action="append", default=None, help="glob over repo paths (repeatable)")
    ap.add_argument("--dataset", help="dataset label for output (default: repo name or parent folder)")
    ap.add_argument("--download-dir", default="/tmp/corpus_scan_dl")
    ap.add_argument("--delete-after", action="store_true", help="delete each input after its outputs are written")
    ap.add_argument("--where", help="extra SQL predicate, e.g. \"open_type = 'Open Government'\"")
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    ap.add_argument("--duck-threads", type=int, default=2, help="DuckDB threads per worker")
    ap.add_argument("--prefetch", type=int, default=4, help="concurrent downloads (HF mode)")
    ap.add_argument("--limit", type=int, help="process at most N files (testing)")
    args = ap.parse_args()
    args.include = args.include or ["*"]
    if args.hf_repo and not args.revision:
        ap.error("--hf-repo needs --revision (pin a commit SHA)")
    if args.delete_after and not args.hf_repo and os.environ.get("CORPUS_SCAN_ALLOW_LOCAL_DELETE") != "1":
        ap.error("--delete-after on local inputs requires CORPUS_SCAN_ALLOW_LOCAL_DELETE=1")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    done_path = out / "done.txt"
    done = set(filter(None, done_path.read_text().splitlines())) if done_path.exists() else set()
    items = [it for it in list_inputs(args) if it["path"] not in done]
    if args.limit:
        items = items[: args.limit]
    (out / "run.json").write_text(json.dumps({k: v for k, v in vars(args).items()}, indent=1, default=str))
    print(f"{len(items)} files to scan ({len(done)} already done)", flush=True)

    t0 = time.time()
    n_done = rows = windows = 0
    with cf.ThreadPoolExecutor(args.prefetch) as dl, cf.ProcessPoolExecutor(
        args.workers, initializer=_init_worker, initargs=(args.terms, args.duck_threads)
    ) as pool:
        pending_dl = {dl.submit(fetch, it, args): it for it in items[: args.prefetch + args.workers]}
        queue = items[args.prefetch + args.workers :]
        running: dict[cf.Future, tuple[dict, str]] = {}
        while pending_dl or running:
            done_now, _ = cf.wait(list(pending_dl) + list(running), return_when=cf.FIRST_COMPLETED)
            for fut in done_now:
                if fut in pending_dl:
                    it = pending_dl.pop(fut)
                    try:
                        local = fut.result()
                    except Exception as exc:
                        with open(out / "errors.txt", "a") as fh:
                            fh.write(f"{it['path']}\tdownload\t{exc}\n")
                        continue
                    running[pool.submit(process_file, local, it, str(out), args.where)] = (it, local)
                else:
                    it, local = running.pop(fut)
                    try:
                        st = fut.result()
                    except Exception as exc:
                        with open(out / "errors.txt", "a") as fh:
                            fh.write(f"{it['path']}\tscan\t{exc!r}\n")
                        print(f"ERROR {it['path']}: {exc!r}", flush=True)
                        continue
                    with open(done_path, "a") as fh:
                        fh.write(it["path"] + "\n")
                    if args.delete_after:
                        Path(local).unlink(missing_ok=True)
                    n_done += 1
                    rows += st["rows"]
                    windows += st["windows"]
                    el = time.time() - t0
                    print(f"[{n_done}/{len(items)}] {it['path']}: {st['rows']} rows, {st['prefiltered_rows']} prefiltered, "
                          f"{st['windows']} windows, {st['seconds']}s | total {rows} rows, {windows} windows, "
                          f"{el / 60:.1f} min", flush=True)
                # keep the download queue topped up, bounded so disk use stays small
                while queue and len(pending_dl) + len(running) < args.prefetch + args.workers:
                    nxt = queue.pop(0)
                    pending_dl[dl.submit(fetch, nxt, args)] = nxt
    print(f"finished: {n_done} files, {rows} rows, {windows} windows in {(time.time() - t0) / 60:.1f} min", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
