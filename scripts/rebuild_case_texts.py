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
when they are not set). Cases are read from the Caselaw Access Project; the
CourtListener fetcher is a fallback and needs COURTLISTENER_API_TOKEN.
"""

import argparse
import difflib
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
ORIGINALS_DIR = OUT_DIR / "originals"

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

# Caselaw Access Project copies, used in place of CourtListener (whose API needs a
# token and whose pages refuse scripted requests). The record's public source_url
# is left as it is.
CAP_SOURCES = {
    "church-of-the-holy-light-of-the-queen-v-mukasey-2009": "https://static.case.law/f-supp-2d/615/cases/1210-01.json",
    "employment-division-v-smith-1990": "https://static.case.law/us/494/cases/0872-01.json",
    "gonzales-v-o-centro-2006": "https://static.case.law/us/546/cases/0418-01.json",
    "native-american-church-v-navajo-tribal-council-1959": "https://static.case.law/f2d/272/cases/0131-01.json",
    "people-v-woody-1964": "https://static.case.law/cal-2d/61/cases/0716-01.json",
    "state-v-big-sheep-1926": "https://static.case.law/mont/75/cases/0219-01.json",
    "united-states-v-kuch-1968": "https://static.case.law/f-supp/288/cases/0439-01.json",
}

# Corrections to source-only footnote text (raw OCR), each checked against the
# sense of the passage. Applied as exact (old, new) replacements per case.
OCR_FIXES = {
    "employment-division-v-smith-1990": [("1 reluctantly agree", "I reluctantly agree")],
    "native-american-church-v-navajo-tribal-council-1959": [("Herein failed the church.", "Herein called the church.")],
}

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
        self.capture_key = None
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
            # Ids such as CAP's footnote_1_6 stay unique when opinions restart numbering.
            note_id = attrs.get("id") or ""
            label = note_id.replace("footnote_", "fn").replace("_", "-") if note_id.startswith("footnote_") else (
                attrs.get("data-label") or re.sub(r"^\D+", "", note_id) or str(len(self.footnotes) + 1))
            self.footnote_key = self.make_key(label)
            self.footnote_depth = len(self.stack)
            self.footnotes[self.footnote_key] = []
            return

        if tag == "a" and ("footnotemark" in classes or "footnote" in classes) and self.footnote_key is None:
            self.capture, self.capture_text = "fnref", []
            href = attrs.get("href") or ""
            self.capture_key = href[1:].replace("footnote_", "fn").replace("_", "-") if href.startswith("#footnote_") else None
            return
        if tag == "sup" and self.footnote_key is None:
            self.capture, self.capture_text, self.capture_key = "fnref-sup", [], None
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
                self.buffer.append(f"[^{self.make_key(self.capture_key or text.strip('[]()'))}]")
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
            text = re.sub(r"^\[\^[^\]]+\]\s*", "", text)
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
    text = re.sub(r"_([^_\n]*?\S)\s+_", r"_\1_ ", text)  # "_Gobitis, _" -> "_Gobitis,_ "
    text = re.sub(r"\s+([,.;:)\]])", r"\1", text)
    text = re.sub(r"\s+(\[\^)", r"\1", text)
    return text.strip()


def parse_opinion_html(source_html, key_prefix=""):
    parser = OpinionParser(key_prefix)
    parser.feed(source_html)
    parser.flush()
    footnotes = {}
    for key, parts in parser.footnotes.items():
        # The body opens with its own label, usually as a separate "1" part; drop just that.
        if parts and re.fullmatch(r"[0-9*†‡]{1,4}\.?", parts[0].strip()):
            parts = parts[1:]
        text = re.sub(r"^\.\s*", "", " ".join(parts)).strip()
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


# --- projecting source structure onto the current transcript -------------------
#
# The current transcripts are the editors' corrected text; the structured sources
# are raw OCR ("analo^izeKtoTSisIiop" for "analogized to Bishop"). So the wording
# always comes from the current transcript, and only structure comes from the
# source: paragraph and block-quote breaks, opinion and section headings, [*page]
# markers and footnote references, each placed where the two texts align.

WORD_RE = re.compile(r"[a-z0-9]+")
FOOTNOTES_HEADING_RE = re.compile(r"^\s*#*\s*Footnotes\s*$", re.I | re.M)


def tokens(text):
    text = re.sub(r"\[\^[^\]]+\]|\[\*[^\]]+\]", " ", text)
    return WORD_RE.findall(text.lower().replace("’", "'"))


def word_spans(text):
    lowered = text.lower().replace("’", "'")
    return [(match.group(), match.start(), match.end()) for match in WORD_RE.finditer(lowered)]


def split_current(current):
    """Splits the transcript into body paragraphs and any footnotes section."""
    parts = FOOTNOTES_HEADING_RE.split(current, maxsplit=1)
    body, notes = parts[0], (parts[1] if len(parts) > 1 else "")
    paragraphs = [line.strip() for line in body.splitlines() if line.strip()]
    # Editors' opinion headings ("Opinion of the Court (Roberts, C.J.)") sit one
    # level above the opinion's own numbered sections.
    paragraphs = [re.sub(r"^#{2,4}\s+", "## ", line) for line in paragraphs]
    note_paragraphs = [re.sub(r"^\[\^[^\]]+\]:\s*|^\d{1,3}\s*\.?\s+", "", line.strip()) for line in notes.splitlines() if line.strip()]
    return "\n\n".join(paragraphs), note_paragraphs


def source_sequence(blocks):
    """Flattens source blocks into tokens plus structural events keyed to token positions."""
    toks, events = [], []
    for block in blocks:
        events.append({"at": len(toks), "type": "break", "kind": block["kind"], "text": block["text"]})
        for match in re.finditer(r"\[\^([^\]]+)\]|\[\*([^\]]+)\]|[A-Za-z0-9’']+", block["text"]):
            if match.group(1):
                events.append({"at": len(toks) - 1, "type": "fn", "key": match.group(1)})
            elif match.group(2):
                events.append({"at": len(toks), "type": "page", "label": match.group(2)})
            else:
                toks.extend(WORD_RE.findall(match.group().lower().replace("’", "'")))
    return toks, events


def token_map(src_tokens, cur_tokens):
    """Maps source token index -> current token index where the texts correspond."""
    mapping = {}
    matcher = difflib.SequenceMatcher(None, src_tokens, cur_tokens, autojunk=False)
    for op, i1, i2, j1, j2 in matcher.get_opcodes():
        if op == "equal":
            for offset in range(i2 - i1):
                mapping[i1 + offset] = j1 + offset
        elif op == "replace" and (i2 - i1) <= 12 and (j2 - j1) <= 12:
            # OCR noise: a short garbled run on one side, the corrected run on the other.
            for offset in range(i2 - i1):
                mapping[i1 + offset] = j1 + min(j2 - j1 - 1, offset * (j2 - j1) // (i2 - i1))
        # "delete" (source only) is text the editors cut; "insert" is editorial text.
    return mapping


def is_section_heading(text):
    """Short numbered divisions such as "I. Administrative History." or "B."."""
    if re.fullmatch(r"[IVXL]{1,5}|[A-H]|\d{1,2}", text):  # Supreme Court style: a bare "I" or "B"
        return True
    return len(text) <= 90 and "[^" not in text and bool(re.match(r"^(?:[IVXL]+|[A-H]|\d{1,2})\.(?:\s+\S.*)?$", text)) \
        and not re.search(r"[a-z]\.\s+[A-Z][a-z]+\s+[a-z]", text)


def best_note(text, candidates):
    own = set(tokens(text))
    best, score = None, 0.0
    for index, candidate in enumerate(candidates):
        theirs = set(tokens(candidate))
        if own and theirs:
            overlap = len(own & theirs) / len(own | theirs)
            if overlap > score:
                best, score = index, overlap
    return best if score >= 0.45 else None


def project(current, blocks, footnotes):
    body, old_notes = split_current(current)
    # When the editors gave the opinions their own headings, the source's
    # "COFFIN, Circuit Judge." lines stay ordinary paragraphs.
    editor_headings = bool(re.search(r"^#{1,4}\s", body, re.M))
    spans = word_spans(body)
    cur_tokens = [token for token, _, _ in spans]
    src_tokens, events = source_sequence(blocks)
    mapping = token_map(src_tokens, cur_tokens)

    inserts = []  # (char position, order, kind, payload)
    seen_pages, cited = set(), []
    for event in events:
        if event["type"] in ("break", "page"):
            j = mapping.get(event["at"])
            if j is None:
                continue
            position = spans[j][1]
            if event["type"] == "break":
                inserts.append((position, 0, "break", event))
            elif event["label"] not in seen_pages:
                seen_pages.add(event["label"])
                inserts.append((position, 1, "page", event["label"]))
        elif event["type"] == "fn":
            j = mapping.get(event["at"])
            if j is None or event["key"] not in footnotes:
                continue
            end = spans[j][2]
            while end < len(body) and body[end] in ".,;:)]\"”’'":
                end += 1
            if event["key"] not in cited:
                cited.append(event["key"])
            inserts.append((end, 2, "fn", event["key"]))

    out, cursor = [], 0
    for position, _, kind, payload in sorted(inserts, key=lambda item: (item[0], item[1])):
        out.append(body[cursor:position])
        cursor = position
        if kind == "break":
            text = "".join(out).rstrip()
            out = [text]
            if text and not text.endswith("\n\n"):
                out.append("\n\n")
            if payload["kind"] == "quote":
                out.append("> ")
            elif payload["kind"] == "heading" and len(payload["text"]) <= 60 and not editor_headings:
                out.append("## ")
        elif kind == "page":
            out.append(f"[*{payload}] ")
        else:
            out.append(f"[^{payload}]")
    out.append(body[cursor:])

    paragraphs = []
    for paragraph in re.split(r"\n\s*\n", "".join(out)):
        paragraph = re.sub(r"[ \t]+", " ", paragraph).strip()
        if not paragraph:
            continue
        if not paragraph.startswith(("#", ">")) and is_section_heading(re.sub(r"\[\*[^\]]+\]\s*", "", paragraph)):
            paragraph = f"### {paragraph}"
        paragraphs.append(paragraph)
    markdown = "\n\n".join(paragraphs)

    # Footnote text: the editors' version when the transcript had one, else the source's.
    definitions, unused, from_source = [], list(range(len(old_notes))), 0
    for key in cited:
        match = best_note(footnotes[key], [old_notes[i] for i in unused])
        if match is not None:
            index = unused.pop(match)
            definitions.append(f"[^{key}]: {old_notes[index]}")
        else:
            definitions.append(f"[^{key}]: {footnotes[key]}")
            from_source += 1
    for index in unused:  # editors' notes the source could not place are kept, unanchored
        definitions.append(f"[^ed{index + 1}]: {old_notes[index]}")
    if definitions:
        markdown += "\n\n" + "\n".join(definitions)

    # Wording check: the body's words must be exactly the transcript's words.
    body_out = "\n".join(line for line in markdown.splitlines() if not line.startswith("[^") or not re.match(r"^\[\^[^\]]+\]:", line))
    problems = []
    if tokens(body_out) != cur_tokens:
        diff = difflib.SequenceMatcher(None, cur_tokens, tokens(body_out), autojunk=False)
        for op, i1, i2, j1, j2 in diff.get_opcodes():
            if op != "equal":
                problems.append(f"{op}: {' '.join(cur_tokens[i1:i2])[:80]!r} -> {' '.join(tokens(body_out)[j1:j2])[:80]!r}")
    stats = {
        "pages": len(seen_pages),
        "footnotes": len(cited),
        "source_footnotes": from_source,
        "unplaced_notes": len(unused),
        "breaks": sum(1 for item in inserts if item[2] == "break"),
    }
    return markdown.strip() + "\n", problems, stats


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


def original_transcript(slug, section):
    """The pre-rebuild transcript, saved once so reruns always start from it."""
    path = ORIGINALS_DIR / f"{slug}.txt"
    if not path.exists():
        if re.search(r"\[\*\d+[a-z]?\]", section["body"]):
            raise RuntimeError(f"{slug} is already rebuilt and has no saved original in {path}")
        ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
        path.write_text(section["body"])
    return path.read_text()


def rebuild(slug, apply):
    doc, section = load_case(slug)
    current = original_transcript(slug, section)
    blocks, footnotes = fetch_structured(CAP_SOURCES.get(slug, doc["source_url"]))
    for key, text in footnotes.items():
        for old, new in OCR_FIXES.get(slug, []):
            text = text.replace(old, new)
        footnotes[key] = text
    markdown, problems, stats = project(current, blocks, footnotes)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{slug}.md").write_text(markdown)
    print(f"{slug}: {stats['breaks']} breaks, {stats['pages']} page markers, {stats['footnotes']} footnotes "
          f"({stats['source_footnotes']} from source text), {stats['unplaced_notes']} unplaced editor notes, "
          f"{len(problems)} wording differences")
    for problem in problems[:8]:
        print(f"    {problem}")

    if apply:
        if problems:
            print("    not applied: wording differs from the current transcript")
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
