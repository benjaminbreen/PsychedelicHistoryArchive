#!/usr/bin/env python3
"""Optional offline export of labelled candidates as a sortable HTML page and CSV.

Review normally happens in /admin/candidates (docs/corpus-scan/candidate-review.md).
This export is for sharing a snapshot outside the CMS, for example with
co-editors. It reads a pool (data/corpus-scan/pool/<name>.jsonl.gz) or a
batch (data/corpus-scan/candidates/<name>/candidates.jsonl), keeps candidates
whose `llm.archive_fit` >= --min-fit (default 4), and writes:
  <out>.csv    one row per candidate, for a spreadsheet
  <out>.html   self-contained page: sortable columns, text filter, excerpts
               with matched terms highlighted, and links to the source

The source link is the candidate's `source_url`, or else one derived from
the identifier: Chronicling America (loc.gov), Gallica, Internet Archive,
BNE Digital, Papers Past, ANNO, Gutenberg, Wikisource, the Deutsche Digitale
Bibliothek or LoC catalogue records.

  python export_review.py --pool local-embed-test --out /tmp/review
  python export_review.py --batch local-embed-test --min-fit 3
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
import sys
from pathlib import Path

import candidates as C
from postscan_common import read_jsonl
from rank_hits import POOL_ROOT

CHRON_AM = re.compile(r"^((?:sn|[a-z]{2})\d{6,10})_(\d{4}-\d{2}-\d{2})_(\d+)_(\d+)(?:_\d+)?$")
GALLICA = re.compile(r"(bpt6k[0-9a-z]+|btv1b[0-9a-z]+)", re.I)
PAPERS_PAST = re.compile(r"^([A-Z]+)/\d{4}/[A-Z]+_(\d{8})/MM_\d+/0*(\d+)\.xml")
DDB = re.compile(r"^([A-Z0-9]{32})(?:-|_|$)")
IA_COLLECTIONS = {"English-PD", "German-PD", "French-PD-diverse", "Latin-PD", "Italian-PD", "Spanish-PD-Books",
                  "Portuguese-PD", "US-PD-Books", "Multilingual-PD", "Dutch-PD", "Polish-PD", "Greek-PD"}


def clean(v) -> str:
    return "" if v in (None, "None", "") else str(v)


def source_link(h: dict) -> tuple[str, str]:
    """(url, label) for a hit, or ("", "") when the identifier is not recognised."""
    ident = clean(h.get("identifier")).strip()
    coll = clean(h.get("collection"))
    if not ident:
        return "", ""
    if m := CHRON_AM.match(ident):
        lccn, date, ed, seq = m.groups()
        return f"https://www.loc.gov/resource/{lccn}/{date}/ed-{int(ed)}/?sp={int(seq)}&st=text", "Chronicling America"
    if m := GALLICA.search(ident):
        return f"https://gallica.bnf.fr/ark:/12148/{m.group(1)}", "Gallica"
    if m := PAPERS_PAST.match(ident):
        code, date, page = m.groups()
        return f"https://paperspast.natlib.govt.nz/newspapers/{code}{date}.1.{int(page)}", "Papers Past"
    if ident.startswith("http"):
        url = ident.split()[0]
        if "wikisource.org" in url:
            return url.replace(" ", "_"), "Wikisource"
        if "persist.lu" in url:
            return re.sub(r"_\d+$", "", url), "eluxemburgensia"
        return url, url.split("/")[2]
    if coll == "Gutenberg" and (m := re.match(r"^(\d+)-", ident)):
        return f"https://www.gutenberg.org/ebooks/{m.group(1)}", "Project Gutenberg"
    if coll == "Anno" and (m := re.match(r"^([a-z]+)(\d{8})$", ident)):
        return f"https://anno.onb.ac.at/cgi-content/anno?aid={m.group(1)}&datum={m.group(2)}", "ANNO"
    if coll == "LoC-PD-Books" and (m := re.match(r"^(\d{8,10})_\d+$", ident)):
        return f"https://lccn.loc.gov/{m.group(1)}", "LoC catalogue"
    if coll.startswith("Spanish-PD") and (m := re.match(r"^(\d{10})_\d+$", ident)):
        return f"https://bnedigital.bne.es/bd/card?oid={m.group(1)}&site=bdh", "BNE Digital"
    if coll.startswith("Deutsches Zeitungsportal") and (m := DDB.match(ident)):
        return f"https://www.deutsche-digitale-bibliothek.de/newspaper/item/{m.group(1)}", "Deutsches Zeitungsportal"
    if coll in IA_COLLECTIONS or re.match(r"^[a-z0-9_.-]+_\d+$", ident):
        base = re.sub(r"_\d+$", "", ident)  # common_corpus appends a part number
        if re.match(r"^[A-Za-z0-9_.-]+$", base) and not base.isdigit():
            return f"https://archive.org/details/{base}", "Internet Archive"
    return "", ""


def highlight(window: str, terms: list[str]) -> str:
    text = html.escape(window)
    forms = sorted({html.escape(t) for t in terms if t and len(t) > 1}, key=len, reverse=True)
    if not forms:
        return text
    rx = re.compile("|".join(re.escape(f) for f in forms), re.IGNORECASE)
    return rx.sub(lambda m: f"<mark>{m.group(0)}</mark>", text)


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Corpus Scan Review</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1b18;--muted:#6b665d;--line:#e2ddd3;--card:#fff;--accent:#7a3e9d;--mark:#f6e3a1;--chip:#efeae0}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#171614;--fg:#ece8e1;--muted:#a39d92;--line:#34312c;--card:#201e1b;--accent:#c39be0;--mark:#5c4d1c;--chip:#2c2925}}
:root[data-theme=dark]{--bg:#171614;--fg:#ece8e1;--muted:#a39d92;--line:#34312c;--card:#201e1b;--accent:#c39be0;--mark:#5c4d1c;--chip:#2c2925}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 Georgia,'Iowan Old Style',serif}
header{padding:20px 16px 8px;max-width:1400px;margin:auto}h1{margin:0 0 4px;font-size:22px}
.sub{color:var(--muted);font:13px/1.4 system-ui,sans-serif}
.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;font:13px system-ui,sans-serif}
.controls input,.controls select{padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg);font:inherit}
.controls input{flex:1;min-width:200px}
main{max-width:1400px;margin:auto;padding:0 16px 40px;overflow-x:auto}
table{border-collapse:collapse;width:100%;font:13px/1.4 system-ui,sans-serif}
th{position:sticky;top:0;background:var(--bg);text-align:left;border-bottom:2px solid var(--line);padding:6px;cursor:pointer;white-space:nowrap;user-select:none}
th.sorted::after{content:attr(data-dir);color:var(--accent);margin-left:4px}
td{border-bottom:1px solid var(--line);padding:8px 6px;vertical-align:top}
td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.fit{display:inline-block;min-width:22px;text-align:center;border-radius:4px;padding:1px 4px;background:var(--chip);font-weight:600}
.fit5{background:var(--accent);color:var(--bg)}
.chip{display:inline-block;background:var(--chip);border-radius:10px;padding:0 7px;margin:1px 2px 1px 0;font-size:12px}
.title{font-family:Georgia,serif;font-size:14px}.muted{color:var(--muted)}
details summary{cursor:pointer;color:var(--accent)}details p{font:14px/1.5 Georgia,serif;max-width:80ch;white-space:pre-wrap}
mark{background:var(--mark);color:inherit}a{color:var(--accent)}
.flag{color:#b5651d;font-size:12px}
</style></head><body>
<header><h1>Corpus Scan Review</h1>
<div class="sub">__SUBTITLE__</div>
<div class="controls"><input id="q" type="search" placeholder="Filter by any text (title, summary, substance, collection…)">
<select id="kind"><option value="">All kinds</option>__KINDS__</select>
<select id="fit"><option value="">Any fit</option><option value="5">Fit 5 only</option></select></div>
<div class="sub" id="count"></div></header>
<main><table id="t"><thead><tr>
<th data-k="fit" data-t="n">Fit</th><th data-k="score" data-t="n">Score</th><th data-k="year" data-t="n">Year</th>
<th data-k="collection">Collection</th><th data-k="title">Source</th><th data-k="kind">Kind</th>
<th>Summary and excerpt</th><th data-k="ocr">OCR</th></tr></thead><tbody></tbody></table></main>
<script>
const ROWS=__ROWS__;
const tb=document.querySelector('#t tbody');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function row(r){return `<tr><td class="num"><span class="fit fit${r.fit}">${r.fit}</span></td><td class="num">${r.score.toFixed(3)}</td>
<td class="num">${esc(r.date||r.year||'')}</td><td>${esc(r.collection)}<div class="muted">${esc(r.language)}</div></td>
<td><div class="title">${esc(r.title||'(untitled)')}</div><div class="muted">${esc(r.creator)}</div>
<div>${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.link_label)}</a> · `:''}<span class="muted">${esc(r.identifier)}</span></div>
${r.in_archive?'<div class="flag">close match to an archive text</div>':''}${r.n_copies>1?`<div class="muted">${r.n_copies} reprints in scan</div>`:''}</td>
<td>${esc(r.kind.replace(/_/g,' '))}<div>${r.substances.map(s=>`<span class="chip">${esc(s)}</span>`).join('')}</div></td>
<td><div>${esc(r.summary)}</div><div class="muted">${esc(r.why_notable)}</div>
<details><summary>Excerpt</summary><p>${r.excerpt_html}</p><div class="muted">nearest archive seed: ${esc(r.nearest_seed_title)} · terms: ${esc(r.terms)}</div></details></td>
<td>${esc(r.ocr)}</td></tr>`}
let sortK='fit',dir=-1;
function render(){const q=document.getElementById('q').value.toLowerCase(),k=document.getElementById('kind').value,f=document.getElementById('fit').value;
const rs=ROWS.filter(r=>(!k||r.kind===k)&&(!f||String(r.fit)===f)&&(!q||r.search.includes(q)));
const num=document.querySelector(`th[data-k="${sortK}"]`).dataset.t==='n';
rs.sort((a,b)=>{let x=a[sortK],y=b[sortK];if(num){x=+x||0;y=+y||0;return dir*(x-y)||(b.score-a.score)}return dir*String(x).localeCompare(String(y))});
tb.innerHTML=rs.map(row).join('');document.getElementById('count').textContent=`${rs.length} of ${ROWS.length} items`;
document.querySelectorAll('th').forEach(th=>{th.classList.toggle('sorted',th.dataset.k===sortK);th.dataset.dir=dir>0?'▲':'▼'})}
document.querySelectorAll('th[data-k]').forEach(th=>th.onclick=()=>{if(sortK===th.dataset.k)dir=-dir;else{sortK=th.dataset.k;dir=th.dataset.t==='n'?-1:1}render()});
['q','kind','fit'].forEach(id=>document.getElementById(id).oninput=render);render();
</script></body></html>
"""

CSV_FIELDS = ["archive_fit", "priority", "relevance", "year", "date", "collection", "language", "title", "creator",
              "kind", "substances", "pitch", "ocr_quality", "source_url", "identifier", "reprint_count",
              "novelty_flags", "lane", "candidate_id", "excerpt"]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--pool", help="pool name under data/corpus-scan/pool/")
    src.add_argument("--batch", help="batch name under data/corpus-scan/candidates/")
    ap.add_argument("--min-fit", type=int, default=4)
    ap.add_argument("--out", help="output path stem (default: data/corpus-scan/exports/<name>)")
    args = ap.parse_args()

    name = args.pool or args.batch
    path = POOL_ROOT / f"{name}.jsonl.gz" if args.pool else C.CANDIDATE_ROOT / "candidates" / name / "candidates.jsonl"
    cands = read_jsonl(path)
    labelled = [c for c in cands if c.get("llm")]
    items = [c for c in labelled if c["llm"].get("archive_fit", 0) >= args.min_fit and c.get("excerpts")]
    items.sort(key=lambda c: (-c["llm"]["archive_fit"], -c["scores"]["priority"]))

    stem = Path(args.out) if args.out else C.CANDIDATE_ROOT / "exports" / name
    stem.parent.mkdir(parents=True, exist_ok=True)
    rows, csv_rows = [], []
    for c in items:
        llm, sc, ex = c["llm"], c["scores"], c["excerpts"][0]
        url, label = (c["source_url"], "Source") if c.get("source_url") else source_link(c)
        flags = "; ".join(f"{f['type']}: {f.get('match', '')}" for f in c.get("novelty_flags") or [])
        n_rep = (c.get("reprints") or {}).get("count", 1)
        csv_rows.append({
            "archive_fit": llm["archive_fit"], "priority": sc["priority"], "relevance": sc["relevance"],
            "year": c.get("year") or "", "date": clean(c.get("date")), "collection": c.get("collection"),
            "language": clean(c.get("language")), "title": clean(c.get("title")), "creator": clean(c.get("creator")),
            "kind": llm["kind"], "substances": "; ".join(llm.get("substances") or []), "pitch": llm.get("pitch", ""),
            "ocr_quality": llm.get("ocr_quality"), "source_url": url, "identifier": c.get("identifier"),
            "reprint_count": n_rep, "novelty_flags": flags, "lane": c.get("lane") or "",
            "candidate_id": c["candidate_id"], "excerpt": ex["text"]})
        r = {"fit": llm["archive_fit"], "score": sc["priority"], "year": c.get("year") or "", "date": clean(c.get("date")),
             "collection": c.get("collection") or "", "language": clean(c.get("language")),
             "title": clean(c.get("title")), "creator": clean(c.get("creator")), "identifier": c.get("identifier") or "",
             "url": url, "link_label": label, "kind": llm["kind"], "substances": llm.get("substances") or [],
             "summary": llm.get("pitch", ""), "why_notable": flags, "ocr": llm.get("ocr_quality", ""),
             "in_archive": any(f["type"] == "in_archive" for f in c.get("novelty_flags") or []), "n_copies": n_rep,
             "nearest_seed_title": (c.get("nearest_seed") or {}).get("title", ""),
             "terms": ", ".join(c["terms"]["strong"] + c["terms"]["weak"]),
             "excerpt_html": highlight(ex["text"], ex.get("highlights") or [])}
        r["search"] = " ".join(str(x) for x in [r["title"], r["creator"], r["collection"], r["summary"], flags,
                                               " ".join(r["substances"]), r["kind"], r["identifier"], r["terms"]]).lower()
        rows.append(r)
    with open(stem.with_suffix(".csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, CSV_FIELDS)
        w.writeheader()
        w.writerows(csv_rows)
    kinds = sorted({r["kind"] for r in rows})
    model = next((c["llm"].get("model") for c in labelled), "the screener")
    subtitle = (f"{len(rows)} documents rated archive_fit ≥ {args.min_fit} by {model}, from {len(labelled):,} labelled of "
                f"{len(cands):,} candidates in {path.name}. Score column is priority. Machine verdicts: check the "
                f"excerpt and the source before acting.")
    page = (PAGE.replace("__SUBTITLE__", html.escape(subtitle))
            .replace("__KINDS__", "".join(f'<option value="{k}">{k.replace("_", " ")}</option>' for k in kinds))
            .replace("__ROWS__", json.dumps(rows, ensure_ascii=False).replace("</", "<\\/")))
    stem.with_suffix(".html").write_text(page, encoding="utf-8")
    print(f"{len(rows)} documents -> {stem.with_suffix('.html')} and {stem.with_suffix('.csv')}")
    print(f"{sum(bool(r['url']) for r in rows)}/{len(rows)} with a source link")
    return 0


if __name__ == "__main__":
    sys.exit(main())
