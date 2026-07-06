# Custom CMS Plan

This archive should keep Supabase as the source of truth and add a custom CMS as an editing layer inside `archive-site`. Do not migrate to a separate headless CMS. The archive already has a domain-specific schema for documents, collections, pages, files, figures, people, tags, and relationships; a generic CMS would either duplicate that model or force the archive into weaker abstractions.

The CMS should be deliberately small, schema-aware, and boring: protected admin routes, form-based metadata editing, Markdown transcript editing, structured media management, preview, and revision history.

## Current Codebase Review

- Public archive pages are Supabase-backed through `archive-site/src/lib/supabase-archive.ts`.
- Public source pages are dynamic (`force-dynamic`) and query only `status = 'published'`, so database edits can appear without a redeploy once the public reader supports the edited fields.
- The schema already includes useful editing primitives: `documents`, `document_sections`, `document_figures`, `files`, `people`, `tags`, `collections`, and join tables.
- `document_sections` exists and import scripts populate it, but the current public reader derives transcript sections from page OCR text instead of selecting and rendering `document_sections` directly. Fix this before building the transcript editor, otherwise CMS edits will not appear in the reader.
- `document_figures` exists, but the current reader mostly extracts old Squarespace caption shortcodes from transcript text. The CMS should move figure placement into structured rows and renderer tokens.
- Current Supabase client setup is read-only/public oriented. Admin writes need a separate authenticated Supabase setup with cookie-backed sessions and RLS policies. Never expose service-role credentials to the browser.
- There is no Markdown rendering dependency yet. Add Markdown rendering deliberately with sanitization and a strict component allowlist.

## Content Model Principles

1. Supabase remains the only content database.
2. Edited prose and transcripts use Markdown, not WYSIWYG HTML.
3. Metadata and relationships remain structured fields and join tables.
4. Media assets remain structured records in `files` / `document_figures`, even when referenced from Markdown.
5. OCR/page-line data remains the preservation/search layer; `document_sections.body` becomes the curated public reading layer.
6. Public pages should keep showing only published records unless an authenticated editor is using preview mode.

## Markdown Strategy

Markdown is the right editorial layer because the source corpus is too heterogeneous for automatic semantic rules. Editors should explicitly mark formatting:

```md
`(starting at 17:00)`

**Narrator:** Modern psychiatry makes no sharp division between the mind and the body.

> Quoted passage or document excerpt.
```

Allowed Markdown should be intentionally narrow:

- Paragraphs, headings, emphasis, strong, inline code, code blocks, blockquotes, ordered/unordered lists, links.
- Tables only if there is a real source need; do not enable by default.
- Raw HTML disabled.
- Links restricted to safe protocols (`https`, `http`, `mailto`) and rendered with external-link affordances when off-site.
- Images should generally not be free-form Markdown URLs. Prefer structured figure references.

For figures, prefer an archive-specific token inserted by the CMS:

```md
{{figure:7da50bb7-figure-01}}
```

The renderer resolves the token against `document_figures` and displays the archive figure component with image, alt text, caption, and storage URL. This avoids fragile inline URLs, keeps captions queryable, and lets an editor update the caption without editing every transcript body. Standard Markdown images can be supported later for rare external-image cases, but should not be the primary workflow.

## Schema Additions

Add these tables/columns before or during CMS Phase 1:

```sql
create table if not exists editor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table document_sections
  add column if not exists body_format text default 'plain';

alter table documents
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists editorial_status text default 'draft';

alter table document_figures
  add column if not exists section_id uuid references document_sections(id) on delete set null,
  add column if not exists token text,
  add column if not exists credit text;

create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  document_id uuid references documents(id) on delete cascade,
  changed_by uuid references auth.users(id),
  change_note text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz default now()
);
```

Notes:

- `document_sections.body` can hold Markdown. `body_format` allows old imports to remain `plain` until reviewed.
- `editorial_status` is for workflow and can differ from public `status`. Public visibility should continue using `status`.
- `content_revisions` should capture meaningful editor saves, not every keystroke.
- Add indexes for `content_revisions(document_id, created_at desc)`, `document_figures(document_id, position)`, and `document_sections(document_id, position)` if not already present.

Current incremental CMS migrations:

- `scripts/supabase_biography_profiles_schema.sql` creates the DB-backed biography table used by `/admin/biographies`.
- `scripts/supabase_schema.sql` remains the canonical all-in-one schema and includes the same biography table definition.

## Auth And Security

Use Supabase Auth for collaborators. Add an admin-only Supabase client path separate from the existing public client:

- Browser client for logged-in admin UI.
- Server client for route handlers/server actions using cookies.
- Middleware or server checks to redirect unauthenticated users away from `/admin`.
- RLS policies that allow writes only for users in `editor_profiles` with `role in ('owner', 'editor')`.

Do not use a service-role key in client components. Service-role writes are acceptable only in local scripts and server-only maintenance jobs.

Recommended roles:

- `owner`: manage editors, publish/unpublish, edit all content.
- `editor`: create/edit drafts and published content.
- `viewer`: read admin previews and revision history, no writes.

Initial RLS shape:

- Public/anon keeps read access to published public tables.
- Authenticated editors can select all admin-visible rows.
- Editors can insert/update content rows.
- Only owners can delete rows and manage `editor_profiles`.
- Prefer soft-delete/status changes over destructive deletes.

## Public Reader Prerequisite

Before building CMS screens, update the public reader pipeline:

1. Select `document_sections` and `document_figures` in `DOCUMENT_SELECT`.
2. Map `document_sections` into `ArchiveSource.transcriptSections`.
3. Preserve fallback behavior: if no curated sections exist, derive sections from page OCR as today.
4. Render section bodies as Markdown when `body_format = 'markdown'`; render legacy plain text as plain paragraphs.
5. Resolve `{{figure:id-or-token}}` references into figure components.
6. Keep page-image/line-transcript UI available for page-sensitive artifacts.

This is the key dependency. Without it, the CMS would save edits into rows the reader ignores.

## Implementation Stages

### Stage 0: Foundations

Goal: Make the existing public reader ready for curated content.

- Add Markdown rendering package and sanitizer/allowlist.
- Add a Markdown rendering component used by transcripts, translations, and collection bodies where appropriate.
- Update Supabase selects/types to include `document_sections` and `document_figures`.
- Map curated sections before OCR-derived sections.
- Add figure token parsing and rendering.
- Add tests or fixtures for Markdown rendering, figure token rendering, and legacy plain-text fallback.

Verification:

- `npx tsc --noEmit` from `archive-site`.
- Manual check of a source with old OCR-only transcript.
- Manual check of a source with curated Markdown body and a figure token.

### Stage 1: Admin Shell And Source List

Goal: Give collaborators a safe place to find and inspect records.

Routes:

- `/admin`
- `/admin/sources`
- `/admin/sources/[id]`

Features:

- Supabase Auth login/logout.
- Protected admin layout.
- Searchable, filterable source table.
- Status, type, medium, year, updated time, and warnings columns.
- Links to public page and admin edit page.

UI guidance:

- Use a quiet operational layout, not a marketing page.
- Dense table/list first; avoid decorative cards for primary workflows.
- Keep admin navigation separate from public site navigation.
- Use tabs for source editor sections: Metadata, Reader, Transcript, Media, Relationships, Revisions.

### Stage 2: Metadata And Reader Settings Editor

Goal: Replace SQL-tab edits for common source changes.

Editable fields:

- `title`, `short_title`, `subtitle`, `display_date`, `date_start`, `date_end`.
- `document_type`, `medium`, `language`, `region`, `publisher`, `publication_title`.
- `summary`, `abstract`, `citation`, `rights_statement`.
- `source_url`, `external_access_url`, `access_type`, `hosting_status`.
- `source_kind`, `parent_collection_id`, `reader_mode`, `media_embed_url`.
- `status`, `published_at`, `editorial_status`.

Best practices:

- Use controlled select menus for enum-like fields.
- Validate URLs before saving.
- Show a YouTube/Vimeo embed preview for `media_embed_url`.
- Warn before changing `slug`.
- Save through server actions or route handlers that record `content_revisions`.

### Stage 3: Markdown Transcript Editor

Goal: Make transcript and overview edits practical.

Features:

- Edit `document_sections` rows by section.
- Add/reorder/delete sections.
- Markdown textarea with side-by-side preview.
- Section type selector: `overview`, `transcript`, `translation`, `note`.
- Body format toggle, defaulting new edited sections to `markdown`.
- Save button with change note.
- Preview public reader output before publish.

Editing guidance:

- Editors should use Markdown intentionally for formatting.
- Do not rely on automatic speaker/timestamp detection.
- Keep source-faithful transcript text separate from interpretive overview notes.
- Use headings sparingly inside sections; prefer section records for major structure.

### Stage 4: Media And Figure Workflow

Goal: Add images/captions without manual Storage or SQL work.

Features:

- Upload image/PDF/audio/video files to Supabase Storage.
- Create/update `files` rows.
- Create/update `document_figures` rows with alt text, caption, credit, placement, token.
- Insert `{{figure:token}}` into the active Markdown editor.
- Show figure library for the current source.
- Support cover/thumbnail selection.

Best practices:

- Require alt text for public figures.
- Store credits/rights notes where known.
- Keep original file names visible in admin but use stable storage paths.
- Do not overwrite existing files unless the editor explicitly replaces an asset.

### Stage 5: Relationships And Collections

Goal: Let editors maintain discoverability.

Features:

- Add/remove people relationships with roles.
- Add/remove tags and substances.
- Create/edit people and tag rows.
- Attach source records to collections.
- Edit `sequence_number`, `sequence_label`, and `issue_date` for collection items.

Best practices:

- Use autocomplete for people and tags to avoid duplicates.
- Show duplicate warnings for similar names/slugs.
- Preserve collection ordering rules from `AGENTS.md`.

### Stage 6: Workflow, Revision History, And Preview

Goal: Support multiple collaborators safely.

Features:

- Revision list per source.
- Diff view for Markdown and metadata changes.
- Draft/public preview mode.
- Publish/unpublish controls.
- Updated-by and updated-at display.
- Optional review states: `draft`, `needs_review`, `approved`, `published`.

Best practices:

- Public pages continue to filter by `status = 'published'`.
- Preview routes require authentication and should not be indexed.
- Avoid hard deletes; prefer `archived`/`draft` status unless cleaning test data.

### Stage 7: New Source Wizard

Goal: Make new source creation less script-dependent.

Start with simple records:

- External URL source.
- YouTube/Vimeo audio/video source.
- Text transcript source.
- PDF upload source.

Later add import helpers:

- PDF page-image ingestion.
- OCR job launcher.
- Archive.org/YouTube metadata fetch.
- Bulk CSV/JSON import review queue.

## Technical Best Practices

- Keep admin writes server-side or RLS-protected; never leak service-role keys.
- Keep public reader components deterministic and tolerant of missing edited fields.
- Store Markdown, not rendered HTML.
- Sanitize all rendered Markdown.
- Record revision snapshots for meaningful saves.
- Keep IDs stable and avoid changing slugs after publication.
- Use database constraints and controlled UI inputs for archive-specific enums.
- Build small vertical slices and verify in the public reader after each stage.
- Prefer `npx tsc --noEmit`, targeted tests, and dev-server visual checks over production builds unless a release build is explicitly needed.

## Design Guidance

The CMS is an internal editorial tool. It should feel compact, calm, and purpose-built:

- Source list is a table, not a gallery.
- Editor pages use a persistent left/right or tabbed layout.
- Preview should be visually close to the public source reader.
- Metadata fields should be grouped by editorial meaning: Identity, Dating, Access, Reader, Rights, Discovery.
- Use badges for status and validation warnings.
- Use icon buttons for repeated utilities such as preview, copy link, upload, reorder, and delete.
- Avoid nested cards and large decorative sections.
- Keep buttons and form labels short and predictable.

## First Build Slice

The best first implementation slice is:

1. Reader support for `document_sections` as Markdown with legacy fallback.
2. Reader support for structured figure tokens.
3. Supabase Auth admin shell.
4. `/admin/sources` list.
5. `/admin/sources/[id]` metadata + reader settings editor.
6. Markdown transcript editor with preview.

This slice solves the immediate editorial pain: changing transcript formatting, adding intentional labels, updating media embed URLs, and preparing image/caption placement without SQL or re-importing source files.
