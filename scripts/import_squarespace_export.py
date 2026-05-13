#!/usr/bin/env python3
"""Convert the Squarespace WordPress export into Supabase-ready staging files."""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import mimetypes
import re
import textwrap
import urllib.parse
import urllib.request
import uuid
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "wp": "http://wordpress.org/export/1.2/",
}

PROJECT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "psychedelicarchive.com")
DEFAULT_EXPORT = Path("Squarespace-Wordpress-Export-05-13-2026.xml")
DEFAULT_OUT = Path("data/squarespace-import")

POST_TYPE_MAP = {
    "academic-articles": "Academic Article",
    "audio-recordings": "Audio/Video",
    "documentary-film": "Film",
    "field-notes": "Field Notes",
    "manuscripts": "Manuscript",
    "medical-film": "Film",
    "newspaper-articles": "Newspaper Article",
    "printed-books": "Book",
    "testimony": "Testimony",
}

MEDIUM_MAP = {
    "audio-recordings": "Audio/Video",
    "documentary-film": "Audio/Video",
    "medical-film": "Audio/Video",
    "newspaper-articles": "Text",
    "academic-articles": "Text",
    "printed-books": "Text",
    "manuscripts": "Text",
    "field-notes": "Text",
    "testimony": "Text",
}

REGION_TAGS = {
    "argentina": "Argentina",
    "united-states": "United States",
    "amazonia": "Amazonia",
}

SUBSTANCE_TAGS = {
    "ayahuasca",
    "cannabis",
    "lsd",
    "nitrous-oxide",
    "mescal",
    "mescaline",
    "peyote",
}


@dataclass
class Category:
    domain: str
    nicename: str
    name: str


def text_of(parent: ET.Element, tag: str) -> str:
    node = parent.find(tag, NS)
    return "" if node is None or node.text is None else node.text.strip()


def stable_uuid(prefix: str, value: str) -> str:
    return str(uuid.uuid5(PROJECT_NAMESPACE, f"{prefix}:{value}"))


def slugify(value: str, fallback: str = "untitled") -> str:
    value = html.unescape(value).strip().lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or fallback


def strip_query(url: str) -> str:
    parsed = urllib.parse.urlsplit(html.unescape(url))
    return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))


def clean_url(raw: str) -> str:
    raw = html.unescape(raw).strip().rstrip('",')
    raw = raw.replace("\\/", "/")
    return raw


def extract_image_urls(content: str) -> list[str]:
    urls = set()
    for raw in re.findall(r"https?://images\.squarespace-cdn\.com/[^\s\"'<>\\\]]+", content):
        url = clean_url(raw)
        url = url.split("&quot;")[0].split("%22")[0]
        urls.add(strip_query(url))
    return sorted(urls)


def html_to_text(content: str) -> str:
    content = html.unescape(content)
    content = re.sub(r"(?is)<(script|style).*?</\1>", " ", content)
    content = re.sub(r"(?i)<br\s*/?>", "\n", content)
    content = re.sub(r"(?i)</(p|div|h[1-6]|blockquote|li|section|article)>", "\n", content)
    content = re.sub(r"(?is)<[^>]+>", " ", content)
    content = html.unescape(content)
    content = re.sub(r"[ \t\r\f\v]+", " ", content)
    content = re.sub(r"\n\s+", "\n", content)
    content = re.sub(r"\n{3,}", "\n\n", content)
    return content.strip()


def extract_summary(content: str, text: str) -> str:
    paras = [
        html.unescape(re.sub(r"(?is)<[^>]+>", " ", m)).strip()
        for m in re.findall(r"(?is)<p[^>]*>(.*?)</p>", content)
    ]
    for para in paras:
        para = re.sub(r"\s+", " ", para)
        if len(para) >= 40 and not para.lower().startswith(("author:", "authors:", "date:", "source:")):
            return para[:497] + "..." if len(para) > 500 else para
    compact = re.sub(r"\s+", " ", text).strip()
    return compact[:497] + "..." if len(compact) > 500 else compact


def extract_labeled_value(text: str, label: str) -> str:
    pattern = rf"(?im)^\s*{re.escape(label)}\s*:\s*(.+)$"
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""


def extract_year(title: str, display_date: str, tags: list[Category]) -> int | None:
    candidates = [title, display_date, " ".join(c.name for c in tags)]
    for candidate in candidates:
        match = re.search(r"\b(1[5-9]\d{2}|20\d{2})\b", candidate)
        if match:
            return int(match.group(1))
    return None


def era_for_year(year: int | None) -> str:
    if year is None:
        return ""
    if year < 1800:
        return "Pre-1800"
    if year < 1950:
        return "1800-1950"
    if year < 1970:
        return "1950-1970"
    if year < 2000:
        return "1970-2000"
    return "2000-Present"


def title_without_year(title: str) -> str:
    return re.sub(r"^\s*(1[5-9]\d{2}|20\d{2})\s*:\s*", "", title).strip()


def infer_document_type(categories: list[Category]) -> str:
    for category in categories:
        if category.domain == "category" and category.nicename in POST_TYPE_MAP:
            return POST_TYPE_MAP[category.nicename]
    return "Source"


def infer_medium(categories: list[Category]) -> str:
    for category in categories:
        if category.nicename in MEDIUM_MAP:
            return MEDIUM_MAP[category.nicename]
    return "Text"


def infer_region(categories: list[Category]) -> str:
    for category in categories:
        if category.nicename in REGION_TAGS:
            return REGION_TAGS[category.nicename]
    return ""


def local_asset_path(document_slug: str, url: str, index: int) -> str:
    parsed = urllib.parse.urlsplit(url)
    name = urllib.parse.unquote(Path(parsed.path).name).replace("+", " ")
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-") or f"image-{index:02d}.jpg"
    suffix = Path(safe_name).suffix.lower()
    if not suffix:
        suffix = ".jpg"
        safe_name += suffix
    return f"images/{document_slug}/{index:02d}-{safe_name}"


def image_dimensions(data: bytes) -> tuple[int | None, int | None]:
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    if data[:6] in (b"GIF87a", b"GIF89a") and len(data) >= 10:
        return int.from_bytes(data[6:8], "little"), int.from_bytes(data[8:10], "little")
    if data.startswith(b"\xff\xd8"):
        index = 2
        while index + 9 < len(data):
            if data[index] != 0xFF:
                index += 1
                continue
            marker = data[index + 1]
            index += 2
            if marker in (0xD8, 0xD9):
                continue
            if index + 2 > len(data):
                break
            length = int.from_bytes(data[index:index + 2], "big")
            if length < 2 or index + length > len(data):
                break
            if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                height = int.from_bytes(data[index + 3:index + 5], "big")
                width = int.from_bytes(data[index + 5:index + 7], "big")
                return width, height
            index += length
    return None, None


def build_rows(root: ET.Element) -> dict[str, list[dict]]:
    documents: list[dict] = []
    pages: list[dict] = []
    files: list[dict] = []
    external_sources: list[dict] = []
    tags_by_slug: dict[str, dict] = {}
    people_by_slug: dict[str, dict] = {}
    document_tags: list[dict] = []
    document_people: list[dict] = []
    assets: list[dict] = []
    archive_sources: list[dict] = []

    for item in root.findall("./channel/item"):
        post_type = text_of(item, "wp:post_type")
        status = text_of(item, "wp:status")
        if post_type != "post":
            continue

        title = text_of(item, "title")
        if not title:
            continue

        post_name = text_of(item, "wp:post_name") or slugify(title)
        link = text_of(item, "link")
        content = text_of(item, "content:encoded")
        body_text = html_to_text(content)
        summary = extract_summary(content, body_text)
        display_date = extract_labeled_value(body_text, "Date")
        source_note = extract_labeled_value(body_text, "Source")
        author = extract_labeled_value(body_text, "Author") or text_of(item, "dc:creator")
        categories = [
            Category(
                domain=cat.attrib.get("domain", ""),
                nicename=cat.attrib.get("nicename", ""),
                name=(cat.text or "").strip(),
            )
            for cat in item.findall("category")
        ]
        year = extract_year(title, display_date, categories)
        document_id = stable_uuid("document", post_name)
        page_id = stable_uuid("page", f"{post_name}:1")
        image_urls = extract_image_urls(content)
        published = status == "publish"
        full_url = urllib.parse.urljoin("https://www.psychedelicarchive.com", link)
        tag_names = [c.name for c in categories if c.name]
        substance_names = [
            c.name for c in categories if c.nicename in SUBSTANCE_TAGS or c.domain == "post_tag" and c.nicename in SUBSTANCE_TAGS
        ]
        document_type = infer_document_type(categories)
        medium = infer_medium(categories)
        cover_path = (
            f"documents/{document_id}/{local_asset_path(post_name, image_urls[0], 1)}"
            if image_urls
            else ""
        )

        document = {
            "id": document_id,
            "slug": post_name,
            "title": title_without_year(title),
            "subtitle": "",
            "display_date": display_date or (str(year) if year else ""),
            "date_start": year,
            "date_end": year,
            "document_type": document_type,
            "medium": medium,
            "language": "English",
            "region": infer_region(categories),
            "publication_place": "",
            "publisher": "",
            "summary": summary,
            "abstract": summary,
            "editorial_note": "Imported from Squarespace WordPress export; needs metadata review.",
            "citation": source_note,
            "rights_statement": "Needs rights review before republication.",
            "source_url": full_url,
            "external_access_url": full_url,
            "access_type": "hosted" if body_text else "external",
            "hosting_status": "transcript_only" if body_text else "external_link",
            "cover_image_path": cover_path,
            "thumbnail_path": cover_path,
            "is_featured": False,
            "status": "published" if published else "draft",
            "published_at": text_of(item, "wp:post_date_gmt") or None,
        }
        documents.append(document)

        pages.append(
            {
                "id": page_id,
                "document_id": document_id,
                "page_number": 1,
                "label": "Imported page body",
                "readable_image_path": "",
                "thumbnail_image_path": "",
                "ocr_text": body_text,
                "ocr_confidence": None,
                "transcription_status": "reviewed" if body_text else "none",
            }
        )

        external_sources.append(
            {
                "id": stable_uuid("external_source", full_url),
                "document_id": document_id,
                "repository_name": "The Psychedelic History Archive on Squarespace",
                "institution_name": "The Psychedelic History Archive",
                "url": full_url,
                "access_label": "Original Squarespace page",
                "stable_identifier": link,
                "rights_note": "Imported source page URL for migration audit.",
                "is_primary": True,
                "last_checked_at": None,
            }
        )

        if author:
            person_slug = slugify(author)
            people_by_slug.setdefault(
                person_slug,
                {
                    "id": stable_uuid("person", person_slug),
                    "slug": person_slug,
                    "name": author,
                    "sort_name": author,
                    "birth_year": None,
                    "death_year": None,
                    "bio": "",
                },
            )
            document_people.append(
                {
                    "document_id": document_id,
                    "person_id": people_by_slug[person_slug]["id"],
                    "role": "author",
                }
            )

        for category in categories:
            if not category.name:
                continue
            tag_slug = category.nicename or slugify(category.name)
            tag_type = "topic"
            if category.nicename in SUBSTANCE_TAGS:
                tag_type = "substance"
            elif category.domain == "category":
                tag_type = "genre"
            tags_by_slug.setdefault(
                tag_slug,
                {
                    "id": stable_uuid("tag", tag_slug),
                    "slug": tag_slug,
                    "name": category.name,
                    "description": "",
                    "tag_type": tag_type,
                },
            )
            document_tags.append({"document_id": document_id, "tag_id": tags_by_slug[tag_slug]["id"]})

        for index, url in enumerate(image_urls, start=1):
            storage_path = local_asset_path(post_name, url, index)
            supabase_storage_path = f"documents/{document_id}/{storage_path}"
            mime_type = mimetypes.guess_type(urllib.parse.urlsplit(url).path)[0] or "image/jpeg"
            file_id = stable_uuid("file", f"{document_id}:{url}")
            files.append(
                {
                    "id": file_id,
                    "document_id": document_id,
                    "page_id": None,
                    "kind": "cover_image" if index == 1 else "supplementary_file",
                    "storage_path": supabase_storage_path,
                    "mime_type": mime_type,
                    "byte_size": None,
                    "width": None,
                    "height": None,
                    "checksum": "",
                }
            )
            assets.append(
                {
                    "id": file_id,
                    "document_id": document_id,
                    "document_slug": post_name,
                    "source_url": url,
                    "local_path": storage_path,
                    "storage_path": supabase_storage_path,
                    "kind": "cover_image" if index == 1 else "supplementary_file",
                    "mime_type": mime_type,
                    "downloaded": False,
                    "sha256": "",
                }
            )

        archive_sources.append(
            {
                "id": post_name,
                "slug": post_name,
                "title": title_without_year(title),
                "author": author or "Ben Breen",
                "year": year or 0,
                "displayDate": display_date or (str(year) if year else ""),
                "type": document_type,
                "medium": medium,
                "era": era_for_year(year),
                "region": infer_region(categories) or "Unknown",
                "language": "English",
                "tags": tag_names,
                "people": [author] if author else [],
                "substances": substance_names,
                "summary": summary,
                "excerpt": summary,
                "citation": source_note,
                "rights": "Needs rights review before republication.",
                "sourceUrl": full_url,
                "accessType": "hosted" if body_text else "external",
                "hostingStatus": "transcript_only" if body_text else "external_link",
                "wordCount": len(re.findall(r"\b\w+\b", body_text)),
                "addedDate": text_of(item, "wp:post_date")[:10],
                "featured": False,
                "imageTone": "paper",
                "imagePath": f"/imported/squarespace/{cover_path}" if cover_path else "",
                "imageAlt": title,
            }
        )

    document_tags = [dict(t) for t in {tuple(sorted(row.items())) for row in document_tags}]
    document_people = [dict(t) for t in {tuple(sorted(row.items())) for row in document_people}]

    return {
        "documents": documents,
        "pages": pages,
        "files": files,
        "external_sources": external_sources,
        "people": sorted(people_by_slug.values(), key=lambda row: row["slug"]),
        "document_people": document_people,
        "tags": sorted(tags_by_slug.values(), key=lambda row: row["slug"]),
        "document_tags": document_tags,
        "assets": assets,
        "archive_sources": archive_sources,
    }


def write_json(path: Path, rows: object) -> None:
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")


def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        path.write_text("")
        return
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows))


def write_text_artifacts(out_dir: Path, export_path: Path) -> None:
    body_text_dir = out_dir / "body-text"
    body_html_dir = out_dir / "body-html"
    body_text_dir.mkdir(parents=True, exist_ok=True)
    body_html_dir.mkdir(parents=True, exist_ok=True)

    # Re-read from the source rows so generated filenames remain stable.
    xml_root = ET.parse(export_path).getroot()
    for item in xml_root.findall("./channel/item"):
        if text_of(item, "wp:post_type") != "post":
            continue
        title = text_of(item, "title")
        if not title:
            continue
        post_name = text_of(item, "wp:post_name") or slugify(title)
        content = text_of(item, "content:encoded")
        body_html_dir.joinpath(f"{post_name}.html").write_text(content)
        body_text_dir.joinpath(f"{post_name}.txt").write_text(html_to_text(content) + "\n")


def download_assets(out_dir: Path, assets: list[dict]) -> list[dict]:
    image_root = out_dir / "images"
    image_root.mkdir(parents=True, exist_ok=True)
    updated = []
    for asset in assets:
        local = out_dir / asset["local_path"]
        local.parent.mkdir(parents=True, exist_ok=True)
        row = dict(asset)
        if local.exists() and local.stat().st_size > 0:
            data = local.read_bytes()
            width, height = image_dimensions(data)
            row["downloaded"] = True
            row["byte_size"] = len(data)
            row["width"] = width
            row["height"] = height
            row["sha256"] = hashlib.sha256(data).hexdigest()
            updated.append(row)
            continue
        request = urllib.request.Request(asset["source_url"], headers={"User-Agent": "PsychedelicArchiveMigration/1.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read()
        local.write_bytes(data)
        width, height = image_dimensions(data)
        row["downloaded"] = True
        row["byte_size"] = len(data)
        row["width"] = width
        row["height"] = height
        row["sha256"] = hashlib.sha256(data).hexdigest()
        updated.append(row)
    return updated


def write_readme(out_dir: Path, rows: dict[str, list[dict]]) -> None:
    readme = f"""# Squarespace Import Staging

Generated from `Squarespace-Wordpress-Export-05-13-2026.xml`.

This folder is a reviewable staging area for migrating the existing Squarespace
site into the Supabase content model described in
`psychedelic-history-archive-design-plan.md`.

## Generated Tables

- `documents.json` / `documents.csv`: records for the Supabase `documents` table.
- `pages.json` / `pages.csv`: one imported text page per document, using the Squarespace body as `ocr_text`.
- `files.json` / `files.csv`: image/file records for the Supabase `files` table.
- `external_sources.json` / `external_sources.csv`: original Squarespace URLs for provenance.
- `people.json` / `people.csv` and `document_people.json` / `document_people.csv`: author relationships detected in page text.
- `tags.json` / `tags.csv` and `document_tags.json` / `document_tags.csv`: Squarespace categories and tags normalized as tag rows.
- `assets.json` / `assets.csv`: image download and future Supabase Storage upload manifest.
- `archive_sources.json`: compatibility export shaped like the current Next.js `ArchiveSource` type.
- `archive_sources.jsonl`: same compatibility records as JSON Lines.
- `body-html/`: raw Squarespace HTML per post.
- `body-text/`: cleaned text per post.

## Counts

- Documents: {len(rows["documents"])}
- Pages: {len(rows["pages"])}
- Files/assets: {len(rows["files"])}
- External sources: {len(rows["external_sources"])}
- People: {len(rows["people"])}
- Tags: {len(rows["tags"])}

## Review Notes

The importer is intentionally conservative. It preserves source URLs and body
text, but marks rights as needing review. It infers document type, medium,
region, era, and substances from existing Squarespace categories/tags where
possible. Before production upload, review citations, rights statements, author
roles, and image licensing.
"""
    out_dir.joinpath("README.md").write_text(textwrap.dedent(readme).strip() + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--export", type=Path, default=DEFAULT_EXPORT)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--download-images", action="store_true")
    args = parser.parse_args()

    root = ET.parse(args.export).getroot()
    rows = build_rows(root)
    args.out.mkdir(parents=True, exist_ok=True)

    if args.download_images:
        rows["assets"] = download_assets(args.out, rows["assets"])
        asset_by_id = {asset["id"]: asset for asset in rows["assets"]}
        for file_row in rows["files"]:
            asset = asset_by_id.get(file_row["id"])
            if asset:
                file_row["byte_size"] = asset.get("byte_size")
                file_row["width"] = asset.get("width")
                file_row["height"] = asset.get("height")
                file_row["checksum"] = asset.get("sha256", "")

    for name in [
        "documents",
        "pages",
        "files",
        "external_sources",
        "people",
        "document_people",
        "tags",
        "document_tags",
        "assets",
        "archive_sources",
    ]:
        write_json(args.out / f"{name}.json", rows[name])

    for name in [
        "documents",
        "pages",
        "files",
        "external_sources",
        "people",
        "document_people",
        "tags",
        "document_tags",
        "assets",
    ]:
        write_csv(args.out / f"{name}.csv", rows[name])
    write_jsonl(args.out / "archive_sources.jsonl", rows["archive_sources"])
    write_text_artifacts(args.out, args.export)
    write_readme(args.out, rows)

    print(f"Wrote {len(rows['documents'])} documents to {args.out}")
    print(f"Wrote {len(rows['assets'])} asset records")


if __name__ == "__main__":
    main()
