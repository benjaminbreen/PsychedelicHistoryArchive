#!/usr/bin/env python3
"""Convert a local text corpus manifest into Supabase-ready staging files."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import mimetypes
import re
import shutil
import textwrap
import uuid
from pathlib import Path


PROJECT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "psychedelicarchive.com")
DEFAULT_CORPUS_DIR = Path("nitrous oxide:ether")
DEFAULT_MANIFEST = DEFAULT_CORPUS_DIR / "texts" / "manifest.jsonl"
DEFAULT_OUT = Path("data/nitrous-ether-import")

IMAGE_MAP = {
    "davy_1800_researches_nitrous_oxide": Path("archive-site/public/images/sources/humphry-davy.jpg"),
    "blood_1874_anaesthetic_revelation": Path("archive-site/public/images/sources/anaesthetic-revelation.jpg"),
    "james_1882_subjective_effects_nitrous_oxide": Path("archive-site/public/images/sources/william-james-self-portrait.jpg"),
    "james_1874_review_blood": Path("archive-site/public/images/sources/william-james-young.jpg"),
    "james_1897_will_to_believe_on_some_hegelisms": Path("archive-site/public/images/sources/william-james-self-portrait.jpg"),
    "james_1902_varieties_mysticism": Path("archive-site/public/images/sources/william-james-young.jpg"),
    "james_1909_pluralistic_universe": Path("archive-site/public/images/sources/william-james-self-portrait.jpg"),
    "james_1910_pluralistic_mystic": Path("archive-site/public/images/sources/william-james-young.jpg"),
    "blood_1920_pluriverse": Path("archive-site/public/images/sources/anaesthetic-revelation.jpg"),
    "wellcome_1910_anaesthetics_antient_modern": Path("archive-site/public/images/sources/anaesthetic-revelation.jpg"),
}


def stable_uuid(prefix: str, value: str) -> str:
    return str(uuid.uuid5(PROJECT_NAMESPACE, f"{prefix}:{value}"))


def slugify(value: str, fallback: str = "untitled") -> str:
    value = value.strip().lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or fallback


def era_for_year(year: int) -> str:
    if year < 1800:
        return "Pre-1800"
    if year < 1950:
        return "1800-1950"
    if year < 1970:
        return "1950-1970"
    if year < 2000:
        return "1970-2000"
    return "2000-Present"


def document_type_for(record: dict) -> str:
    genre = record.get("genre", "").lower()
    title = record.get("title", "").lower()
    if "review" in genre:
        return "Essay"
    if "letter" in genre:
        return "Letter"
    if "article" in genre or "report" in genre and "book" not in title:
        return "Academic Article"
    if "history" in genre:
        return "Book"
    if "treatise" in genre or "lectures" in genre or "essays" in genre:
        return "Book"
    return "Book"


def excerpt(text: str, fallback: str) -> str:
    body = "\n".join(text.splitlines()[5:]).strip() or text
    paragraphs = [re.sub(r"\s+", " ", item).strip() for item in re.split(r"\n{2,}", body)]
    for paragraph in paragraphs:
        if len(paragraph) >= 80:
            return paragraph[:317] + "..." if len(paragraph) > 320 else paragraph
    compact = re.sub(r"\s+", " ", fallback).strip()
    return compact[:317] + "..." if len(compact) > 320 else compact


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


def load_manifest(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def read_text(corpus_dir: Path, local_path: str) -> str:
    path = corpus_dir / local_path
    return path.read_text(errors="replace").strip()


def build_rows(corpus_dir: Path, manifest_path: Path) -> dict[str, list[dict]]:
    documents: list[dict] = []
    pages: list[dict] = []
    files: list[dict] = []
    external_sources: list[dict] = []
    people_by_slug: dict[str, dict] = {}
    tags_by_slug: dict[str, dict] = {}
    document_people: list[dict] = []
    document_tags: list[dict] = []
    assets: list[dict] = []
    archive_sources: list[dict] = []

    for record in load_manifest(manifest_path):
        text = read_text(corpus_dir, record["local_path"])
        slug = slugify(record["title"])
        document_id = stable_uuid("document", f"nitrous-ether:{record['id']}")
        page_id = stable_uuid("page", f"nitrous-ether:{record['id']}:1")
        year = int(record["year"])
        document_type = document_type_for(record)
        summary = record.get("why", "")
        author = record.get("author", "")
        image_source_path = IMAGE_MAP.get(record["id"])
        image_storage_path = ""
        if image_source_path and image_source_path.exists():
            image_name = image_source_path.name
            local_image_path = f"images/{slug}/01-{image_name}"
            image_storage_path = f"documents/{document_id}/{local_image_path}"
            data = image_source_path.read_bytes()
            width, height = image_dimensions(data)
            mime_type = mimetypes.guess_type(image_name)[0] or "image/jpeg"
            checksum = hashlib.sha256(data).hexdigest()
            file_id = stable_uuid("file", f"nitrous-ether:{record['id']}:{image_name}")
            files.append(
                {
                    "id": file_id,
                    "document_id": document_id,
                    "page_id": None,
                    "kind": "cover_image",
                    "storage_path": image_storage_path,
                    "mime_type": mime_type,
                    "byte_size": len(data),
                    "width": width,
                    "height": height,
                    "checksum": checksum,
                }
            )
            assets.append(
                {
                    "id": file_id,
                    "document_id": document_id,
                    "document_slug": slug,
                    "source_url": str(image_source_path),
                    "local_path": local_image_path,
                    "storage_path": image_storage_path,
                    "kind": "cover_image",
                    "mime_type": mime_type,
                    "downloaded": True,
                    "sha256": checksum,
                    "byte_size": len(data),
                    "width": width,
                    "height": height,
                }
            )

        documents.append(
            {
                "id": document_id,
                "slug": slug,
                "title": record["title"],
                "subtitle": "",
                "display_date": str(year),
                "date_start": year,
                "date_end": year,
                "document_type": document_type,
                "medium": "Text",
                "language": "English",
                "region": "",
                "publication_place": "",
                "publisher": "",
                "summary": summary,
                "abstract": summary,
                "editorial_note": "Imported from local nitrous oxide/ether corpus manifest; metadata needs review before publication.",
                "citation": f"{author}. {record['title']}. {year}.",
                "rights_statement": record.get("rights", ""),
                "source_url": record.get("source_url", ""),
                "external_access_url": record.get("source_url", ""),
                "access_type": "hosted",
                "hosting_status": "transcript_only",
                "cover_image_path": image_storage_path,
                "thumbnail_path": image_storage_path,
                "is_featured": record.get("rank") in {1, 2, 3},
                "status": "published",
                "published_at": None,
            }
        )

        pages.append(
            {
                "id": page_id,
                "document_id": document_id,
                "page_number": 1,
                "label": "Full text",
                "readable_image_path": "",
                "thumbnail_image_path": "",
                "ocr_text": text,
                "ocr_confidence": None,
                "transcription_status": "reviewed",
            }
        )

        if record.get("source_url"):
            external_sources.append(
                {
                    "id": stable_uuid("external_source", f"nitrous-ether:{record['id']}:{record['source_url']}"),
                    "document_id": document_id,
                    "repository_name": repository_name(record["source_url"]),
                    "institution_name": "",
                    "url": record["source_url"],
                    "access_label": "Original source",
                    "stable_identifier": record["source_url"],
                    "rights_note": record.get("rights", ""),
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

        tag_values = [
            ("genre", record.get("genre", "")),
            ("topic", "Anaesthetic revelation"),
            ("topic", "Nitrous oxide and ether"),
            ("era", era_for_year(year)),
        ]
        tag_values.extend(("substance", substance) for substance in record.get("substances", []))

        for tag_type, tag_name in tag_values:
            if not tag_name:
                continue
            tag_slug = slugify(tag_name)
            tags_by_slug.setdefault(
                tag_slug,
                {
                    "id": stable_uuid("tag", tag_slug),
                    "slug": tag_slug,
                    "name": tag_name,
                    "description": "",
                    "tag_type": tag_type,
                },
            )
            document_tags.append({"document_id": document_id, "tag_id": tags_by_slug[tag_slug]["id"]})

        archive_sources.append(
            {
                "id": record["id"],
                "slug": slug,
                "title": record["title"],
                "author": author,
                "year": year,
                "displayDate": str(year),
                "type": document_type,
                "medium": "Text",
                "era": era_for_year(year),
                "region": "Unknown",
                "language": "English",
                "tags": [name for _, name in tag_values if name],
                "people": [author] if author else [],
                "substances": record.get("substances", []),
                "summary": summary,
                "excerpt": excerpt(text, summary),
                "citation": f"{author}. {record['title']}. {year}.",
                "rights": record.get("rights", ""),
                "sourceUrl": record.get("source_url", ""),
                "accessType": "hosted",
                "hostingStatus": "transcript_only",
                "wordCount": record.get("word_count_approx", len(re.findall(r'\\b\\w+\\b', text))),
                "addedDate": "",
                "featured": record.get("rank") in {1, 2, 3},
                "imageTone": "paper",
                "imagePath": f"/imported/nitrous-ether/{image_storage_path}" if image_storage_path else "",
                "imageAlt": record["title"],
                "transcript": text,
            }
        )

    document_tags = [dict(items) for items in {tuple(sorted(row.items())) for row in document_tags}]
    document_people = [dict(items) for items in {tuple(sorted(row.items())) for row in document_people}]

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


def repository_name(url: str) -> str:
    if "gutenberg.org" in url:
        return "Project Gutenberg"
    if "archive.org" in url:
        return "Internet Archive"
    if "wellcome" in url:
        return "Wellcome Collection"
    return "External source"


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


def copy_assets(out_dir: Path, assets: list[dict]) -> None:
    for asset in assets:
        source = Path(asset["source_url"])
        target = out_dir / asset["local_path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)


def write_readme(out_dir: Path, rows: dict[str, list[dict]], manifest_path: Path) -> None:
    readme = f"""# Nitrous Oxide/Ether Corpus Import Staging

Generated from `{manifest_path}`.

This folder stages the broader local `texts/` corpus as Supabase rows using the
same schema as the Squarespace import.

## Counts

- Documents: {len(rows["documents"])}
- Pages: {len(rows["pages"])}
- Files/assets: {len(rows["files"])}
- External sources: {len(rows["external_sources"])}
- People: {len(rows["people"])}
- Tags: {len(rows["tags"])}

The `first_hand/` excerpt layer is intentionally not included in this staging
pass, to avoid duplicating excerpts before the main documents are reviewed.
"""
    out_dir.joinpath("README.md").write_text(textwrap.dedent(readme).strip() + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus-dir", type=Path, default=DEFAULT_CORPUS_DIR)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    rows = build_rows(args.corpus_dir, args.manifest)
    args.out.mkdir(parents=True, exist_ok=True)
    copy_assets(args.out, rows["assets"])

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
        if name != "archive_sources":
            write_csv(args.out / f"{name}.csv", rows[name])

    write_jsonl(args.out / "archive_sources.jsonl", rows["archive_sources"])
    write_readme(args.out, rows, args.manifest)

    print(f"Wrote {len(rows['documents'])} documents to {args.out}")


if __name__ == "__main__":
    main()
