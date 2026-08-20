#!/usr/bin/env python3
"""Quality checks for archive source imports.

This is a staging-oriented QA pass for import directories under data/*-import.
It deliberately reports likely problems instead of rewriting data. The report is
intended to drive manual cleanup and later admin review queues.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from transcript_cleanup_pipeline import audit_markdown


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = ROOT / "data" / "qa"

TEXT_FIELDS = [
    "title",
    "short_title",
    "subtitle",
    "summary",
    "abstract",
    "editorial_note",
    "citation",
    "rights_statement",
    "source_url",
    "external_access_url",
]

REQUIRED_FIELDS = [
    "id",
    "slug",
    "title",
    "display_date",
    "document_type",
    "medium",
    "language",
    "summary",
    "citation",
    "rights_statement",
    "access_type",
    "hosting_status",
]

PLACEHOLDER_RE = re.compile(
    r"\b(?:todo|tbd|tk|lorem ipsum|coming soon|stub|needs metadata review|needs rights review|rights status pending|metadata needs review)\b",
    re.I,
)
INTERNAL_NOTE_RE = re.compile(
    r"\b(?:base text|baste text|gold standard transcript|footnotes? (?:later|will be added)|working edition|internal note|do not publish)\b",
    re.I,
)
TRUNCATION_RE = re.compile(r"(?:\b(?:and|because|with|of|the|to|from|for|that)|[-,:;])\s*$", re.I)
BAD_URL_RE = re.compile(r"^https?://$")
SPEAKER_RE = re.compile(r"^(?:Leary|Lettvin|Question|Innisfree|Narrator|Interviewer|Interviewee):\s+", re.M)


@dataclass
class QaIssue:
    severity: str
    kind: str
    track: str
    import_dir: str
    slug: str
    title: str
    field: str
    excerpt: str
    suggestion: str = ""


def load_json(path: Path) -> list[dict[str, Any]]:
    if not path.exists() or path.stat().st_size == 0:
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def compact(text: str, length: int = 360) -> str:
    text = re.sub(r"\s+", " ", str(text)).strip()
    if len(text) <= length:
        return text
    return text[: length - 1].rstrip() + "..."


def is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def severity_rank(severity: str) -> int:
    return {"high": 0, "medium": 1, "low": 2}.get(severity, 9)


def track_for(kind: str, severity: str) -> str:
    if kind.startswith("text_"):
        return "editorial_cleanup"
    if kind in {
        "internal_editorial_note_public",
        "malformed_url",
        "missing_audio_video_access",
        "external_record_without_url",
        "date_range_reversed",
        "empty_section_body",
        "internal_or_generic_section_heading",
        "hosted_text_without_file_or_page",
        "pdf_reader_without_original_pdf",
        "hosted_source_missing_text_layer",
        "file_missing_storage_path",
        "duplicate_slug_in_import",
    }:
        return "blocking"
    if severity == "high":
        return "blocking"
    return "metadata_review"


def ocr_severity(kind: str, detected_severity: str, *, long_text: bool) -> str:
    if kind in {"ocr_garbage_token", "spaced_word"}:
        return "high"
    if kind in {"broken_hyphen", "stray_ocr_punctuation", "digit_letter_noise", "mixed_case_word"}:
        return "medium" if long_text else detected_severity
    return detected_severity


def issue(
    issues: list[QaIssue],
    severity: str,
    kind: str,
    import_dir: Path,
    doc: dict[str, Any],
    field: str,
    excerpt: Any,
    suggestion: str = "",
) -> None:
    issues.append(
        QaIssue(
            severity=severity,
            kind=kind,
            track=track_for(kind, severity),
            import_dir=str(import_dir.relative_to(ROOT)),
            slug=str(doc.get("slug") or doc.get("id") or "unknown"),
            title=str(doc.get("title") or ""),
            field=field,
            excerpt=compact(excerpt),
            suggestion=suggestion,
        )
    )


def index_by_document(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        document_id = row.get("document_id")
        if document_id:
            grouped[str(document_id)].append(row)
    return grouped


def detect_text_issues(
    issues: list[QaIssue],
    import_dir: Path,
    doc: dict[str, Any],
    field: str,
    text: str,
    *,
    long_text: bool = False,
) -> None:
    if not text.strip():
        return

    if PLACEHOLDER_RE.search(text):
        issue(issues, "medium", "placeholder_or_review_note", import_dir, doc, field, text)

    if INTERNAL_NOTE_RE.search(text):
        issue(issues, "high", "internal_editorial_note_public", import_dir, doc, field, text)

    if BAD_URL_RE.match(text.strip()):
        issue(issues, "high", "malformed_url", import_dir, doc, field, text)

    if field.endswith("url") or field.endswith("_url"):
        return

    if TRUNCATION_RE.search(text.strip()) and len(text.split()) > 3:
        issue(issues, "medium", "abrupt_truncation", import_dir, doc, field, text)

    if not long_text:
        return

    # Reuse the transcript OCR detector on a markdown-ish block. For short
    # metadata fields, placeholder/internal-note checks above are more useful
    # than generic OCR patterns, which produce false positives on citations.
    qa_text = sanitize_for_ocr_audit(text)
    for detected in audit_markdown(qa_text):
        if detected.kind == "very_short_fragment":
            continue
        severity = ocr_severity(detected.kind, detected.severity, long_text=long_text)
        issue(
            issues,
            severity,
            f"text_{detected.kind}",
            import_dir,
            doc,
            field,
            detected.excerpt,
            "Review OCR/transcription around this passage.",
        )


def sanitize_for_ocr_audit(text: str) -> str:
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\{\{[^}]+\}\}", "", text)
    text = re.sub(r"\[[^\]]+\]\([^)]+\)", "", text)
    text = re.sub(r"`[^`]+`", "", text)
    return text


def check_document_metadata(issues: list[QaIssue], import_dir: Path, doc: dict[str, Any]) -> None:
    for field in REQUIRED_FIELDS:
        if is_blank(doc.get(field)):
            issue(issues, "medium", "missing_required_metadata", import_dir, doc, field, "", f"Fill `{field}`.")

    if is_blank(doc.get("region")):
        issue(issues, "low", "missing_region", import_dir, doc, "region", "", "Add region when known.")

    if doc.get("status") != "published":
        issue(issues, "medium", "not_published", import_dir, doc, "status", doc.get("status", ""))

    if doc.get("medium") == "Audio/Video" and is_blank(doc.get("media_embed_url")) and is_blank(doc.get("source_url")):
        issue(issues, "high", "missing_audio_video_access", import_dir, doc, "media_embed_url", "")

    if doc.get("access_type") == "external" and not doc.get("external_access_url") and not doc.get("source_url"):
        issue(issues, "high", "external_record_without_url", import_dir, doc, "source_url", "")

    if doc.get("date_start") and doc.get("date_end") and doc["date_start"] > doc["date_end"]:
        issue(issues, "high", "date_range_reversed", import_dir, doc, "date_start/date_end", f"{doc['date_start']} > {doc['date_end']}")

    for field in TEXT_FIELDS:
        value = doc.get(field)
        if isinstance(value, str):
            detect_text_issues(issues, import_dir, doc, field, value)


def check_sections(
    issues: list[QaIssue],
    import_dir: Path,
    doc: dict[str, Any],
    sections: list[dict[str, Any]],
    pages: list[dict[str, Any]],
    files: list[dict[str, Any]],
) -> None:
    if not sections:
        classify_missing_sections(issues, import_dir, doc, pages, files)
        return

    positions = [row.get("position") for row in sections if row.get("position") is not None]
    if positions and sorted(positions) != list(range(min(positions), max(positions) + 1)):
        issue(issues, "medium", "section_position_gap", import_dir, doc, "document_sections.position", positions)

    headings = [str(row.get("heading") or "").strip() for row in sections]
    if len([h for h in headings if h]) != len(set(h for h in headings if h)):
        issue(issues, "low", "duplicate_section_heading", import_dir, doc, "document_sections.heading", headings)

    transcript_sections = [row for row in sections if row.get("section_type") in {"transcript", "translation"}]
    if len(transcript_sections) == 1:
        body_words = len(str(transcript_sections[0].get("body") or "").split())
        if body_words > 4000:
            issue(
                issues,
                "medium",
                "oversized_single_transcript_section",
                import_dir,
                doc,
                "document_sections",
                f"{body_words} words in one section",
                "Split into reader sections so the table of contents is useful.",
            )

    for row in sections:
        heading = str(row.get("heading") or "").strip()
        body = str(row.get("body") or "")
        field = f"document_sections[{heading or row.get('position', '?')}]"
        if not heading:
            issue(issues, "medium", "missing_section_heading", import_dir, doc, field, row)
        if row.get("body_format") == "markdown" and not body.strip():
            issue(issues, "high", "empty_section_body", import_dir, doc, field, "")
        # A generic heading matters when it leaks internal vocabulary into the reader. It does
        # not when it simply names its own typed section: the reader renders a source_note by
        # its type and never prints the heading, so heading "Source note" on section_type
        # "source_note" is consistent metadata, not a leak.
        section_type = str(row.get("section_type") or "").strip().lower()
        generic_heading = heading.lower() in {"gold standard transcript", "source note", "editorial note"}
        if generic_heading and heading.lower().replace(" ", "_") != section_type:
            issue(issues, "high", "internal_or_generic_section_heading", import_dir, doc, field, heading)
        detect_text_issues(issues, import_dir, doc, field, body, long_text=True)

        if row.get("section_type") == "transcript" and len(body.split()) > 800 and not SPEAKER_RE.search(body):
            # This is intentionally low severity: monologues and essays are valid.
            issue(issues, "low", "long_transcript_without_speaker_labels", import_dir, doc, field, heading)


def check_pages(
    issues: list[QaIssue],
    import_dir: Path,
    doc: dict[str, Any],
    pages: list[dict[str, Any]],
) -> None:
    for page in pages:
        label = page.get("label") or page.get("page_number") or "?"
        field = f"pages[{label}].ocr_text"
        ocr_text = str(page.get("ocr_text") or "")
        status = str(page.get("transcription_status") or "")
        if doc.get("medium") == "Text" and not ocr_text.strip() and status not in {"not_applicable", "unavailable"}:
            issue(issues, "medium", "text_page_without_ocr", import_dir, doc, field, "")
        if status in {"ocr_raw", "machine", "machine_transcript", "pending_review"}:
            issue(issues, "medium", "unreviewed_transcription_status", import_dir, doc, f"pages[{label}].transcription_status", status)
        if ocr_text.strip():
            detect_text_issues(issues, import_dir, doc, field, ocr_text, long_text=True)


def classify_missing_sections(
    issues: list[QaIssue],
    import_dir: Path,
    doc: dict[str, Any],
    pages: list[dict[str, Any]],
    files: list[dict[str, Any]],
) -> None:
    is_hosted = doc.get("access_type") == "hosted" or str(doc.get("hosting_status", "")).startswith("hosted")
    if not is_hosted:
        return

    file_kinds = {str(row.get("kind") or "") for row in files}
    ocr_words = sum(len(str(page.get("ocr_text") or "").split()) for page in pages)
    reader_mode = str(doc.get("reader_mode") or "")
    hosting_status = str(doc.get("hosting_status") or "")
    document_type = str(doc.get("document_type") or "")
    medium = str(doc.get("medium") or "")
    has_translation = bool(str(doc.get("translation_text") or doc.get("translation_text_path") or "").strip())

    if has_translation and "original_pdf" in file_kinds:
        return

    if reader_mode == "pdf" or hosting_status == "pdf":
        if "original_pdf" in file_kinds:
            issue(
                issues,
                "low",
                "pdf_source_sections_optional",
                import_dir,
                doc,
                "document_sections",
                "PDF reader source has no structured sections.",
                "Sections are optional for PDF-first sources; add only if an overview or finding aid is useful.",
            )
        else:
            issue(issues, "high", "pdf_reader_without_original_pdf", import_dir, doc, "files.kind", sorted(file_kinds))
        return

    if ocr_words == 0 and not files:
        issue(
            issues,
            "high",
            "hosted_source_missing_text_layer",
            import_dir,
            doc,
            "pages/files/document_sections",
            "",
            "Hosted source has no sections, OCR text, or files.",
        )
        return

    transcript_first = (
        medium == "Audio/Video"
        or document_type in {"Audio/Video", "Film", "Interview", "Oral History", "Testimony"}
        or reader_mode in {"audio", "video"}
    )
    if transcript_first and ocr_words > 100:
        issue(
            issues,
            "medium",
            "transcript_source_needs_sections",
            import_dir,
            doc,
            "document_sections",
            f"{ocr_words} OCR words available in pages.ocr_text.",
            "Generate transcript sections from pages.ocr_text so the reader has a useful table of contents.",
        )
        return

    long_text_publication = document_type in {
        "Academic Article",
        "Book",
        "Book Excerpt",
        "Essay",
        "Newspaper Article",
        "Source",
    }
    if long_text_publication and ocr_words > 0:
        if hosting_status == "transcript_only" and document_type in {"Book", "Academic Article"} and ocr_words > 4000:
            issue(
                issues,
                "medium",
                "reader_mode_mismatch",
                import_dir,
                doc,
                "reader_mode",
                f"{document_type} has {ocr_words} OCR words, no sections, and reader_mode={reader_mode or '(blank)'}.",
                "Confirm whether this should be PDF/page-reader first rather than a giant transcript-only text layer.",
            )
        else:
            issue(
                issues,
                "low",
                "hosted_source_has_search_text_only",
                import_dir,
                doc,
                "pages.ocr_text",
                f"{ocr_words} OCR words available; no document sections.",
                "This may be acceptable for article/book search text; add sections only if the public reader needs structured text.",
            )
        return

    if ocr_words > 0:
        issue(
            issues,
            "low",
            "hosted_source_has_search_text_only",
            import_dir,
            doc,
            "pages.ocr_text",
            f"{ocr_words} OCR words available; no document sections.",
        )


def check_files(
    issues: list[QaIssue],
    import_dir: Path,
    doc: dict[str, Any],
    files: list[dict[str, Any]],
    pages: list[dict[str, Any]],
) -> None:
    file_kinds = {str(row.get("kind") or "") for row in files}
    if doc.get("medium") == "Text" and doc.get("access_type") == "hosted" and not files and not pages:
        issue(issues, "high", "hosted_text_without_file_or_page", import_dir, doc, "files/pages", "")

    if doc.get("reader_mode") == "pdf" and "original_pdf" not in file_kinds:
        issue(issues, "high", "pdf_reader_without_original_pdf", import_dir, doc, "files.kind", sorted(file_kinds))

    for row in files:
        storage_path = str(row.get("storage_path") or "")
        if not storage_path:
            issue(issues, "high", "file_missing_storage_path", import_dir, doc, "files.storage_path", row)
        if row.get("byte_size") in {None, 0}:
            issue(issues, "low", "file_missing_byte_size", import_dir, doc, "files.byte_size", row)


def scan_import_dir(import_dir: Path) -> list[QaIssue]:
    issues: list[QaIssue] = []
    documents = load_json(import_dir / "documents.json")
    sections_by_doc = index_by_document(load_json(import_dir / "document_sections.json"))
    pages_by_doc = index_by_document(load_json(import_dir / "pages.json"))
    files_by_doc = index_by_document(load_json(import_dir / "files.json"))

    seen_slugs: set[str] = set()
    for doc in documents:
        slug = str(doc.get("slug") or "")
        if slug in seen_slugs:
            issue(issues, "high", "duplicate_slug_in_import", import_dir, doc, "slug", slug)
        seen_slugs.add(slug)

        doc_id = str(doc.get("id") or "")
        check_document_metadata(issues, import_dir, doc)
        doc_pages = pages_by_doc.get(doc_id, [])
        doc_files = files_by_doc.get(doc_id, [])
        check_sections(issues, import_dir, doc, sections_by_doc.get(doc_id, []), doc_pages, doc_files)
        check_pages(issues, import_dir, doc, doc_pages)
        check_files(issues, import_dir, doc, doc_files, doc_pages)

    return issues


def summarize(issues: list[QaIssue]) -> dict[str, Any]:
    by_severity = Counter(issue.severity for issue in issues)
    by_track = Counter(issue.track for issue in issues)
    by_kind = Counter(issue.kind for issue in issues)
    by_import = Counter(issue.import_dir for issue in issues)
    by_slug = Counter(issue.slug for issue in issues)
    return {
        "issues_total": len(issues),
        "issues_by_severity": {
            "high": by_severity.get("high", 0),
            "medium": by_severity.get("medium", 0),
            "low": by_severity.get("low", 0),
        },
        "issues_by_track": dict(by_track.most_common()),
        "issues_by_kind": dict(by_kind.most_common()),
        "issues_by_import_dir": dict(by_import.most_common()),
        "top_sources": dict(by_slug.most_common(25)),
    }


def write_reports(issues: list[QaIssue], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    ordered = sorted(issues, key=lambda item: (severity_rank(item.severity), item.import_dir, item.slug, item.kind, item.field))
    summary = summarize(ordered)

    (output_dir / "archive-quality-report.json").write_text(
        json.dumps({**summary, "issues": [asdict(issue) for issue in ordered]}, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# Archive Source QA Report",
        "",
        f"- Total issues: {summary['issues_total']}",
        f"- High: {summary['issues_by_severity']['high']}",
        f"- Medium: {summary['issues_by_severity']['medium']}",
        f"- Low: {summary['issues_by_severity']['low']}",
        "",
        "## Tracks",
    ]
    for track, count in summary["issues_by_track"].items():
        lines.append(f"- `{track}`: {count}")

    lines.extend([
        "",
        "## Top Issue Kinds",
    ])
    for kind, count in list(summary["issues_by_kind"].items())[:20]:
        lines.append(f"- `{kind}`: {count}")

    lines.extend(["", "## Top Sources"])
    for slug, count in list(summary["top_sources"].items())[:20]:
        lines.append(f"- `{slug}`: {count}")

    lines.extend(["", "## Issues"])
    current_severity = ""
    for qa_issue in ordered[:500]:
        if qa_issue.severity != current_severity:
            current_severity = qa_issue.severity
            lines.extend(["", f"### {current_severity.upper()}"])
        lines.extend(
            [
                "",
                f"#### `{qa_issue.slug}` / `{qa_issue.kind}`",
                "",
                f"- Import: `{qa_issue.import_dir}`",
                f"- Field: `{qa_issue.field}`",
                f"- Title: {qa_issue.title}",
                f"- Excerpt: {qa_issue.excerpt or '(blank)'}",
            ]
        )
        if qa_issue.suggestion:
            lines.append(f"- Suggestion: {qa_issue.suggestion}")

    if len(ordered) > 500:
        lines.extend(["", f"_Report truncated to first 500 issues; full data is in `archive-quality-report.json`._"])

    (output_dir / "archive-quality-report.md").write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    write_actionable_reports(ordered, output_dir)


def actionable_issues(
    issues: list[QaIssue],
    limit: int = 50,
    non_ocr_limit: int = 35,
    ocr_per_source: int = 5,
) -> list[QaIssue]:
    selected: list[QaIssue] = []
    selected_keys: set[tuple[str, str, str, str]] = set()

    def add(candidate: QaIssue) -> None:
        key = (candidate.slug, candidate.kind, candidate.field, candidate.excerpt)
        if key in selected_keys or len(selected) >= limit:
            return
        selected.append(candidate)
        selected_keys.add(key)

    high_issues = [issue for issue in issues if issue.severity == "high"]
    for candidate in sorted(high_issues, key=lambda item: (item.track, item.import_dir, item.slug, item.kind)):
        add(candidate)

    non_ocr = [issue for issue in issues if not issue.kind.startswith("text_") and issue.severity != "high"]
    for candidate in sorted(non_ocr, key=lambda item: (severity_rank(item.severity), item.track, item.import_dir, item.slug, item.kind)):
        if sum(1 for item in selected if not item.kind.startswith("text_")) >= non_ocr_limit:
            break
        add(candidate)

    ocr_counts: Counter[str] = Counter()
    ocr_candidates = [
        issue for issue in issues
        if issue.kind in {"text_ocr_garbage_token", "text_spaced_word", "text_stray_ocr_punctuation", "text_digit_letter_noise", "text_mixed_case_word", "text_broken_hyphen"}
        and issue.severity != "high"
    ]
    for candidate in sorted(ocr_candidates, key=lambda item: (severity_rank(item.severity), item.import_dir, item.slug, item.kind)):
        if ocr_counts[candidate.slug] >= ocr_per_source:
            continue
        add(candidate)
        ocr_counts[candidate.slug] += 1
        if len(selected) >= limit:
            break

    return selected


def write_actionable_reports(issues: list[QaIssue], output_dir: Path) -> None:
    selected = actionable_issues(issues)
    summary = summarize(selected)
    (output_dir / "archive-actionable-report.json").write_text(
        json.dumps({**summary, "issues": [asdict(issue) for issue in selected]}, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# Archive Actionable QA Report",
        "",
        "This report caps OCR findings and prioritizes issues that are likely to affect public pages or import readiness.",
        "",
        f"- Listed issues: {len(selected)}",
        f"- High: {summary['issues_by_severity']['high']}",
        f"- Medium: {summary['issues_by_severity']['medium']}",
        f"- Low: {summary['issues_by_severity']['low']}",
        "",
        "## Issues",
    ]
    current_track = ""
    for qa_issue in selected:
        if qa_issue.track != current_track:
            current_track = qa_issue.track
            lines.extend(["", f"### {current_track.replace('_', ' ').title()}"])
        lines.extend(
            [
                "",
                f"#### `{qa_issue.slug}` / `{qa_issue.kind}`",
                "",
                f"- Severity: `{qa_issue.severity}`",
                f"- Import: `{qa_issue.import_dir}`",
                f"- Field: `{qa_issue.field}`",
                f"- Title: {qa_issue.title}",
                f"- Excerpt: {qa_issue.excerpt or '(blank)'}",
            ]
        )
        if qa_issue.suggestion:
            lines.append(f"- Suggestion: {qa_issue.suggestion}")

    (output_dir / "archive-actionable-report.md").write_text("\n".join(lines).strip() + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run QA checks over archive import JSON.")
    parser.add_argument("import_dirs", nargs="*", type=Path, help="Import directories to scan. Defaults to data/*-import.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--strict", action="store_true", help="Exit nonzero if high-severity issues are found.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    import_dirs = args.import_dirs or sorted(path for path in (ROOT / "data").glob("*-import") if path.is_dir())
    all_issues: list[QaIssue] = []
    for import_dir in import_dirs:
        resolved = import_dir if import_dir.is_absolute() else ROOT / import_dir
        if not (resolved / "documents.json").exists():
            continue
        all_issues.extend(scan_import_dir(resolved))

    write_reports(all_issues, args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir)
    summary = summarize(all_issues)
    print(f"Scanned {len(import_dirs)} import dirs")
    print(
        "Issues: "
        f"{summary['issues_total']} total, "
        f"{summary['issues_by_severity']['high']} high, "
        f"{summary['issues_by_severity']['medium']} medium, "
        f"{summary['issues_by_severity']['low']} low"
    )
    print(f"Wrote reports to {(args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir).relative_to(ROOT)}")
    if args.strict and summary["issues_by_severity"]["high"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
