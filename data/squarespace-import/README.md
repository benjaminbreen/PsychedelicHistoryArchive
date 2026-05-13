# Squarespace Import Staging

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

- Documents: 16
- Pages: 16
- Files/assets: 27
- External sources: 16
- People: 11
- Tags: 62

## Review Notes

The importer is intentionally conservative. It preserves source URLs and body
text, but marks rights as needing review. It infers document type, medium,
region, era, and substances from existing Squarespace categories/tags where
possible. Before production upload, review citations, rights statements, author
roles, and image licensing.
