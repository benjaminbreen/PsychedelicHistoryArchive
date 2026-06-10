#!/usr/bin/env python3
import html
import json
import re
import subprocess
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IMPORT_DIR = ROOT / "data" / "latin-america-import"
SLUG = "el-contexto-cultural-de-un-alucinogeno-aborigen-banisteriopsis-caapi"
DOCUMENT_ID = "0d0ecc94-e4d5-5baf-b174-67112069445c"
PDF_PATH = IMPORT_DIR / "pdfs" / SLUG / "reichel-dolmatoff-1969-caapi.pdf"
TRANSLATION_PATH = IMPORT_DIR / "translations" / f"{SLUG}.md"
WORK_DIR = IMPORT_DIR / "work" / SLUG
IMAGE_PREFIX = WORK_DIR / "ocr-pages" / "page"
HOCR_DIR = WORK_DIR / "hocr"
SPANISH_TRANSCRIPT_PATH = WORK_DIR / "reichel-dolmatoff-1969-caapi-spanish-cleaned.md"
REPORT_PATH = WORK_DIR / "cleanup-report.json"

NS = {"x": "http://www.w3.org/1999/xhtml"}


def uuid_for(kind: str, value: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"{kind}:{value}"))


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def read_json(path: Path, default: list[dict]) -> list[dict]:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, rows: list[dict]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_ocr_assets() -> None:
    (WORK_DIR / "ocr-pages").mkdir(parents=True, exist_ok=True)
    HOCR_DIR.mkdir(parents=True, exist_ok=True)
    if not any((WORK_DIR / "ocr-pages").glob("page-*.png")):
        run(["pdftoppm", "-r", "300", "-png", str(PDF_PATH), str(IMAGE_PREFIX)])

    for image_path in sorted((WORK_DIR / "ocr-pages").glob("page-*.png")):
        stem = image_path.stem
        hocr_path = HOCR_DIR / f"{stem}.hocr"
        if hocr_path.exists():
            continue
        output_base = HOCR_DIR / stem
        run(["tesseract", str(image_path), str(output_base), "-l", "spa", "--psm", "1", "hocr"])


def parse_bbox(title: str) -> tuple[int, int, int, int]:
    match = re.search(r"bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", title)
    if not match:
        return (0, 0, 0, 0)
    return tuple(int(value) for value in match.groups())


def has_class(element: ET.Element, class_name: str) -> bool:
    return class_name in (element.attrib.get("class") or "").split()


def hocr_page_number(path: Path) -> int:
    match = re.search(r"(\d+)$", path.stem)
    if not match:
        raise ValueError(f"Could not parse page number from {path}")
    return int(match.group(1))


def line_text(line: ET.Element) -> str:
    words = []
    for word in line.findall(".//x:span", NS):
        if not has_class(word, "ocrx_word"):
            continue
        text = "".join(word.itertext()).strip()
        if text:
            words.append(html.unescape(text))
    return normalize_line(" ".join(words))


def parse_hocr(path: Path) -> list[dict]:
    tree = ET.parse(path)
    page = tree.find(".//x:div[@class='ocr_page']", NS)
    if page is None:
        return []
    width = parse_bbox(page.attrib.get("title", ""))[2]
    lines = []
    for span in tree.findall(".//x:span", NS):
        if not (has_class(span, "ocr_line") or has_class(span, "ocr_header")):
            continue
        text = line_text(span)
        x1, y1, x2, y2 = parse_bbox(span.attrib.get("title", ""))
        if not useful_line(text, x1, y1, x2, y2):
            continue
        lines.append({
            "page": hocr_page_number(path),
            "text": text,
            "x1": x1,
            "x2": x2,
            "y1": y1,
            "y2": y2,
            "center": (x1 + x2) / 2,
            "width": width,
        })
    return lines


def normalize_line(text: str) -> str:
    replacements = {
        "CAAPl": "CAAPI",
        "Caapl": "Caapi",
        "Banisteriopsis Caapi": "Banisteriopsis caapi",
        "B. Caapi": "B. caapi",
        "B. Rusbyana": "B. rusbyana",
        "Lingúística": "Lingüística",
        "Koch - Griúnberg": "Koch-Grünberg",
        "Koch - Grúnberg": "Koch-Grünberg",
        "Koch-Grimberg": "Koch-Grünberg",
        "Koch-Griinberg": "Koch-Grünberg",
        "Reichel - Dolmatoff": "Reichel-Dolmatoff",
        "UscAÁTEGUI": "USCÁTEGUI",
        "UscÁTEGUI": "USCÁTEGUI",
        "SCHULTES, RICHARD £VANS": "SCHULTES, RICHARD EVANS",
        "Hocn": "Hoch",
        "HOCn": "HOCH",
        "guburo moari": "guburo moari",
    }
    text = html.unescape(text)
    text = text.replace("—", "—")
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"([¿¡])\s+", r"\1", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def useful_line(text: str, x1: int, y1: int, x2: int, y2: int) -> bool:
    if not text:
        return False
    if re.fullmatch(r"[—=\-–_ ]*\d{1,3}[—=\-–_ ]*", text):
        return False
    if y1 > 3100 and re.search(r"\d", text):
        return False
    letters = len(re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]", text))
    if letters < 3:
        return False
    if letters / max(len(text), 1) < 0.35:
        return False
    if len(re.findall(r"\b[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\b", text)) >= 4 and len(text) < 45:
        return False
    return True


def page_columns(lines: list[dict]) -> list[dict]:
    if not lines:
        return []
    width = max(line["width"] for line in lines) or 2400
    middle = width / 2
    top = [line for line in lines if line["y1"] < 520 and line["x1"] < middle and line["x2"] > middle]
    left = [line for line in lines if line not in top and line["center"] < middle]
    right = [line for line in lines if line not in top and line["center"] >= middle]

    top.sort(key=lambda line: (line["y1"], line["x1"]))
    left.sort(key=lambda line: (line["y1"], line["x1"]))
    right.sort(key=lambda line: (line["y1"], line["x1"]))

    return top + left + right


def join_lines(lines: list[str]) -> str:
    paragraphs: list[str] = []
    current = ""
    previous_y_gap_heading = False
    for raw in lines:
        text = raw.strip()
        if not text:
            continue
        if is_heading(text):
            if current:
                paragraphs.append(current.strip())
                current = ""
            paragraphs.append(f"## {heading_case(text)}")
            previous_y_gap_heading = True
            continue
        if current.endswith("-"):
            current = current[:-1] + text
        elif current:
            current += " " + text
        else:
            current = text

        if previous_y_gap_heading and current:
            previous_y_gap_heading = False
    if current:
        paragraphs.append(current.strip())
    text = "\n\n".join(paragraphs)
    text = postprocess_text(text)
    return text.strip() + "\n"


def is_heading(text: str) -> bool:
    normalized = re.sub(r"[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]", "", text).strip()
    if normalized.upper() in {
        "INTRODUCCION",
        "EL CONTEXTO MITOLOGICO",
        "EL CONTEXTO RITUAL",
        "EL CONTEXTO VISIONARIO",
        "EL CONTEXTO PSICOLOGICO",
        "CONCLUSIONES",
        "BIBLIOGRAFIA",
    }:
        return True
    return False


def heading_case(text: str) -> str:
    headings = {
        "INTRODUCCION": "Introducción",
        "EL CONTEXTO MITOLOGICO": "El contexto mitológico",
        "EL CONTEXTO RITUAL": "El contexto ritual",
        "EL CONTEXTO VISIONARIO": "El contexto visionario",
        "EL CONTEXTO PSICOLOGICO": "El contexto psicológico",
        "CONCLUSIONES": "Conclusiones",
        "BIBLIOGRAFIA": "Bibliografía",
    }
    key = re.sub(r"[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]", "", text).strip().upper()
    return headings.get(key, text.title())


def postprocess_text(text: str) -> str:
    text = re.sub(r"\b([a-záéíóúüñ]{3,})-\s+([a-záéíóúüñ]{2,})\b", r"\1\2", text)
    text = text.replace("EL. CONTEXTO", "EL CONTEXTO")
    text = text.replace("ABORIGEN:", "ABORIGEN:")
    text = text.replace("INTRODUCCION", "## Introducción")
    text = text.replace("Por G. REICHEL - DOLMATOFF", "Por G. Reichel-Dolmatoff")
    text = text.replace("Instituto Colombiano de Antropología", "Instituto Colombiano de Antropología")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = text.replace(" ?!", "¹")
    return text


def build_spanish_transcript() -> str:
    ensure_ocr_assets()
    pages: dict[int, list[dict]] = {}
    for hocr_path in sorted(HOCR_DIR.glob("page-*.hocr")):
        page_number = hocr_page_number(hocr_path)
        pages[page_number] = page_columns(parse_hocr(hocr_path))

    ordered_lines = []
    for page_number in sorted(pages):
        if page_number in {19, 20, 21}:
            ordered_lines.extend(extract_plate_lines(pages[page_number]))
            continue
        ordered_lines.extend(line["text"] for line in pages[page_number])

    markdown = join_lines(ordered_lines)
    markdown = re.sub(
        r"^EL CONTEXTO CULTURAL DE UN ALUCINOGENO ABORIGEN:\s+BANISTERIOPSIS CAAPI\.",
        "# El contexto cultural de un alucinógeno aborigen: *Banisteriopsis caapi*",
        markdown,
        flags=re.IGNORECASE,
    )
    markdown = markdown.replace("Por G. REICHEL - DOLMATOFF", "Por G. Reichel-Dolmatoff")
    markdown = markdown.replace("Por G. REICHEL-DOLMATOFF", "Por G. Reichel-Dolmatoff")
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    SPANISH_TRANSCRIPT_PATH.write_text(markdown, encoding="utf-8")
    return markdown


def extract_plate_lines(lines: list[dict]) -> list[str]:
    captions = []
    for line in lines:
        text = line["text"]
        if re.search(r"L[ÁA]MINA|Banisteriopsis|bebida|intoxicado|dibujando|alucinaciones|ceremonia", text, re.I):
            captions.append(text)
    return captions


def split_markdown_sections(markdown: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, list[str]]] = []
    current_heading = ""
    current_lines: list[str] = []
    for line in markdown.splitlines():
        match = re.match(r"^##\s+(.+?)\s*$", line)
        if match:
            if current_heading and current_lines:
                sections.append((current_heading, current_lines))
            current_heading = match.group(1).strip()
            current_lines = []
        else:
            current_lines.append(line)
    if current_heading and current_lines:
        sections.append((current_heading, current_lines))
    return [(heading, "\n".join(lines).strip()) for heading, lines in sections if "\n".join(lines).strip()]


def remove_public_ocr_pages() -> None:
    pages_path = IMPORT_DIR / "pages.json"
    pages = read_json(pages_path, [])
    write_json(pages_path, [page for page in pages if page.get("document_id") != DOCUMENT_ID])


def public_overview() -> str:
    return (
        "Gerardo Reichel-Dolmatoff's 1969 article examines the Tukano use of yajé "
        "(*Banisteriopsis caapi*) in relation to mythology, ritual practice, social order, "
        "and visionary experience in the northwestern Colombian Amazon. The reader opens with "
        "an English translation prepared from the Spanish text, with the cleaned Spanish OCR "
        "and original PDF available for comparison."
    )


def remove_document_sections() -> None:
    sections_path = IMPORT_DIR / "document_sections.json"
    sections = [
        section for section in read_json(sections_path, [])
        if section.get("document_id") != DOCUMENT_ID
    ]
    write_json(sections_path, sections)


def update_document_note() -> None:
    documents_path = IMPORT_DIR / "documents.json"
    documents = read_json(documents_path, [])
    for document in documents:
        if document.get("id") != DOCUMENT_ID:
            continue
        document["reader_mode"] = "translation"
        document["hosting_status"] = "full_text"
        document["translation_note"] = (
            "English translation prepared by the Psychedelic History Archive from the Spanish article; "
            "consult the original PDF for formal quotation."
        )
    write_json(documents_path, documents)


def cleanup_stats(markdown: str) -> dict:
    return {
        "document_id": DOCUMENT_ID,
        "slug": SLUG,
        "spanish_transcript_path": str(SPANISH_TRANSCRIPT_PATH.relative_to(ROOT)),
        "word_count": len(re.findall(r"\b[\wÁÉÍÓÚÜÑáéíóúüñ-]+\b", markdown)),
        "section_count": len(split_markdown_sections(markdown)),
        "remaining_page_markers": markdown.count("--- Page"),
        "single_letter_runs": len(re.findall(r"(?:\b[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\b\s*){4,}", markdown)),
        "digit_letter_noise": len(re.findall(r"\b(?=\w*\d)(?=\w*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])\w{4,}\b", markdown)),
    }


def main() -> None:
    markdown = build_spanish_transcript()
    remove_public_ocr_pages()
    remove_document_sections()
    update_document_note()
    stats = cleanup_stats(markdown)
    REPORT_PATH.write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
