#!/usr/bin/env python3
import hashlib
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

from transcript_cleanup_pipeline import clean_markdown, write_reports


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "data" / "aapb" / "lettvin-vs-leary"
IMPORT_DIR = ROOT / "data" / "aapb-lettvin-leary-import"
PDF_PATH = SOURCE_DIR / "Lettvin-Leary-LSD-Debate-Merged-OCR.pdf"
TRANSCRIPT_PATH = SOURCE_DIR / "lettvin-leary-lsd-debate-transcript.md"
THUMBNAIL_SOURCE_PATH = SOURCE_DIR / "thumbnail.jpg"
YOUTUBE_TRANSCRIPT_PATH = IMPORT_DIR / "leary letvin transcript.txt"
FINAL_TRANSCRIPT_PATH = SOURCE_DIR / "final" / "lettvin-leary-gold-transcript.md"
WORK_TRANSCRIPT_PATH = SOURCE_DIR / "work" / "lettvin-leary-auto-cleaned.md"
REPORT_DIR = SOURCE_DIR / "reports"

SLUG = "lsd-lettvin-vs-leary"
DOCUMENT_ID = str(uuid.uuid5(uuid.NAMESPACE_URL, f"document:{SLUG}"))
PUBLISHED_AT = "2026-05-21T00:00:00.000Z"
AAPB_URL = "https://americanarchive.org/catalog/cpb-aacip-15-q52f766j20"
AAPB_EMBED_URL = "https://americanarchive.org/embed/cpb-aacip-15-q52f766j20"

NS = {"x": "http://www.w3.org/1999/xhtml"}
COLUMN_SLICES = [(0, 42), (42, 82), (82, 132)]


def uuid_for(kind: str, value: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"{kind}:{value}"))


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def block_text(block: ET.Element) -> str:
    lines = []
    for line in block.findall("x:line", NS):
        words = sorted(line.findall("x:word", NS), key=lambda word: float(word.attrib["xMin"]))
        y_min = float(line.attrib["yMin"])
        words_by_column = {0: [], 1: [], 2: []}
        for word in words:
            text = (word.text or "").strip()
            if not text:
                continue
            x_min = float(word.attrib["xMin"])
            words_by_column[word_column_for(x_min)].append(text)
        for column, column_words in words_by_column.items():
            if column_words:
                lines.append({
                    "column": column,
                    "y_min": y_min,
                    "text": " ".join(column_words),
                })

    x_min = float(block.attrib["xMin"])
    x_max = float(block.attrib["xMax"])
    if x_max - x_min > 270 and len(lines) > 1:
        lines.sort(key=lambda line: (line["column"], line["y_min"]))
    else:
        lines.sort(key=lambda line: line["y_min"])

    text = ""
    for line in lines:
      line_text = line["text"]
      if not text:
        text = line_text
      elif text.endswith("-"):
        text = text[:-1] + line_text
      else:
        text += " " + line_text
    return normalize_text(text)


def normalize_text(text: str) -> str:
    replacements = {
        "ad~ vances": "advances",
        "cul· ture": "culture",
        "Cer· tainly": "Certainly",
        "psy- chedelic": "psychedelic",
        "mari- juana": "marijuana",
        "Massachu- setts": "Massachusetts",
        "newspa- pers": "newspapers",
        "con- sciousness": "consciousness",
        "re- ligion": "religion",
        "LETTVJN": "LETTVIN",
        "LElTVIN": "LETTVIN",
        "INNISFREE;": "INNISFREE:",
        "LEARY;": "LEARY:",
        "LETTVIN;": "LETTVIN:",
        "Namas tay": "Namastay",
        "coll~ge": "college",
        "United states": "United States",
        "yOU": "you",
        "tOnight": "tonight",
        "JOany": "many",
        "evolutiona.ry": "evolutionary",
        "sciehce": "science",
        "subject-p~edicate": "subject-predicate",
        "tempIe": "temple",
        "you'w": "you've",
        "pay-off": "payoff",
        "rOW-boat": "rowboat",
        "acha- lice": "a chalice",
        "achalice": "a chalice",
        "bQ.dy": "body",
        "PHOTOORAPHY": "PHOTOGRAPHY",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)

    text = text.replace("“", '"').replace("”", '"').replace("’", "'")
    text = text.replace("·", "")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"([A-Z])\s+\.", r"\1.", text)
    text = re.sub(r"\bmc\s+2\b", "mc2", text)
    return text.strip()


def is_noise(text: str, y_min: float) -> bool:
    if not text:
        return True
    if y_min > 730 and (text.startswith("Page ") or text.upper() == "INNISFREE" or text == "Supplement Issue"):
        return True
    if re.fullmatch(r"Page \d+", text):
        return True
    if text.upper() == "INNISFREE":
        return True
    if text == "Supplement Issue" or text == "PageS":
        return True
    if "The cover drawing is by Tom Weller" in text:
        return True
    if text.startswith("Published occasionally by the INNISFREE FOUNDATION"):
        return True
    return False


def column_for(x_min: float, x_max: float) -> int:
    width = x_max - x_min
    center = (x_min + x_max) / 2
    if width > 270 and x_min < 120:
        return 1
    if center < 200:
        return 0
    if center < 405:
        return 1
    return 2


def word_column_for(x_min: float) -> int:
    if x_min < 220:
        return 0
    if x_min < 405:
        return 1
    return 2


def extract_blocks(xml_path: Path) -> list[dict]:
    tree = ET.parse(xml_path)
    blocks = []
    for page_index, page in enumerate(tree.findall(".//x:page", NS), start=1):
        if page_index < 3 or page_index > 23:
            continue
        page_blocks = []
        for block in page.findall(".//x:block", NS):
            x_min = float(block.attrib["xMin"])
            x_max = float(block.attrib["xMax"])
            y_min = float(block.attrib["yMin"])
            y_max = float(block.attrib["yMax"])
            text = block_text(block)
            if is_noise(text, y_min):
                continue
            page_blocks.append({
                "page": page_index,
                "x_min": x_min,
                "x_max": x_max,
                "y_min": y_min,
                "y_max": y_max,
                "text": text,
                "column": column_for(x_min, x_max),
            })

        top_spanning = [
            block for block in page_blocks
            if block["y_min"] < 150 and (block["x_max"] - block["x_min"]) > 250
        ]
        regular = [block for block in page_blocks if block not in top_spanning]
        top_spanning.sort(key=lambda block: block["y_min"])
        regular.sort(key=lambda block: (block["column"], block["y_min"], block["x_min"]))
        blocks.extend(top_spanning + regular)
    return blocks


def format_blocks(blocks: list[dict]) -> str:
    paragraphs = [
        "# LSD: The Great Debate",
        "",
        "## The Leary-Lettvin Debate",
    ]

    skipped_title = False
    for block in blocks:
        text = clean_heading_text(block["text"])
        if text == "The Leary-Lettvin Debate":
            if not skipped_title:
                skipped_title = True
                continue

        heading = heading_for(text)
        if heading:
            paragraphs.extend(["", f"## {heading}"])
            continue

        text = normalize_speaker_label(text)
        if text:
            paragraphs.extend(["", text])

    markdown = "\n".join(paragraphs).strip() + "\n"
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return finalize_markdown(markdown)


def extract_layout_markdown() -> str:
    with tempfile.TemporaryDirectory(dir=SOURCE_DIR) as tmpdir:
        layout_path = Path(tmpdir) / "layout.txt"
        run(["pdftotext", "-f", "3", "-l", "23", "-layout", str(PDF_PATH), str(layout_path)])
        raw = layout_path.read_text(encoding="utf-8", errors="replace")

    pages = raw.split("\f")
    paragraphs = [
        "# LSD: The Great Debate",
        "",
        "## The Leary-Lettvin Debate",
    ]
    current_heading = "The Leary-Lettvin Debate"

    for offset, page in enumerate(pages, start=3):
        if not page.strip():
            continue
        lines = strip_layout_noise(page.splitlines())
        page_paragraphs = layout_page_paragraphs(offset, lines)
        for paragraph in page_paragraphs:
            heading = heading_for(clean_heading_text(paragraph))
            if heading:
                if heading != current_heading:
                    paragraphs.extend(["", f"## {heading}"])
                    current_heading = heading
                continue
            paragraph = normalize_layout_paragraph(paragraph)
            if paragraph:
                paragraphs.extend(["", paragraph])

    markdown = "\n".join(paragraphs).strip() + "\n"
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return finalize_markdown(markdown)


def line_column_for(x_min: float, x_max: float) -> int:
    center = (x_min + x_max) / 2
    if center < 200:
        return 0
    if center < 405:
        return 1
    return 2


def split_column_for(word_x_min: float, line_x_min: float) -> int:
    if line_x_min > 180:
        return 1 if word_x_min < 385 else 2
    if word_x_min < 220:
        return 0
    if word_x_min < 410:
        return 1
    return 2


def extract_line_entries(xml_path: Path) -> dict[int, list[dict]]:
    tree = ET.parse(xml_path)
    pages: dict[int, list[dict]] = {}
    for page_index, page in enumerate(tree.findall(".//x:page", NS), start=1):
        if page_index < 3 or page_index > 23:
            continue

        entries = []
        for line in page.findall(".//x:line", NS):
            x_min = float(line.attrib["xMin"])
            x_max = float(line.attrib["xMax"])
            y_min = float(line.attrib["yMin"])
            if y_min < 45 or y_min > 735:
                continue

            words = sorted(line.findall("x:word", NS), key=lambda word: float(word.attrib["xMin"]))
            if not words:
                continue

            if x_max - x_min > 260:
                words_by_column: dict[int, list[str]] = {0: [], 1: [], 2: []}
                x_by_column: dict[int, list[float]] = {0: [], 1: [], 2: []}
                for word in words:
                    text = (word.text or "").strip()
                    if not text:
                        continue
                    word_x_min = float(word.attrib["xMin"])
                    column = split_column_for(word_x_min, x_min)
                    words_by_column[column].append(text)
                    x_by_column[column].append(word_x_min)

                for column, column_words in words_by_column.items():
                    if not column_words:
                        continue
                    entries.append({
                        "column": column,
                        "x_min": min(x_by_column[column]),
                        "y_min": y_min,
                        "text": normalize_text(" ".join(column_words)),
                    })
            else:
                text = normalize_text(" ".join((word.text or "").strip() for word in words if (word.text or "").strip()))
                if text:
                    entries.append({
                        "column": line_column_for(x_min, x_max),
                        "x_min": x_min,
                        "y_min": y_min,
                        "text": text,
                    })

        pages[page_index] = [entry for entry in entries if not is_line_noise(entry["text"])]
    return pages


def is_line_noise(text: str) -> bool:
    if not text:
        return True
    if text in {"INNISFREE", "Supplement Issue", "ement Issue"}:
        return True
    if re.fullmatch(r"Page\s*\d+", text):
        return True
    return False


def paragraphs_from_line_entries(entries: list[dict]) -> list[str]:
    if not entries:
        return []

    lines = sorted(entries, key=lambda entry: (entry["y_min"], entry["x_min"]))
    gaps = [
        later["y_min"] - earlier["y_min"]
        for earlier, later in zip(lines, lines[1:])
        if 5 < later["y_min"] - earlier["y_min"] < 25
    ]
    median_gap = sorted(gaps)[len(gaps) // 2] if gaps else 11
    left_edge = min(entry["x_min"] for entry in lines)

    paragraph_lines: list[list[str]] = []
    current: list[str] = []
    previous: dict | None = None
    for line in lines:
        starts_new = False
        if previous:
            gap = line["y_min"] - previous["y_min"]
            starts_new = gap > median_gap * 1.45 or (line["x_min"] > left_edge + 10 and gap > median_gap * 0.8)

        if starts_new and current:
            paragraph_lines.append(current)
            current = []
        current.append(line["text"])
        previous = line

    if current:
        paragraph_lines.append(current)

    paragraphs = []
    for lines_for_paragraph in paragraph_lines:
        text = ""
        for line in lines_for_paragraph:
            if not text:
                text = line
            elif text.endswith("-"):
                text = text[:-1] + line
            else:
                text += " " + line
        text = normalize_layout_paragraph(text)
        if text:
            paragraphs.append(text)
    return paragraphs


def format_line_markdown(pages: dict[int, list[dict]]) -> str:
    paragraphs = [
        "# LSD: The Great Debate",
        "",
        "## The Leary-Lettvin Debate",
    ]
    current_heading = "The Leary-Lettvin Debate"

    for page_number in sorted(pages):
        page_paragraphs = line_page_paragraphs(page_number, pages[page_number])
        for paragraph in page_paragraphs:
            paragraph = postprocess_paragraph(paragraph)
            if is_bad_pull_quote(paragraph):
                continue
            heading = heading_for(clean_heading_text(paragraph))
            if heading:
                if heading != current_heading:
                    paragraphs.extend(["", f"## {heading}"])
                    current_heading = heading
                continue

            if paragraph == "The Leary-Lettvin Debate":
                continue

            for split_paragraph in split_speaker_paragraphs(paragraph):
                paragraphs.extend(["", split_paragraph])

    markdown = "\n".join(paragraphs).strip() + "\n"
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return finalize_markdown(markdown)


def line_page_paragraphs(page_number: int, entries: list[dict]) -> list[str]:
    if page_number == 3:
        return line_page_three(entries)

    paragraphs = []
    for column in [0, 1, 2]:
        paragraphs.extend(paragraphs_from_line_entries([entry for entry in entries if entry["column"] == column]))
    return paragraphs


def line_page_three(entries: list[dict]) -> list[str]:
    paragraphs = []
    paragraphs.extend(paragraphs_from_line_entries([entry for entry in entries if entry["y_min"] < 140]))
    paragraphs.extend(paragraphs_from_line_entries([
        entry for entry in entries
        if entry["column"] == 0 and 140 <= entry["y_min"] < 430
    ]))
    paragraphs.extend(paragraphs_from_line_entries([
        entry for entry in entries
        if entry["column"] == 1 and 140 <= entry["y_min"] < 430
    ]))
    paragraphs.extend(paragraphs_from_line_entries([entry for entry in entries if entry["text"] == "Leary"]))
    paragraphs.extend(paragraphs_from_line_entries([
        entry for entry in entries
        if entry["column"] == 0 and entry["y_min"] >= 500
    ]))
    paragraphs.extend(paragraphs_from_line_entries([
        entry for entry in entries
        if entry["column"] == 1 and entry["y_min"] >= 500
    ]))
    paragraphs.extend(paragraphs_from_line_entries([
        entry for entry in entries
        if entry["column"] == 2 and entry["y_min"] >= 140
    ]))
    return paragraphs


def postprocess_paragraph(text: str) -> str:
    text = normalize_text(text)
    text = text.replace("the come back and tune it in", "then come back and tune it in")
    text = text.replace("he began to nip out", "he began to flip out")
    text = text.replace("and and to penetrate", "and to penetrate")
    text = text.replace("of your mind that I used to have seven years", "of my mind that I used to have seven years")
    text = text.replace("cellular nation", "cellular information")
    text = text.replace("subject-p~edicate", "subject-predicate")
    text = text.replace("p~edicate", "predicate")
    text = text.replace("imp~anting", "implanting")
    text = text.replace("YOll", "you")
    text = text.replace("scientllic", "scientific")
    text = text.replace("AI!-d", "And")
    text = text.replace("getiing", "getting")
    text = text.replace("There'S", "There's")
    text = text.replace("televisionprop", "television-prop")
    text = text.replace("televisionstudio", "television-studio")
    text = text.replace("fullfledged", "full-fledged")
    text = text.replace("contraexceptuality", "contraceptuality")
    text = text.replace("in the Back Bay? And writing books", "in the Back Bay? And wrote books")
    text = text.replace("uation. But if you take science seriously", "situation. But if you take science seriously")
    text = text.replace("Do you beat. remember", "Do you remember")
    text = text.replace("sit- The message", "situation. The message")
    text = text.replace("it's all a Turn on:", "it's all a beat. Turn on:")
    text = text.replace("LEARY:", "Leary:")
    text = text.replace("LETTVIN:", "Lettvin:")
    text = text.replace("INNISFREE:", "Innisfree:")
    text = text.replace("lNNISFREE:", "Innisfree:")
    text = text.replace("NNISFREE:", "Innisfree:")
    text = text.replace("QUESTION:", "Question:")
    text = re.sub(r"\b(Leary|Lettvin|Innisfree|Question):\s+", r"\1: ", text)
    return text


def is_bad_pull_quote(text: str) -> bool:
    lowered = text.lower()
    if lowered.startswith('"tbe ') or lowered.startswith("tbe "):
        return True
    if "bl uine" in lowered or "bluine" in lowered or "buman body" in lowered:
        return True
    if "gates 01 eden" in lowered or "language 01 god" in lowered:
        return True
    return False


def split_speaker_paragraphs(text: str) -> list[str]:
    text = re.sub(r"\s+(Leary|Lettvin|Innisfree|Question):\s+", r"\n\n\1: ", text)
    return [part.strip() for part in text.split("\n\n") if part.strip()]


def finalize_markdown(markdown: str) -> str:
    replacements = {
        "the Departments of\n\nBiology and Electrical Engineering": "the Departments of Biology and Electrical Engineering",
        "coming over your\n\nrowboat": "coming over your rowboat",
        "stage set of\n\nMIT, Cambridge": "stage set of MIT, Cambridge",
        "that we can't let high\n\nschool and college": "that we can't let high school and college",
        "but that's\n\nnot the way": "but that's not the way",
        "most of\n\nyou, that religion": "most of you, that religion",
        "energy sit-\n\nThe message": "energy situation.\n\nThe message",
        "it's all a\n\nTurn on:": "it's all a beat.\n\nTurn on:",
        "you'll be sitting around home smoking marijuana and preparing for your next\n\nweekly LSD session": "you'll be sitting around home smoking marijuana and preparing for your next weekly LSD session",
        "con-\n\nventional people": "conventional people",
        "chil-\n\ndren's heads": "children's heads",
        "stimu).ation": "stimulation",
        "R.tmosphere": "atmosphere",
        "telEwi'lion": "television",
        "bustomary": "customary",
        "marijuana for has": "marijuana has",
        "JudeoChristians": "Judeo-Christians",
        "\\lave": "have",
        "inert system": "energy system",
        "care-\n\nfully": "carefully",
        "because weekly LSD session like good tidy": "because you'll be sitting around home smoking marijuana and preparing for your next weekly LSD session like good, tidy",
        "what it's about -like LSD": "what it's about, like LSD",
        "It has to be Communabout. \" ists, witches": "It has to be Communists, witches",
        "It has to be Communists, witches, devils, possession": "There have to be Communists, witches, devils, possession",
        "There has to be Communists, witches, devils, possession": "There have to be Communists, witches, devils, possession",
        "It's a gamble, it's a risk, The sacrament": "It's a gamble, it's a risk. The sacrament",
        "in the last 50 years it hasn't been 'bl t d h.. POSSI e 0 0 researc on marIJuana. 'd If a f u 11 - fl e d ge, d k os h er, b ona f 1 e scientist": "for the last fifteen years it has been impossible to do research on marijuana. If a full-fledged, kosher, bona fide scientist",
        "Govern:ment": "Government",
        "They say,.": "They say,",
        "know what it's all about. It's written in the law": "we know what it's all about. It's written in the law",
        "Marijuana's a narcotic, addictive drug it causes": "Marijuana's a narcotic, addictive drug and it causes",
        "with You're certainly not going to give MIT a students": "You're certainly not going to give MIT students",
        "Because what would the Massachusetts was stat~ legislature": "Because what would the Massachusetts state legislature",
    }
    for source, target in replacements.items():
        markdown = markdown.replace(source, target)
    markdown = markdown.replace("subject-object-p~edicate", "subject-object-predicate")
    markdown = re.sub(r"high\s+\n\nschool", "high school", markdown)
    markdown = re.sub(r"but that's\s+\n\nnot the way", "but that's not the way", markdown)
    markdown = re.sub(r"most of\s+\n\nyou,", "most of you,", markdown)
    markdown = re.sub(r"energy sit-\s+\n\nThe message", "energy situation.\n\nThe message", markdown)
    markdown = re.sub(r"it's all a\s+\n\nTurn on:", "it's all a beat.\n\nTurn on:", markdown)
    markdown = repair_broken_paragraphs(markdown)
    for source, target in replacements.items():
        markdown = markdown.replace(source, target)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return markdown


def repair_broken_paragraphs(markdown: str) -> str:
    blocks = [block.strip() for block in re.split(r"\n{2,}", markdown) if block.strip()]
    repaired: list[str] = []
    for block in blocks:
        if not repaired or is_markdown_heading(block) or is_markdown_heading(repaired[-1]):
            repaired.append(block)
            continue

        previous = repaired[-1]
        if should_merge_ocr_block(previous, block):
            repaired[-1] = join_ocr_blocks(previous, block)
        else:
            repaired.append(block)
    return "\n\n".join(repaired).strip() + "\n"


def is_markdown_heading(block: str) -> bool:
    return bool(re.match(r"^#{1,6}\s+", block))


def should_merge_ocr_block(previous: str, current: str) -> bool:
    if re.match(r"^(Leary|Lettvin|Question|Innisfree):\s+", current):
        return False
    if previous.endswith("-"):
        return True
    if re.search(r"[,;:]\s*[\"']?$", previous):
        return True
    if not re.search(r"[.!?][\"']?$", previous):
        return True
    current_words = current.split()
    if len(current_words) <= 8 and not re.search(r"[.!?][\"']?$", current):
        return True
    if re.match(r"^[a-z),;:'\"]", current):
        return True
    return False


def join_ocr_blocks(previous: str, current: str) -> str:
    if previous.endswith("-"):
        joined = previous[:-1].rstrip() + current.lstrip()
    else:
        joined = previous.rstrip() + " " + current.lstrip()
    joined = re.sub(r"([A-Za-z])-\s+([A-Za-z])", r"\1\2", joined)
    joined = re.sub(r"\s+", " ", joined)
    return joined.strip()


def clean_youtube_broadcast_transcript(path: Path) -> str:
    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    lines = [line.strip() for line in raw.splitlines()]
    sections: list[tuple[str, list[str]]] = []
    current_heading = "Broadcast Introduction"
    current_lines: list[str] = []

    for line in lines:
        if not line:
            continue
        if re.fullmatch(r"\d+:\d{2}(?::\d{2})?", line):
            continue
        if re.fullmatch(r"\d+\s+(?:second|seconds|minute|minutes)(?:,\s+\d+\s+seconds?)?", line):
            continue
        if re.fullmatch(r"\[[^\]]+\]", line):
            continue
        chapter_match = re.match(r"Chapter\s+\d+:\s*(.+)", line)
        if chapter_match:
            if current_lines:
                sections.append((current_heading, current_lines))
                current_lines = []
            current_heading = normalize_youtube_heading(chapter_match.group(1))
            continue
        current_lines.append(line)

    if current_lines:
        sections.append((current_heading, current_lines))

    rendered = [
        "## NET Broadcast Transcript",
        "",
        "_Cleaned from the plaintext YouTube/broadcast transcript witness. Timestamps, chapter markers, applause cues, and automatic-caption debris have been removed._",
    ]
    for heading, section_lines in sections:
        text = clean_youtube_text(" ".join(section_lines))
        if not text:
            continue
        rendered.extend(["", f"### {heading}", ""])
        rendered.extend(paragraphize_youtube_section(heading, text))
    return "\n".join(rendered).strip() + "\n"


def normalize_youtube_heading(heading: str) -> str:
    heading = heading.strip()
    replacements = {
        "Introduction of speakers": "Broadcast Introduction",
        "Leary on psychedelics": "Leary: Psychedelics and Sacraments",
        "Techniques for getting high": "Leary: Techniques for Getting High",
        "The risks of LSD": "Leary: Risks and Scientific Evidence",
        "The case for marijuana": "Leary: Marijuana and Research",
        "Call to drop out": "Leary: Drop Out",
        "Lettvin's counter-argument": "Lettvin: Counterargument",
        "Critique of drug banning": "Lettvin: Drug Bans and LSD Risk",
        "Conclusion on self-control": "Leary: Reply and Self-Control",
    }
    return replacements.get(heading, heading)


def clean_youtube_text(text: str) -> str:
    replacements = {
        "kresy": "Kresge",
        "liry": "Leary",
        "lirry": "Leary",
        "Larry": "Leary",
        "Dr lein": "Dr. Lettvin",
        "lein": "Lettvin",
        "Dr Timothy": "Dr. Timothy",
        "Dr Jerome": "Dr. Jerome",
        "league for Spiritual discovery": "League for Spiritual Discovery",
        "Sacrament": "sacrament",
        "Chalice": "chalice",
        "Boston Water Supply": "Boston water supply",
        "mayo": "Mayer",
        "meccas": "Mekas",
        "milbrook": "Millbrook",
        "Gan Mayer": "Gunther Weil",
        "Alan Willis": "Alan Watts",
        "Silo cbin": "psilocybin",
        "silos cybin": "psilocybin",
        "psybin": "psilocybin",
        "syo cyon": "psilocybin",
        "What marshall MCL": "what Marshall McLuhan",
        "D code": "DNA code",
        "subject object predicates": "subject-object-predicate",
        "Turn the Page": "turn the page",
        "tun and drop": "tune in, drop",
        "getiing": "getting",
        "russing roulette": "Russian roulette",
        "Russian wet": "Russian roulette",
        "rushing roulette": "Russian roulette",
        "Hood students": "Harvard students",
        "harb": "Harvard",
        "beatnick": "beatniks",
        "Alan Ginsburg": "Allen Ginsberg",
        "Jack Carrick": "Jack Kerouac",
        "Kolkata": "Calcutta",
        "gats": "ghats",
        "Shiites": "sadhus",
        "ganja Shore": "ganja shop",
        "middle Ag": "middle age",
        "Naval": "navel",
        "atheological": "eschatological",
        "sartrean devising": "Sartrean divine",
        "superal": "supremal",
        "eyet": "eyelids",
        "heurst": "Hearst",
        "meno": "Manteno",
        "goblo": "gobbledygook",
        "leion": "lesion",
        "Aber barent": "aberrant",
        "nomaniac": "nymphomaniac",
        "complete ration": "complete abrogation",
        "relig experience": "religious experience",
        "Nur system": "nervous system",
        "dusi": "Dostoevsky",
        "new Eng Journal": "New England Journal",
    }
    text = re.sub(r"\bm\s*it\s*T\b", "MIT", text, flags=re.I)
    text = re.sub(r"\bm\s+it\b", "MIT", text, flags=re.I)
    text = re.sub(r"\bLD\b", "LSD", text)
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"(?i)(?<!\w)(uh|um)(?!\w)", "", text)
    text = re.sub(r"\s+", " ", text)
    text = text.replace(" ,", ",").replace(" .", ".")
    text = text.replace("we''ve", "we've")
    text = text.replace("The Observers", "the observers'")
    text = text.replace("Get High Get High", "get high")
    text = text.replace("10 ft", "ten feet")
    text = text.replace("2 billion", "two billion")
    text = text.replace("9 months", "nine months")
    text = text.replace("N9 months", "nine months")
    text = text.replace("Nnine months", "nine months")
    text = text.replace("swashing", "sloshing")
    text = text.replace("Candlelite", "candlelight")
    text = text.replace("father from television", "farther from television")
    text = text.replace("eal mc²", "E = mc2")
    text = text.replace("without LD", "without LSD")
    text = text.replace("100,000 million", "hundred, thousand, million")
    text = text.replace("th000 million", "thousand, million")
    text = text.replace("television prep Studio", "television-prop studio")
    text = text.replace("tantric sexuality", "tantric sexuality")
    text = text.replace("newon", "new one")
    text = text.replace("Cy experience", "psychedelic experience")
    text = text.replace("conven itional", "conventional")
    text = text.replace("greenish Village", "Greenwich Village")
    text = text.replace("miles and put strange", "mouths and put strange")
    text = text.replace("Energy System", "energy system")
    text = text.replace("judeo Christians", "Judeo-Christians")
    text = text.replace("INF or the Pagan", "infidel or the pagan")
    text = text.replace("bonaa", "bona fide")
    text = text.replace("massachusett", "Massachusetts")
    text = text.replace("de at Harvard", "dean at Harvard")
    text = text.replace("Daddy don't allow", "Daddy don't allow")
    text = text.replace("decidede", "decide")
    text = text.replace("inter thing", "interesting thing")
    text = text.replace("ases matter", "as a matter")
    text = text.replace("noway", "nowadays")
    text = text.replace("middleaged", "middle-aged")
    text = text.replace("peace candidate ha", "peace candidate.")
    text = text.replace("The Society", "the society")
    text = text.replace("simplications", "its implications")
    text = text.replace("fraan", "Freudian")
    text = text.replace("ice AG", "ice age")
    text = text.replace("turn around and learn", "turn on and learn")
    text = text.replace("as is very obvious", "as is very obvious")
    text = text.replace("S turn that damn thing off", "Turn that damn thing off.")
    text = text.replace("pack with the devil", "pact with the devil")
    text = text.replace("monkey paw packs", "monkey's paw pacts")
    text = text.replace("Strike strike", "strike")
    text = text.replace("slash slash", "slash-slash")
    text = text.replace("sha if you'll", "shorn, if you'll")
    text = text.replace("symetrical", "symmetrical")
    text = text.replace("take your Martini", "take your martini")
    text = text.replace("melan", "Mallon")
    text = text.replace("spurring the crime", "spurring the crime")
    text = text.replace("reissuance", "reassurance")
    text = text.replace("for free", "for free")
    text = text.replace("dVI Which", "Dostoevsky, which")
    text = text.replace("axe murderers", "axe murderers")
    text = text.replace("real need", "real neat")
    text = text.replace("recipe gotten", "recipe gotten")
    text = text.replace("you play for getting out", "you pay for getting out")
    text = text.replace("I can find in myself no joy", "I can find in myself no joy")
    text = text.replace("LD is the worst", "LSD is the worst")
    text = text.replace("I spending", "I spend")
    text = text.replace("gameplaying", "game-playing")
    text = text.replace("one evening this spring as part of a student run lecture series two men VI for The Souls", "One evening this spring, as part of a student-run lecture series, two men vied for the souls")
    text = text.replace("Dr Timothy Leary", "Dr. Timothy Leary")
    text = text.replace("Dr Leary", "Dr. Leary")
    text = text.replace("MIT Professor Jerome Lettvin", "MIT professor Jerome Lettvin")
    text = text.replace("given to to me", "given to me")
    text = text.replace("it's a odorless", "it's odorless")
    text = text.replace("it's uMIT's also", "It's also")
    text = text.replace("it water has many uses", "water has many uses")
    text = text.replace("matter of fact water can you remind you", "matter of fact, water can remind you")
    text = text.replace("the first nine months this trip", "the first nine months of this trip")
    text = text.replace("all the lights side please", "all the lights out please")
    text = text.replace("where we came from and what it's all about because that's what you hear how my te to learn", "where we came from and what it's all about, because that's what you're here at MIT to learn")
    text = text.replace("first fell that invented fire", "first fellow that invented fire")
    text = text.replace("we going too fast", "you're going too fast")
    text = text.replace("fire is U dangerous", "fire is dangerous")
    text = text.replace("should Peck out", "should peck out")
    text = text.replace("as I sitting now", "as I am sitting now")
    text = text.replace("you turn all the science", "particularly with science")
    text = text.replace("it's all a rhythMIT's all a beat", "it's all a rhythm, it's all a beat")
    text = text.replace("nervous systeMIT's", "nervous system. It's")
    text = text.replace("sticky black black molasses", "sticky black molasses")
    text = text.replace("theyve", "they've")
    text = text.replace("men haven't use", "men haven't used")
    text = text.replace("out of their Minds", "out of their minds")
    text = text.replace("drums in Africa", "the drums in Africa")
    text = text.replace("in first place", "in the first place")
    text = text.replace("they are longer and stronger", "there are longer and stronger")
    text = text.replace("an new one", "a new one")
    text = text.replace("most of you going to", "most of you are going to")
    text = text.replace("like good tidy", "like good, tidy")
    text = text.replace("there's no evidence", "there is no evidence")
    text = text.replace("Mantenopausal Institute", "Massachusetts Institute")
    text = text.replace("I want to tell you playing my cards", "I want to tell you, playing my cards")
    text = text.replace("I want to be interested", "I wasn't interested")
    text = text.replace("license in the city", "licensed in the city")
    text = text.replace("I smoke marijuana every day", "I smoked marijuana every day")
    text = text.replace("I sh shudder", "I shudder")
    text = text.replace("I say thi", "I say this")
    return text.strip()


def paragraphize_youtube_section(heading: str, text: str) -> list[str]:
    if heading == "Broadcast Introduction" or text.startswith("One evening this spring"):
        split_at = text.find("I am beginning tonight")
        if split_at > 0:
            narrator = text[:split_at].strip()
            leary = text[split_at:].strip()
            return [f"**Narrator:** {narrator}", f"**Leary:** {leary}"]
        return [f"**Narrator:** {text}"]

    speaker = "Leary" if heading.startswith("Leary") else "Lettvin" if heading.startswith("Lettvin") else ""
    paragraphs = split_long_text(text)
    if speaker and paragraphs:
        paragraphs[0] = f"**{speaker}:** {paragraphs[0]}"
    return paragraphs


def split_long_text(text: str, target_words: int = 145) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    paragraphs: list[str] = []
    current: list[str] = []
    count = 0
    for sentence in sentences:
        words = sentence.split()
        if len(words) > target_words:
            if current:
                paragraphs.append(" ".join(current).strip())
                current = []
                count = 0
            for index in range(0, len(words), target_words):
                paragraphs.append(" ".join(words[index:index + target_words]).strip())
            continue
        if current and count + len(words) > target_words:
            paragraphs.append(" ".join(current).strip())
            current = []
            count = 0
        current.append(sentence)
        count += len(words)
    if current:
        paragraphs.append(" ".join(current).strip())
    return paragraphs


def build_gold_transcript(innisfree_markdown: str, broadcast_markdown: str) -> str:
    parts = ["# LSD: Lettvin vs Leary", "", public_overview_text(), ""]
    for heading, body in split_transcript_sections(innisfree_markdown):
        parts.extend([f"## {heading}", "", body.strip(), ""])
    return repair_final_markdown("\n".join(parts).strip() + "\n")


def repair_final_markdown(markdown: str) -> str:
    # The OCR occasionally promotes running page heads into structural headings.
    # Repair the worst case here so the public reader has coherent sections.
    markdown = re.sub(
        r"\n\nOnly one statement in rebuttal\..*?one of the most profound religious experiences\n\n(?=Innisfree: Dr\. Leary)",
        "\n\n",
        markdown,
        flags=re.S,
    )
    markdown = re.sub(
        r"\n\n## Lettvin Reply\n\nthat he describes.*?opposed to revelation\s+the word \"psychosis\"\.",
        " the word \"psychosis\".",
        markdown,
        flags=re.S,
    )
    markdown = markdown.replace(
        "\n\nInnisfree: Dr. Leary, one of your comments",
        "\n\n## Q&A\n\nInnisfree: Dr. Leary, one of your comments",
        1,
    )
    markdown = markdown.replace("\n\n## Q&A\n\nhardest,", "\n\nhardest,")
    markdown = re.sub(
        r"\n\nI can, at this instant.*?bargain basement level, I don't know\. sciousness\.",
        " consciousness.",
        markdown,
        flags=re.S,
    )
    markdown = markdown.replace("consciousness. consciousness.", "consciousness.")
    return markdown


def public_overview_text() -> str:
    return (
        "This record presents a cleaned transcript of the May 1967 debate between Timothy Leary and MIT professor Jerome Lettvin at Kresge Auditorium. "
        "The exchange became one of the sharpest public confrontations over LSD in the late 1960s, setting Leary's sacramental and countercultural defense of psychedelics against Lettvin's warnings about judgment, risk, and intellectual surrender. "
        "The transcript is based on Innisfree's 1967 supplement *LSD: The Great Debate*, with the NET broadcast transcript used as a secondary check where the sources overlap. "
        "The original broadcast and source PDF are available in the adjacent tabs."
    )


def split_transcript_sections(markdown: str) -> list[tuple[str, str]]:
    body = strip_top_heading(markdown).strip()
    sections: list[tuple[str, list[str]]] = []
    current_heading = ""
    current_lines: list[str] = []

    for line in body.splitlines():
        heading_match = re.match(r"^##\s+(.+?)\s*$", line)
        if heading_match:
            if current_heading and current_lines:
                sections.append((current_heading, current_lines))
            current_heading = heading_match.group(1).strip()
            current_lines = []
            continue
        current_lines.append(line)

    if current_heading and current_lines:
        sections.append((current_heading, current_lines))

    cleaned_sections = []
    for heading, lines in sections:
        text = "\n".join(lines).strip()
        if not text:
            continue
        if "EDITORIAL BOARD:" in text:
            text = text.split("EDITORIAL BOARD:", 1)[0].strip()
        if heading == "The Leary-Lettvin Debate":
            continue
        if not text:
            continue
        cleaned_sections.append((heading, text))
    return cleaned_sections


def strip_top_heading(markdown: str) -> str:
    lines = markdown.splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    while lines and not lines[0].strip():
        lines = lines[1:]
    return "\n".join(lines)


def strip_layout_noise(lines: list[str]) -> list[str]:
    cleaned = []
    for line in lines:
        if "Supplement Issue" in line or re.search(r"\bPage\s*\d+\b", line):
            continue
        if not line.strip():
            cleaned.append("")
            continue
        cleaned.append(line.rstrip("\n"))
    return cleaned


def layout_page_paragraphs(page_number: int, lines: list[str]) -> list[str]:
    if page_number == 3:
        return layout_page_three(lines)

    columns = split_columns(lines)
    paragraphs = []
    for column in columns:
        paragraphs.extend(column_paragraphs(column))
    return paragraphs


def layout_page_three(lines: list[str]) -> list[str]:
    title_index = next((index for index, line in enumerate(lines) if "The Leary-Lettvin Debate" in line), -1)
    leary_index = next((index for index, line in enumerate(lines) if re.fullmatch(r"\s*Leary\s*", line)), -1)
    if leary_index == -1:
        return [paragraph for column in split_columns(lines) for paragraph in column_paragraphs(column)]

    paragraphs = []
    if title_index >= 0:
        paragraphs.append("The Leary-Lettvin Debate")

    intro_lines = lines[title_index + 1 if title_index >= 0 else 0:leary_index]
    intro_columns = split_columns(intro_lines)
    paragraphs.extend(column_paragraphs(intro_columns[0]))
    paragraphs.extend(column_paragraphs(intro_columns[1]))
    paragraphs.append("Leary")

    speech_lines = lines[leary_index + 1:]
    speech_columns = split_columns(speech_lines)
    for column in speech_columns:
        paragraphs.extend(column_paragraphs(column))
    return paragraphs


def split_columns(lines: list[str]) -> list[list[str]]:
    columns = [[] for _ in COLUMN_SLICES]
    for line in lines:
        padded = line.rstrip("\n")
        for index, (start, end) in enumerate(COLUMN_SLICES):
            columns[index].append(padded[start:end].rstrip())
    return columns


def column_paragraphs(lines: list[str]) -> list[str]:
    paragraphs = []
    current = []
    for line in lines:
        text = line.strip()
        if not text:
            if current:
                paragraphs.append(join_layout_lines(current))
                current = []
            continue
        current.append(text)
    if current:
        paragraphs.append(join_layout_lines(current))
    return [paragraph for paragraph in paragraphs if paragraph]


def join_layout_lines(lines: list[str]) -> str:
    text = ""
    for line in lines:
        if not text:
            text = line
        elif text.endswith("-"):
            text = text[:-1] + line
        else:
            text += " " + line
    return normalize_text(text)


def normalize_layout_paragraph(text: str) -> str:
    text = normalize_text(text)
    text = re.sub(r"\b(lNNISFREE|INNISFREE)\s*:", "Innisfree:", text)
    text = re.sub(r"\b(LEARY)\s*:", "Leary:", text)
    text = re.sub(r"\b(LETTVIN)\s*:", "Lettvin:", text)
    text = re.sub(r"\b(QUESTION|Question)\s*:", "Question:", text)
    text = re.sub(r"\s+(Leary|Lettvin|Innisfree|Question):\s+", r"\n\n\1: ", text)
    return text


def clean_heading_text(text: str) -> str:
    text = text.replace("Rep/y", "Reply")
    text = text.replace("LETTVJN", "LETTVIN")
    return text.strip()


def heading_for(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", text).strip()
    lowered = normalized.lower()
    headings = {
        "introduction": "Introduction",
        "leary": "Leary",
        "lettvin": "Lettvin",
        "leary reply": "Leary Reply",
        "lettvin reply": "Lettvin Reply",
        "q&a": "Q&A",
        "q & a": "Q&A",
    }
    if lowered in headings:
        return headings[lowered]
    return None


def normalize_speaker_label(text: str) -> str:
    text = re.sub(r"^(LEARY|Leary)\s*:\s*", "Leary: ", text)
    text = re.sub(r"^(LETTVIN|Lettvin|lettvin)\s*:\s*", "Lettvin: ", text)
    text = re.sub(r"^(INNISFREE|Innisfree)\s*:\s*", "Innisfree: ", text)
    text = re.sub(r"^(QUESTION|Question)\s*:\s*", "Question: ", text)
    return text


def ensure_thumbnail() -> Path:
    thumbnail_dir = IMPORT_DIR / "thumbnails"
    thumbnail_dir.mkdir(parents=True, exist_ok=True)
    output = thumbnail_dir / "lettvin-vs-leary-thumbnail.jpg"
    if THUMBNAIL_SOURCE_PATH.exists():
        shutil.copyfile(THUMBNAIL_SOURCE_PATH, output)
        return output

    prefix = thumbnail_dir / "lettvin-vs-leary-pdf"
    run(["pdftoppm", "-jpeg", "-f", "1", "-singlefile", "-scale-to", "900", str(PDF_PATH), str(prefix)])
    generated = prefix.with_suffix(".jpg")
    generated.replace(output)
    return output


def file_checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(name: str, rows: list[dict]) -> None:
    IMPORT_DIR.mkdir(parents=True, exist_ok=True)
    path = IMPORT_DIR / f"{name}.json"
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def build_import(markdown: str, thumbnail_path: Path) -> None:
    pdf_storage_path = f"documents/{DOCUMENT_ID}/original/lettvin-leary-lsd-debate.pdf"
    thumbnail_storage_path = f"documents/{DOCUMENT_ID}/thumbnail/lettvin-vs-leary.jpg"
    pdf_stat = PDF_PATH.stat()
    thumb_stat = thumbnail_path.stat()

    people = [
        {
            "id": uuid_for("person", "timothy-leary"),
            "slug": "timothy-leary",
            "name": "Timothy Leary",
            "sort_name": "Leary, Timothy",
            "birth_year": 1920,
            "death_year": 1996,
            "bio": "American psychologist and public advocate for psychedelic experience."
        },
        {
            "id": uuid_for("person", "jerome-lettvin"),
            "slug": "jerome-lettvin",
            "name": "Jerome Lettvin",
            "sort_name": "Lettvin, Jerome",
            "birth_year": 1920,
            "death_year": 2011,
            "bio": "MIT physician, neurophysiologist, and communications physiology professor."
        },
    ]

    tags = [
        tag_row("lsd", "LSD"),
        tag_row("religion", "Religion"),
        tag_row("television", "Television"),
        tag_row("counterculture", "Counterculture"),
        tag_row("government-research", "Government Research"),
    ]

    documents = [{
        "id": DOCUMENT_ID,
        "slug": SLUG,
        "title": "LSD: Lettvin vs Leary",
        "subtitle": "NET Journal debate with transcript from Innisfree's LSD: The Great Debate",
        "display_date": "November 20, 1967",
        "date_start": 1967,
        "date_end": 1967,
        "document_type": "Audio/Video",
        "medium": "Audio/Video",
        "language": "English",
        "region": "United States",
        "publication_place": "Boston, Massachusetts",
        "publisher": "WGBH / National Educational Television",
        "publication_title": "NET Journal",
        "summary": "A televised debate between Timothy Leary and MIT professor Jerome Lettvin over LSD, religion, danger, judgment, and social control, staged at MIT's Kresge Auditorium and later broadcast by NET Journal.",
        "abstract": "Timothy Leary and Jerome Lettvin debated LSD before a packed MIT audience in May 1967. The broadcast version juxtaposed Leary's sacramental defense of psychedelic experience with Lettvin's warnings about judgment, neurological risk, and seductive forms of surrender.",
        "editorial_note": "Transcript collated from the Innisfree supplement LSD: The Great Debate and a cleaned broadcast transcript witness. The Innisfree supplement remains the fullest source; the broadcast witness helps correct spoken passages and recover NET narration.",
        "citation": "“NET Journal; LSD: Lettvin vs Leary,” 1967-11-20, WGBH, Library of Congress, American Archive of Public Broadcasting (GBH and the Library of Congress), Boston, MA and Washington, DC. Transcript source: Innisfree, “LSD: The Great Debate,” supplement issue, 1967.",
        "rights_statement": "AAPB online access provided by GBH and the Library of Congress. Transcript PDF rights status pending review; contact the archive before republication.",
        "source_url": AAPB_URL,
        "external_access_url": AAPB_URL,
        "access_type": "hosted",
        "hosting_status": "hosted_transcript_external_media",
        "reader_mode": "video",
        "media_embed_url": AAPB_EMBED_URL,
        "cover_image_path": thumbnail_storage_path,
        "thumbnail_path": thumbnail_storage_path,
        "is_featured": False,
        "status": "published",
        "published_at": PUBLISHED_AT
    }]

    files = [{
        "id": uuid_for("file", f"{SLUG}:original-pdf"),
        "document_id": DOCUMENT_ID,
        "page_id": None,
        "kind": "original_pdf",
        "storage_path": pdf_storage_path,
        "mime_type": "application/pdf",
        "byte_size": pdf_stat.st_size,
        "checksum": file_checksum(PDF_PATH)
    }]

    assets = [
        {
            "local_path": os.path.relpath(PDF_PATH, IMPORT_DIR),
            "storage_path": pdf_storage_path,
            "mime_type": "application/pdf"
        },
        {
            "local_path": os.path.relpath(thumbnail_path, IMPORT_DIR),
            "storage_path": thumbnail_storage_path,
            "mime_type": mimetypes.guess_type(thumbnail_path)[0] or "image/jpeg",
            "byte_size": thumb_stat.st_size,
            "checksum": file_checksum(thumbnail_path)
        }
    ]

    transcript_sections = split_transcript_sections(markdown)
    document_sections = [
        {
            "id": uuid_for("document-section", f"{SLUG}:overview"),
            "document_id": DOCUMENT_ID,
            "position": 1,
            "heading": "Overview",
            "section_type": "overview",
            "body_format": "markdown",
            "body": public_overview_text()
        }
    ]
    for index, (heading, body) in enumerate(transcript_sections, start=2):
        document_sections.append({
            "id": uuid_for("document-section", f"{SLUG}:transcript:{heading}"),
            "document_id": DOCUMENT_ID,
            "position": index,
            "heading": heading,
            "section_type": "transcript",
            "body_format": "markdown",
            "body": body.strip()
        })

    pages = [{
        "id": uuid_for("page", f"{SLUG}:transcript"),
        "document_id": DOCUMENT_ID,
        "page_number": 1,
        "label": "Transcript",
        "ocr_text": markdown.strip(),
        "transcription_status": "ocr_cleaned",
        "language": "English"
    }]

    document_people = [
        {"document_id": DOCUMENT_ID, "person_id": uuid_for("person", "timothy-leary"), "role": "speaker"},
        {"document_id": DOCUMENT_ID, "person_id": uuid_for("person", "jerome-lettvin"), "role": "speaker"},
    ]

    document_tags = [{"document_id": DOCUMENT_ID, "tag_id": tag["id"]} for tag in tags]

    write_json("documents", documents)
    write_json("files", files)
    write_json("assets", assets)
    write_json("document_sections", document_sections)
    write_json("pages", pages)
    write_json("people", people)
    write_json("document_people", document_people)
    write_json("tags", tags)
    write_json("document_tags", document_tags)
    for name in ["collections", "collection_documents", "page_lines", "external_sources", "document_figures"]:
        write_json(name, [])


def tag_row(slug: str, label: str) -> dict:
    existing_id = existing_tag_ids().get(slug)
    return {
        "id": existing_id or uuid_for("tag", slug),
        "slug": slug,
        "name": label,
        "description": "",
        "tag_type": "topic"
    }


def existing_tag_ids() -> dict[str, str]:
    tags_path = ROOT / "data" / "squarespace-import" / "tags.json"
    if not tags_path.exists():
        return {}
    rows = json.loads(tags_path.read_text(encoding="utf-8"))
    return {row["slug"]: row["id"] for row in rows if row.get("slug") and row.get("id")}


def main() -> None:
    if not PDF_PATH.exists():
        raise SystemExit(f"Missing source PDF: {PDF_PATH}")

    IMPORT_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=SOURCE_DIR) as tmpdir:
        xml_path = Path(tmpdir) / "lettvin-leary-bbox.xml"
        run(["pdftotext", "-bbox-layout", str(PDF_PATH), str(xml_path)])
        pages = extract_line_entries(xml_path)

    innisfree_markdown = clean_markdown(format_line_markdown(pages))
    broadcast_markdown = clean_youtube_broadcast_transcript(YOUTUBE_TRANSCRIPT_PATH) if YOUTUBE_TRANSCRIPT_PATH.exists() else ""
    markdown = build_gold_transcript(innisfree_markdown, broadcast_markdown)
    TRANSCRIPT_PATH.write_text(innisfree_markdown, encoding="utf-8")
    WORK_TRANSCRIPT_PATH.parent.mkdir(parents=True, exist_ok=True)
    WORK_TRANSCRIPT_PATH.write_text(innisfree_markdown, encoding="utf-8")
    FINAL_TRANSCRIPT_PATH.parent.mkdir(parents=True, exist_ok=True)
    FINAL_TRANSCRIPT_PATH.write_text(markdown, encoding="utf-8")
    issues = write_reports(markdown, REPORT_DIR)
    thumbnail_path = ensure_thumbnail()
    build_import(markdown, thumbnail_path)
    print(f"Wrote {TRANSCRIPT_PATH.relative_to(ROOT)}")
    print(f"Wrote {WORK_TRANSCRIPT_PATH.relative_to(ROOT)}")
    print(f"Wrote {FINAL_TRANSCRIPT_PATH.relative_to(ROOT)}")
    print(f"Wrote cleanup reports in {REPORT_DIR.relative_to(ROOT)} ({len(issues)} suspect passages)")
    print(f"Wrote import staging in {IMPORT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
