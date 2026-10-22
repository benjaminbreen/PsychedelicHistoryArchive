#!/usr/bin/env python3
"""Rebuild court-opinion transcripts from structured sources, keeping editors' cuts.

The archive's legal cases were first imported as flat text: paragraphs, footnotes
and reporter page numbers were lost. This script fetches the structured opinion
(Caselaw Access Project HTML, or CourtListener's API) and converts it to the
reader's Markdown: paragraph breaks, block quotes, an opinion heading per author,
star pagination such as [*883], and footnotes as [^n].

Several transcripts are deliberate excerpts, with cuts marked in italics such as
"_[Subsection on ... omitted.]_". The rebuild keeps only the source paragraphs
(or, for paragraphs the editors trimmed, the sentences) that appear in the
current transcript, puts each omission note back where it was, and keeps only
the footnotes that the retained text cites. A coverage check reports any words
of the current transcript missing from the rebuild.

Usage:
  python3 scripts/rebuild_case_texts.py                 # write data/legal-cases/*.md for review
  python3 scripts/rebuild_case_texts.py --slug grinspoon-v-dea-1987
  python3 scripts/rebuild_case_texts.py --apply         # also update Supabase transcript sections

Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (archive-site/.env.local is read
when they are not set) and, for CourtListener sources, COURTLISTENER_API_TOKEN.
"""

import argparse
import html
import json
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "data" / "legal-cases"
SHINGLE = 6

CASE_SLUGS = [
    "church-of-the-holy-light-of-the-queen-v-mukasey-2009",
    "employment-division-v-smith-1990",
    "gonzales-v-o-centro-2006",
    "grinspoon-v-dea-1987",
    "native-american-church-v-navajo-tribal-council-1959",
    "people-v-woody-1964",
    "state-v-big-sheep-1926",
    "united-states-v-kuch-1968",
]

OMISSION_RE = re.compile(r"^_\[[^\]]*\]_$")


# --- environment and HTTP -------------------------------------------------------

def load_env():
    env_file = ROOT / "archive-site" / ".env.local"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            match = re.match(r"^([A-Z0-9_]+)=(.*)$", line.strip())
            if match and match.group(1) not in os.environ:
                os.environ[match.group(1)] = match.group(2).strip().strip('"').strip("'")


def http_json(url, headers=None, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, method=method, headers={"User-Agent": "PsychedelicHistoryArchive/1.0", **(headers or {})})
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read().decode()
        return json.loads(raw) if raw else None


def http_text(url, headers=None):
    request = urllib.request.Request(url, headers={"User-Agent": "PsychedelicHistoryArchive/1.0", **(headers or {})})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read().decode()


def supabase_headers():
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def supabase_url(path):
    return f"{os.environ['SUPABASE_URL'].rstrip('/')}/rest/v1/{path}"


# --- HTML to blocks -------------------------------------------------------------

class OpinionParser(HTMLParser):
    """Turns CAP or CourtListener opinion HTML into paragraph blocks and footnotes.

    Blocks are dicts: {"kind": "p" | "quote" | "heading", "text": str}. Inline
    footnote references become [^key]; reporter page labels become [*page].
    """

    BLOCK_TAGS = {"p", "blockquote", "h1", "h2", "h3", "h4", "center", "li", "pre"}

    def __init__(self, key_prefix=""):
        super().__init__(convert_charrefs=True)
        self.key_prefix = key_prefix
        self.blocks = []
        self.footnotes = {}
        self.stack = []
        self.buffer = []
        self.block_kind = None
        self.footnote_key = None
        self.footnote_depth = 0
        self.skip_depth = 0
        self.capture = None  # "fnref" | "page" while inside those anchors
        self.capture_text = []
        self.head_matter_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set((attrs.get("class") or "").split())
        self.stack.append(tag)

        if self.skip_depth:
            self.skip_depth += 1
            return
        if tag in ("script", "style"):
            self.skip_depth = 1
            return
        if "head-matter" in classes:
            self.head_matter_depth = len(self.stack)
        if self.head_matter_depth:
            return

        # Footnote bodies: CAP <aside class="footnote" data-label="1">,
        # CourtListener <div class="footnote" id="fn1"> or <li id="fn1">.
        is_footnote_body = (
            ("footnote" in classes and tag in ("aside", "div"))
            or (tag in ("div", "li") and re.match(r"^(fn|footnote)[_-]?\d", attrs.get("id") or "") and "footnotemark" not in classes)
        )
        if is_footnote_body and self.footnote_key is None:
            self.flush()
            label = attrs.get("data-label") or re.sub(r"^\D+", "", attrs.get("id") or "") or str(len(self.footnotes) + 1)
            self.footnote_key = self.make_key(label)
            self.footnote_depth = len(self.stack)
            self.footnotes[self.footnote_key] = []
            return

        if tag == "a" and ("footnotemark" in classes or "footnote" in classes) and self.footnote_key is None:
            self.capture, self.capture_text = "fnref", []
            return
        if tag == "sup" and self.footnote_key is None:
            self.capture, self.capture_text = "fnref-sup", []
            return
        if "page-label" in classes or "star-pagination" in classes:
            label = attrs.get("data-label")
            if label:
                self.buffer.append(f"[*{label}]")
                self.skip_depth = 1
            else:
                self.capture, self.capture_text = "page", []
            return
        if tag in ("em", "i"):
            self.buffer.append("_")
        elif tag in ("strong", "b"):
            self.buffer.append("**")
        elif tag == "br":
            self.buffer.append(" ")
        elif tag in self.BLOCK_TAGS:
            self.flush()
            if "author" in classes:
                self.block_kind = "heading"
            elif tag == "blockquote" or (self.block_kind == "quote"):
                self.block_kind = "quote"
            elif tag in ("h1", "h2", "h3", "h4"):
                self.block_kind = "heading"
            else:
                self.block_kind = "p"
        elif tag == "article":
            self.flush()

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        depth = len(self.stack)
        if self.stack:
            self.stack.pop()
        if self.skip_depth:
            self.skip_depth -= 1
            return
        if self.head_matter_depth:
            if depth <= self.head_matter_depth:
                self.head_matter_depth = 0
            return
        if self.capture and tag in ("a", "sup", "span"):
            text = "".join(self.capture_text).strip()
            if self.capture in ("fnref", "fnref-sup") and re.fullmatch(r"[\[\(]?[0-9*†‡a-z]{1,4}[\]\)]?", text):
                self.buffer.append(f"[^{self.make_key(text.strip('[]()'))}]")
            elif self.capture == "page" and text:
                self.buffer.append(f"[{text if text.startswith('*') else '*' + text}]")
            elif text:
                self.buffer.append(text)
            self.capture = None
            return
        if self.footnote_key is not None and depth <= self.footnote_depth:
            self.flush()
            self.footnote_key = None
            return
        if tag in ("em", "i"):
            self.buffer.append("_")
        elif tag in ("strong", "b"):
            self.buffer.append("**")
        elif tag in self.BLOCK_TAGS:
            self.flush()

    def handle_data(self, data):
        if self.skip_depth or self.head_matter_depth:
            return
        if self.capture:
            self.capture_text.append(data)
        else:
            self.buffer.append(data)

    def make_key(self, label):
        label = {"*": "star", "†": "dagger", "‡": "ddagger"}.get(label, label)
        return f"{self.key_prefix}{label}"

    def flush(self):
        text = clean_inline("".join(self.buffer))
        self.buffer = []
        if not text:
            return
        if self.footnote_key is not None:
            # The footnote body repeats its own label first; drop it.
            text = re.sub(r"^\[\^[^\]]+\]\s*|^[0-9*†‡]{1,4}\s*\.?\s+", "", text)
            self.footnotes[self.footnote_key].append(text)
        else:
            self.blocks.append({"kind": self.block_kind or "p", "text": text})
        self.block_kind = None


def clean_inline(text):
    text = html.unescape(text).replace(" ", " ")
    text = re.sub(r"\s+", " ", text)
    # A page break inside a word ("com[*884]ments") moves to after the word.
    text = re.sub(r"(\w+)\[\*([^\]]+)\](\w+)", r"\1\3 [*\2]", text)
    text = re.sub(r"\s*(\[\*[^\]]+\])\s*", r" \1 ", text)
    text = re.sub(r"__|\*\*\*\*", "", text)  # empty emphasis pairs
    text = re.sub(r"_\s+_", " ", text)
    text = re.sub(r"\s+([,.;:)\]])", r"\1", text)
    text = re.sub(r"\s+(\[\^)", r"\1", text)
    return text.strip()


def parse_opinion_html(source_html, key_prefix=""):
    parser = OpinionParser(key_prefix)
    parser.feed(source_html)
    parser.flush()
    footnotes = {}
    for key, parts in parser.footnotes.items():
        # The body opens with its own label ("1", sometimes "1 ."); drop it.
        text = re.sub(r"^[0-9*†‡]{1,4}\s*\.?\s*", "", " ".join(parts)).strip()
        if text:
            footnotes[key] = text
    return parser.blocks, footnotes


# --- sources --------------------------------------------------------------------

def fetch_cap(source_url):
    html_url = source_url.replace("/cases/", "/html/").replace(".json", ".html")
    return parse_opinion_html(http_text(html_url))


def fetch_courtlistener(source_url):
    token = os.environ.get("COURTLISTENER_API_TOKEN")
    if not token:
        raise RuntimeError("COURTLISTENER_API_TOKEN is not set")
    headers = {"Authorization": f"Token {token}"}
    opinion_id = re.search(r"/opinion/(\d+)/", source_url).group(1)
    first = http_json(f"https://www.courtlistener.com/api/rest/v4/opinions/{opinion_id}/", headers)
    cluster = http_json(first["cluster"], headers)
    opinions = [first]
    for url in cluster.get("sub_opinions") or []:
        if not url.rstrip("/").endswith(f"/{opinion_id}"):
            opinions.append(http_json(url, headers))
    # Lead/majority opinions first, then concurrences and dissents, in court order.
    order = {"010combined": 0, "015unamimous": 0, "020lead": 1, "025plurality": 1, "030concurrence": 2, "035concurrenceinpart": 3, "040dissent": 4}
    opinions.sort(key=lambda op: (order.get(op.get("type"), 5), op.get("ordering_key") or 0))

    blocks, footnotes = [], {}
    for index, opinion in enumerate(opinions):
        source_html = (opinion.get("html_with_citations") or opinion.get("html_lawbox") or opinion.get("html_columbia")
                       or opinion.get("html") or opinion.get("xml_harvard") or "")
        if not source_html and opinion.get("plain_text"):
            source_html = "".join(f"<p>{html.escape(part)}</p>" for part in re.split(r"\n\s*\n", opinion["plain_text"]))
        part_blocks, part_notes = parse_opinion_html(source_html, key_prefix="" if index == 0 else f"op{index + 1}-")
        blocks.extend(part_blocks)
        footnotes.update(part_notes)
    return blocks, footnotes


def fetch_structured(source_url):
    if "case.law" in source_url:
        return fetch_cap(source_url)
    if "courtlistener.com" in source_url:
        return fetch_courtlistener(source_url)
    raise RuntimeError(f"No structured fetcher for {source_url}")


# --- alignment with the current excerpt -----------------------------------------

def tokens(text):
    text = re.sub(r"\[\^[^\]]+\]|\[\*[^\]]+\]", " ", text)
    text = text.lower().replace("’", "'")
    return re.findall(r"[a-z0-9]+", text)


def shingles(toks):
    if len(toks) < SHINGLE:
        return {" ".join(toks)} if toks else set()
    return {" ".join(toks[i:i + SHINGLE]) for i in range(len(toks) - SHINGLE + 1)}


def coverage(text, reference, reference_text=""):
    toks = tokens(text)
    if 0 < len(toks) < SHINGLE:
        # Too short for a shingle: headings, judges' names, "Affirmed."
        return 1.0 if f" {' '.join(toks)} " in reference_text else 0.0
    own = shingles(toks)
    return len(own & reference) / len(own) if own else 0.0


def split_sentences(text):
    parts = re.split(r"(?<=[.?!])\s+(?=[A-Z“\"(\[])|(?<=[.?!][\"”’)])\s+(?=[A-Z“\"(\[])", text)
    return [part for part in parts if part and part.strip()]


def align(blocks, current_text):
    """Keeps the parts of `blocks` present in the current transcript, in order."""
    reference = shingles(tokens(current_text))
    reference_text = f" {' '.join(tokens(current_text))} "
    kept = []
    for block in blocks:
        score = coverage(block["text"], reference, reference_text)
        if score >= 0.85:
            kept.append(block)
        elif score > 0.1:
            sentences = [s for s in split_sentences(block["text"]) if coverage(s, reference, reference_text) >= 0.6]
            if sentences:
                kept.append({**block, "text": " ".join(sentences), "trimmed": True})
    return kept


def omission_notes(current_text):
    """Returns (note, preceding tokens) for each editorial omission paragraph."""
    notes = []
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", current_text)]
    before = []
    for paragraph in paragraphs:
        if OMISSION_RE.match(paragraph):
            notes.append((paragraph, before[-12:]))
        else:
            before.extend(tokens(paragraph))
    return notes


def insert_omissions(kept, notes):
    result = list(kept)
    for note, preceding in notes:
        position = 0
        if preceding:
            tail = " ".join(preceding)
            for index, block in enumerate(result):
                if block.get("kind") == "omission":
                    continue
                if tail in " ".join(tokens(block["text"])):
                    position = index + 1
        result.insert(position, {"kind": "omission", "text": note})
    return result


# --- Markdown -------------------------------------------------------------------

def is_section_heading(text):
    """Short numbered divisions such as "I. _Administrative History._" or "B."."""
    return len(text) <= 90 and "[^" not in text and bool(re.match(r"^(?:[IVXL]+|[A-H]|\d{1,2})\.(?:\s+\S.*)?$", text)) \
        and not re.search(r"[a-z]\.\s+[A-Z][a-z]+\s+[a-z]", text)


def to_markdown(blocks, footnotes):
    lines = []
    for block in blocks:
        text = block["text"]
        if block["kind"] == "heading":
            lines.append(f"## {text}")
        elif is_section_heading(text):
            lines.append(f"### {text}")
        elif block["kind"] == "quote":
            lines.append(f"> {text}")
        else:
            lines.append(text)
    body = "\n\n".join(lines)
    cited = []
    for key in re.findall(r"\[\^([^\]]+)\]", body):
        if key not in cited:
            cited.append(key)
    missing = [key for key in cited if key not in footnotes]
    for key in missing:
        body = body.replace(f"[^{key}]", "")
    definitions = [f"[^{key}]: {footnotes[key]}" for key in cited if key in footnotes]
    if definitions:
        body += "\n\n" + "\n".join(definitions)
    return body.strip() + "\n", missing


def uncovered_words(current_text, markdown):
    """Words of the current transcript (outside omission notes) missing from the rebuild."""
    current = "\n\n".join(p for p in re.split(r"\n\s*\n", current_text) if not OMISSION_RE.match(p.strip()))
    rebuilt = shingles(tokens(markdown))
    toks = tokens(current)
    missing_runs, run = [], []
    for i in range(len(toks)):
        window = " ".join(toks[i:i + SHINGLE]) if i + SHINGLE <= len(toks) else " ".join(toks[-SHINGLE:])
        if window in rebuilt:
            if len(run) >= SHINGLE:
                missing_runs.append(" ".join(run))
            run = []
        else:
            run.append(toks[i])
    if len(run) >= SHINGLE:
        missing_runs.append(" ".join(run))
    return missing_runs


# --- main -----------------------------------------------------------------------

def load_case(slug):
    rows = http_json(supabase_url(
        f"documents?slug=eq.{slug}&select=id,slug,source_url,document_sections(id,section_type,body,body_format)"
    ), supabase_headers())
    if not rows:
        raise RuntimeError(f"No document {slug}")
    doc = rows[0]
    section = next((s for s in doc["document_sections"] if s["section_type"] == "transcript"), None)
    if not section:
        raise RuntimeError(f"{slug} has no transcript section")
    return doc, section


def rebuild(slug, apply):
    doc, section = load_case(slug)
    current = section["body"]
    blocks, footnotes = fetch_structured(doc["source_url"])
    is_excerpt = bool(omission_notes(current))
    kept = align(blocks, current)
    if is_excerpt:
        kept = insert_omissions(kept, omission_notes(current))
    markdown, missing_notes = to_markdown(kept, footnotes)
    gaps = uncovered_words(current, markdown)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{slug}.md").write_text(markdown)
    trimmed = sum(1 for block in kept if block.get("trimmed"))
    refs = len(set(re.findall(r"\[\^([^\]]+)\](?!:)", markdown)))
    pages = len(re.findall(r"\[\*", markdown))
    print(f"{slug}: {len(blocks)} source blocks -> {len(kept)} kept ({trimmed} trimmed), "
          f"{refs} footnotes, {pages} page markers, {len(gaps)} uncovered runs")
    for gap in gaps[:8]:
        print(f"    uncovered: {gap[:140]}")
    if missing_notes:
        print(f"    footnote refs with no text: {', '.join(missing_notes)}")

    if apply:
        if gaps:
            print("    not applied: the rebuild is missing text from the current transcript")
            return False
        request = urllib.request.Request(
            supabase_url(f"document_sections?id=eq.{section['id']}"),
            data=json.dumps({"body": markdown, "body_format": "markdown"}).encode(),
            method="PATCH",
            headers={**supabase_headers(), "Prefer": "return=minimal", "User-Agent": "PsychedelicHistoryArchive/1.0"},
        )
        urllib.request.urlopen(request, timeout=60).read()
        print("    applied")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--slug", action="append", help="Rebuild only this case (repeatable)")
    parser.add_argument("--apply", action="store_true", help="Write the rebuilt Markdown to Supabase")
    args = parser.parse_args()
    load_env()
    ok = True
    for slug in args.slug or CASE_SLUGS:
        try:
            ok = rebuild(slug, args.apply) and ok
        except Exception as error:  # keep going so one source failure doesn't block the rest
            print(f"{slug}: failed: {error}")
            ok = False
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
