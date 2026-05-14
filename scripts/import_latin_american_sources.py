#!/usr/bin/env python3
"""Build Supabase staging files for the Latin American research corpus."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import mimetypes
import re
import shutil
import textwrap
import unicodedata
import uuid
from pathlib import Path


PROJECT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "psychedelicarchive.com")
DEFAULT_CORPUS_DIR = Path("latin-american-psychedelic-research")
DEFAULT_MANIFEST = DEFAULT_CORPUS_DIR / "texts" / "manifest.jsonl"
DEFAULT_OUT = Path("data/latin-america-import")


def stable_uuid(prefix: str, value: str) -> str:
    return str(uuid.uuid5(PROJECT_NAMESPACE, f"{prefix}:{value}"))


def slugify(value: str, fallback: str = "untitled") -> str:
    value = value.strip().lower()
    value = unicodedata.normalize("NFD", value)
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
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


def excerpt(text: str, fallback: str) -> str:
    paragraphs = [re.sub(r"\s+", " ", item).strip() for item in re.split(r"\n{2,}", text)]
    for paragraph in paragraphs[1:]:
        if len(paragraph) >= 80:
            return paragraph[:317] + "..." if len(paragraph) > 320 else paragraph
    compact = re.sub(r"\s+", " ", fallback).strip()
    return compact[:317] + "..." if len(compact) > 320 else compact


def add_asset(
    *,
    corpus_dir: Path,
    assets: list[dict],
    files: list[dict],
    document_id: str,
    document_slug: str,
    record_id: str,
    source_path: str,
    local_name: str,
    storage_name: str,
    kind: str,
) -> str:
    source = corpus_dir / source_path
    data = source.read_bytes()
    width, height = image_dimensions(data)
    mime_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
    checksum = hashlib.sha256(data).hexdigest()
    file_id = stable_uuid("file", f"latin-america:{record_id}:{storage_name}")
    local_path = f"{'pdfs' if mime_type == 'application/pdf' else 'images'}/{document_slug}/{local_name}"
    storage_path = f"documents/{document_id}/{local_path}"

    files.append(
        {
            "id": file_id,
            "document_id": document_id,
            "page_id": None,
            "kind": kind,
            "storage_path": storage_path,
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
            "document_slug": document_slug,
            "source_url": str(source),
            "local_path": local_path,
            "storage_path": storage_path,
            "kind": kind,
            "mime_type": mime_type,
            "downloaded": True,
            "sha256": checksum,
            "byte_size": len(data),
            "width": width,
            "height": height,
        }
    )
    return storage_path


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
        raw_text = (corpus_dir / record["local_path"]).read_text(errors="replace")
        text = "\n".join(line.rstrip() for line in raw_text.splitlines()).strip()
        slug = slugify(record["title"])
        document_id = stable_uuid("document", f"latin-america:{record['id']}")
        page_id = stable_uuid("page", f"latin-america:{record['id']}:1")
        year = int(record["year"])
        era = era_for_year(year)

        cover_image_path = add_asset(
            corpus_dir=corpus_dir,
            assets=assets,
            files=files,
            document_id=document_id,
            document_slug=slug,
            record_id=record["id"],
            source_path=record["image_path"],
            local_name=f"01-{Path(record['image_path']).name}",
            storage_name=Path(record["image_path"]).name,
            kind="cover_image",
        )
        if record.get("pdf_path"):
            add_asset(
                corpus_dir=corpus_dir,
                assets=assets,
                files=files,
                document_id=document_id,
                document_slug=slug,
                record_id=record["id"],
                source_path=record["pdf_path"],
                local_name=Path(record["pdf_path"]).name,
                storage_name=Path(record["pdf_path"]).name,
                kind="source_pdf",
            )

        documents.append(
            {
                "id": document_id,
                "slug": slug,
                "title": record["title"],
                "short_title": record.get("short_title", ""),
                "subtitle": record.get("subtitle", ""),
                "display_date": record.get("display_date", str(year)),
                "date_start": year,
                "date_end": year,
                "document_type": record.get("document_type", "Academic Article"),
                "medium": record.get("medium", "Text"),
                "language": record.get("language", "English"),
                "region": record.get("region", ""),
                "publication_place": record.get("publication_place", ""),
                "publisher": record.get("publisher", ""),
                "summary": record["summary"],
                "abstract": record["summary"],
                "publication_title": record.get("publication_title", record.get("publisher", "")),
                "editorial_note": "Imported from Latin American psychedelic research corpus; OCR and metadata reviewed at staging level.",
                "citation": record["citation"],
                "rights_statement": record.get("rights", ""),
                "source_url": record.get("source_url", ""),
                "external_access_url": record.get("external_access_url", record.get("source_url", "")),
                "access_type": "hosted",
                "hosting_status": "full_text",
                "cover_image_path": cover_image_path,
                "thumbnail_path": cover_image_path,
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

        for index, url_key in enumerate(["source_url", "external_access_url"]):
            url = record.get(url_key)
            if not url:
                continue
            external_sources.append(
                {
                    "id": stable_uuid("external_source", f"latin-america:{record['id']}:{url}"),
                    "document_id": document_id,
                    "repository_name": record.get("repository_name", "External source") if index == 0 else record.get("external_repository_name", "External source"),
                    "institution_name": "",
                    "url": url,
                    "access_label": record.get("source_access_label", "Full text PDF") if index == 0 else record.get("external_access_label", "Bibliographic record"),
                    "stable_identifier": url,
                    "rights_note": record.get("rights", ""),
                    "is_primary": index == 0,
                    "last_checked_at": None,
                }
            )

        for name in record.get("people", [record["author"]]):
            person_slug = slugify(name)
            people_by_slug.setdefault(
                person_slug,
                {
                    "id": stable_uuid("person", person_slug),
                    "slug": person_slug,
                    "name": name,
                    "sort_name": name,
                    "birth_year": birth_year_for_person(name),
                    "death_year": death_year_for_person(name),
                    "bio": bio_for_person(name),
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
            ("era", era),
            ("region", record.get("region_tag", "Latin America")),
        ]
        tag_values.extend(("topic", tag) for tag in record.get("tags", []))
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
                "shortTitle": record.get("short_title", ""),
                "subtitle": record.get("subtitle", ""),
                "author": record["author"],
                "year": year,
                "displayDate": record.get("display_date", str(year)),
                "type": record.get("document_type", "Academic Article"),
                "medium": record.get("medium", "Text"),
                "era": era,
                "region": record.get("region", ""),
                "language": record.get("language", "English"),
                "tags": [name for _, name in tag_values if name],
                "people": record.get("people", [record["author"]]),
                "substances": record.get("substances", []),
                "summary": record["summary"],
                "excerpt": excerpt(text, record["summary"]),
                "citation": record["citation"],
                "publicationTitle": record.get("publication_title", record.get("publisher", "")),
                "rights": record.get("rights", ""),
                "sourceUrl": record.get("source_url", ""),
                "accessType": "hosted",
                "hostingStatus": "full_text",
                "wordCount": len(re.findall(r"\b\w+\b", text)),
                "addedDate": "",
                "featured": record.get("rank") in {1, 2, 3},
                "imageTone": record.get("image_tone", "document"),
                "imagePath": f"/imported/latin-america/{cover_image_path}",
                "imageAlt": record.get("image_alt", f"Cover image for {record['title']}"),
                "transcript": text,
            }
        )

    unique_document_tags = {tuple(sorted(row.items())) for row in document_tags}
    unique_document_people = {tuple(sorted(row.items())) for row in document_people}

    return {
        "documents": documents,
        "pages": pages,
        "files": files,
        "external_sources": external_sources,
        "people": sorted(people_by_slug.values(), key=lambda row: row["slug"]),
        "document_people": [dict(items) for items in unique_document_people],
        "tags": sorted(tags_by_slug.values(), key=lambda row: row["slug"]),
        "document_tags": [dict(items) for items in unique_document_tags],
        "assets": assets,
        "archive_sources": archive_sources,
    }


def birth_year_for_person(name: str) -> int | None:
    if name == "Alexander Shulgin":
        return 1925
    if name == "Claudio Naranjo":
        return 1932
    if name == "Garcia de Orta":
        return 1501
    if name == "Gerardo Reichel-Dolmatoff":
        return 1912
    if name == "William Antônio Rodrigues":
        return 1928
    return None


def death_year_for_person(name: str) -> int | None:
    if name == "Alexander Shulgin":
        return 2014
    if name == "Claudio Naranjo":
        return 2019
    if name == "Garcia de Orta":
        return 1568
    if name == "Gerardo Reichel-Dolmatoff":
        return 1994
    return None


def bio_for_person(name: str) -> str:
    if name == "Alexander Shulgin":
        return "American chemist and psychopharmacologist whose work ranged from industrial chemistry to psychoactive phenethylamines, tryptamines, and ethnobotanical pharmacology."
    if name == "Claudio Naranjo":
        return "Chilean psychiatrist, psychotherapist, and writer whose early work joined medical anthropology, psychedelic research, and experimental psychotherapy."
    if name == "Garcia de Orta":
        return "Portuguese physician and naturalist in Goa whose 1563 Colloquies recorded South Asian materia medica through direct observation and dialogue."
    if name == "Gerardo Reichel-Dolmatoff":
        return "Austrian-born Colombian anthropologist and archaeologist known for fieldwork among Indigenous peoples in Colombia, including influential writing on Tukano cosmology and yaje."
    if name == "J. G. Soares Maia":
        return "Brazilian natural-products chemist associated with INPA and Amazonian phytochemistry, including chemical study of Virola theiodora."
    if name == "William Antônio Rodrigues":
        return "Brazilian botanist associated with INPA, known for taxonomic work on Amazonian plants including Virola."
    return ""


def write_json(path: Path, rows: object) -> None:
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")


def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        path.write_text("")
        return
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()), lineterminator="\n")
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
    readme = f"""# Latin American Psychedelic Research Import Staging

Generated from `{manifest_path}`.

This folder stages Latin American and global psychoactive plant history sources
as Supabase rows using the same schema as the Squarespace and nitrous/ether
import folders.

## Counts

- Documents: {len(rows["documents"])}
- Pages: {len(rows["pages"])}
- Files/assets: {len(rows["files"])}
- External sources: {len(rows["external_sources"])}
- People: {len(rows["people"])}
- Tags: {len(rows["tags"])}
"""
    out_dir.joinpath("README.md").write_text(textwrap.dedent(readme).strip() + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus-dir", type=Path, default=DEFAULT_CORPUS_DIR)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    rows = build_rows(args.corpus_dir, args.manifest)
    if args.out.exists():
        shutil.rmtree(args.out)
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
