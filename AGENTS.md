# Repository Instructions

This is an app being created by you along with Benjamin Breen, the historian and writer (UC Santa Cruz). The project team also includes two historians at Harvard (Rebecca Lemov and Anne Harrington) and Paul Gillis-Smith, independent researcher. The goal is to encourage new scholarship and public engagement with the history of psychedelics broadly construed.  

## Next.js Dev Server Hygiene

This repo includes `archive-site`, a Next.js app. Treat `.next` as a live dev-server artifact.

- Do not remove `archive-site/.next` while `npm run dev`, `next dev`, or `npx next dev` is running for `archive-site`.
- If a stale chunk error appears, such as `Cannot find module './611.js'`, assume the running dev server and `.next` directory are out of sync.
- To clear Next.js cache safely:
  1. Identify only the `archive-site` dev processes with `pgrep -af "next dev|npm run dev"` and confirm their command paths point to `archive-site`.
  2. Stop those `archive-site` dev processes.
  3. Remove `archive-site/.next` once the processes are stopped.
  4. Restart `npm run dev` from `archive-site`.
  5. Verify the target route with `curl -I`, for example `curl -I http://localhost:<port>/archive`.
- Do not kill unrelated `next dev` servers from other projects.
- If a dev server is already running and responding, prefer using it instead of starting another one.

## Verification

After UI changes in `archive-site`, do not run `npm run build` by default. A production build writes to `archive-site/.next`, the same artifact directory used by `next dev`, and can disrupt a dev server the user is already running.

Prefer lighter verification unless the user explicitly asks for a full build:
Run `npm run build` only when explicitly requested, when release-level verification is needed, or when there is no active `archive-site` dev server and the user has not asked to avoid builds.

## Editorial Style

For footnotes, captions, translation notes, and other editorial apparatus:

- Write for scholarly usefulness first: identify, contextualize, clarify.
- Keep notes brisk. One sentence is usually enough; two is fine when the second adds real information.
- Link terms naturally inside the explanatory sentence. Avoid “see X” constructions.
- Include dates for people when useful and readily available.
- Use a lightly learned voice, but avoid ornamental flourishes, faux-archaic phrasing, or cleverness that does not carry information.
- State uncertainty directly and compactly, especially for contested etymologies, taxonomies, translations, and identifications.

## Audio/Video Transcript Workflow

For long audio/video sources, do not run Whisper over a single full-length media file unless the file is very short. Use a chunked, resumable workflow so interrupted sessions preserve partial work.

- Keep extracted working audio under `data/aapb/<source-slug>/` or a similarly named source-specific directory.
- Extract or normalize media to mono 16 kHz WAV with `ffmpeg` before transcription when practical.
- Split long audio into roughly five-minute chunks in `chunks/`, using deterministic names such as `<source-slug>-000.wav`, `<source-slug>-001.wav`, and so on.
- Run `scripts/transcribe_whisper_chunks.py <chunks-dir> <output-dir>` for local Whisper transcription. The script skips chunks whose `.json` and `.txt` outputs already exist and updates `manifest.json` after each chunk, making the job safe to resume.
- If the installed Whisper CLI fails on `numba`/NumPy import compatibility, use the repo-local shim by preserving `tools/fake_numba` on `PYTHONPATH`; the chunk script does this automatically.
- Keep machine transcripts clearly marked until reviewed against the media. Use AAPB, YouTube, Internet Archive, or other platform transcripts as rough alignment/reference material rather than authoritative text when they are machine-generated.
- After all chunks are transcribed, stitch chunk text in order, then do a separate cleanup pass for speaker labels, timestamps, uncertain words, and footnote annotations.

## Implemented Route Inventory

Current implemented app routes in `archive-site/src/app`:

- `/` via `src/app/page.tsx`
- `/about` via `src/app/about/page.tsx`
- `/archive` via `src/app/archive/page.tsx`
- `/archive/[slug]` via `src/app/archive/[slug]/page.tsx`
- `/biographies/[slug]` via `src/app/biographies/[slug]/page.tsx`
- `/collections` via `src/app/collections/page.tsx`
- `/collections/[slug]` via `src/app/collections/[slug]/page.tsx`
- `/eras` via `src/app/eras/page.tsx`
- `/eras/[slug]` via `src/app/eras/[slug]/page.tsx`
- `/people` via `src/app/people/page.tsx`
- `/project-team` via `src/app/project-team/page.tsx`
- `/search` via `src/app/search/page.tsx`
- `/topics` via `src/app/topics/page.tsx`
- `/topics/[slug]` via `src/app/topics/[slug]/page.tsx`
- `/further-reading` via `src/app/further-reading/page.tsx`
- `/further-reading/[slug]` via `src/app/further-reading/[slug]/page.tsx`
- `/submit-a-source` via `src/app/submit-a-source/page.tsx`
- `/faq` via `src/app/faq/page.tsx`
- `/admin` via `src/app/admin/page.tsx` - local/private CMS redirect.
- `/admin/workbench` via `src/app/admin/workbench/page.tsx` - local/private editorial operations dashboard.
- `/admin/sources` via `src/app/admin/sources/page.tsx` - local/private CMS source list.
- `/admin/sources/[id]` via `src/app/admin/sources/[id]/page.tsx` - local/private CMS source editor.
- `/admin/collections` via `src/app/admin/collections/page.tsx` - local/private CMS collection list.
- `/admin/collections/[id]` via `src/app/admin/collections/[id]/page.tsx` - local/private CMS collection editor.
- `/admin/topics` via `src/app/admin/topics/page.tsx` - local/private CMS topic list.
- `/admin/topics/[id]` via `src/app/admin/topics/[id]/page.tsx` - local/private CMS topic editor.
- `/admin/bibliography` via `src/app/admin/bibliography/page.tsx` - local/private CMS bibliography list.
- `/admin/bibliography/[id]` via `src/app/admin/bibliography/[id]/page.tsx` - local/private CMS bibliography editor.
- `/admin/qa` via `src/app/admin/qa/page.tsx` - local/private file-backed QA dashboard.

Routes handled as archive filters rather than standalone pages:

- `/archive?medium=Audio%2FVideo` - Audio/video nav item.
- `/archive?medium=Text` and Text dropdown era filters.
- `/archive?medium=Personal%20History` - Personal histories nav item.
- `/archive?people=...` - Bios dropdown person filters.
- `/archive?tag=...`, `/archive?era=...`, `/archive?type=...`, `/archive?medium=...` - chip, card, and filter links.

## Source Schema And Reader Hierarchy

The archive distinguishes ordinary source records from compound source records.

- `sourceKind: "single"` is the default for one archival item, article, book excerpt, memo, interview, audio recording, or video.
- `sourceKind: "collection"` is for a compound source such as a complete periodical run, multi-volume series, or other bounded set whose parts should be browsed before opening an individual reader.
- `sourceKind: "collection_item"` is for an individual issue, volume, or part inside a compound source. These items should remain searchable as normal archive records and should link back to their parent collection when that relationship is available.

For periodical runs such as *Psychedelic Information Bulletin*, do not concatenate all issues into one giant transcript. Create one `collections` row for the run, one `documents` row per issue, and link them with `collection_documents`. The collection page should render `Overview | Details`; the overview is a finding-aid style grid of issue/volume thumbnails. Clicking a grid item opens the issue-level archive reader.

Issue or volume ordering should use `sequence_number` for sorting and `sequence_label` for display labels such as `Vol. 2, No. 4`. Use `issue_date` when the item date is more precise or more reader-friendly than the document-level display date. Keep the collection overview to at most 100 visible items; beyond that, split the collection by year, volume, or series.

Reader tab rules:

- Collection source: `Overview | Details`.
- Non-English source with `translation_text`: `Translation | Original PDF/source | Details`.
- Text source with transcript/OCR: `Transcript | Original source | Details`.
- Academic articles and long books with PDFs should prefer an `Original PDF` tab over page-image/line-transcript UI.
- Manuscripts, letters, field notes, rare short excerpts, and other page-sensitive artifacts should use the page-image plus line transcript original-source viewer.
- Audio/video sources are text-first when a transcript or translation exists: show `Transcript` or `Translation` first, and put the audio/video player under `Original Audio` or `Original Video`.
- If audio/video has no text layer yet, the media player may be the primary reader mode.

Optional document fields added for this hierarchy include `source_kind`, `parent_collection_id`, `sequence_label`, `sequence_number`, `issue_date`, `content_language`, `translation_language`, `translation_text`, `translation_provider`, `translation_note`, `reader_mode`, and `media_embed_url`.

Curated reader text should use `document_sections` when a source needs structured Markdown sections such as an overview, transcript sections, translation sections, or Q&A. The public reader prefers curated sections over OCR-derived transcript text, and the admin source editor exposes section creation, duplication, ordering, deletion, and revision logging. Use `section_type` to distinguish overview/editorial notes from main transcript or translation content rather than embedding internal production notes in reader-facing prose.

## Bibliography And Citation Linking

Bibliography records live in `bibliography_items` with contributor, tag, era, and document join tables. Public bibliography routes are `/further-reading` and `/further-reading/[slug]`; bibliography titles in lists should link to the slug detail page.

Inline citation linking is intentionally conservative:

- Source-local citation links live in `document_citation_links` and point from a `documents` row to a `bibliography_items` row.
- Citation aliases live in `bibliography_item_aliases`; use normalized aliases for matching but keep the reader-facing citation text exactly as it appears in the source.
- Only auto-link high-confidence author-year citations where the cited work can be identified with reasonable certainty. Leave compound or ambiguous references unresolved for later review rather than guessing.
- Markdown rendering in `archive-site/src/components/markdown-content.tsx` links citation text from `source.citationLinks`; it should not rewrite existing Markdown links or code spans.
- The current pilot generator is `npm run qa:citations`, which runs `scripts/build_citation_links.py` and writes `data/qa/citation-link-report.*` plus citation-link staging JSON in `data/latin-america-import/`.
- `scripts/upload_squarespace_to_supabase.mjs` reads optional `bibliography_item_aliases.json` and `document_citation_links.json` files. If the remote Supabase schema does not yet have those newer tables, upload skips them rather than failing.
- Apply the latest `scripts/supabase_schema.sql` before expecting remote DB-backed citation links. Local/dev rendering can fall back to generated JSON files when those tables are missing.

## CMS Plan

The staged custom CMS plan lives in `cmsplan.md`. Use it as the reference before extending admin routes, Markdown rendering, editor-auth flows, revision history, or structured figure/media editing. The plan keeps Supabase as the source of truth and treats the CMS as a project-specific editing layer inside `archive-site`, not a migration to an external CMS.

Current CMS implementation is intentionally local/private. In development it is enabled unless `ADMIN_DISABLED=true`; outside development it requires `ADMIN_LOCAL_ENABLED=true`. Writes use server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for now, with the code organized so Supabase Auth/RLS collaborator flows can replace the local write path later. Never expose the service role key with a `NEXT_PUBLIC_` prefix.

The admin QA dashboard at `/admin/qa` reads generated files from `data/qa/`:

- `npm run qa:sources` runs `scripts/archive_qa.py` and produces `archive-quality-report.*` plus `archive-actionable-report.*`.
- `npm run qa:citations` runs `scripts/build_citation_links.py` and produces `citation-link-report.*`.
- The dashboard is file-backed; rerun the scripts to refresh it. It does not currently execute QA jobs itself.

## Import And Upload Scripts

Root-level import/upload scripts in `package.json` are the preferred entry points for data refreshes:

- `npm run upload:squarespace` uploads `data/squarespace-import`.
- `npm run upload:nitrous-ether` uploads `data/nitrous-ether-import`.
- `npm run upload:latin-america` uploads `data/latin-america-import`.
- `npm run topics:seed` runs `scripts/seed_topics_from_tags.mjs`.
- `npm run qa:sources` and `npm run qa:citations` refresh file-backed QA data.

The `archive-site/package.json` mirrors the upload scripts with `../data/...` paths for use from inside the Next.js app directory. The uploader expects staging JSON files such as `documents.json`, `files.json`, `document_sections.json`, `document_figures.json`, `bibliography_items.json`, and join-table JSON files when those data types are present. It uploads assets to Supabase Storage and upserts rows with deterministic IDs where the import script provides them.

## PIB Trial Import Workflow

The trial import for *Psychedelic Information Bulletin* PDFs uses:

- Source PDFs in `data/pib/`.
- Generated staging data in `data/pib-import/`.
- `scripts/import_pib_trial.mjs` to regenerate staging JSON from `data/pib/*.pdf`.
- `scripts/upload_squarespace_to_supabase.mjs --import-dir data/pib-import` to upload the PDFs and upsert `collections`, `documents`, `files`, and `collection_documents`.

Run the staging script after adding or renaming trial PDFs:

```bash
node scripts/import_pib_trial.mjs
```

The script creates one collection record with slug `psychedelic-information-bulletin`, one `collection_item` document per PDF, one `original_pdf` file row per issue, and one `collection_documents` link per issue. It uses deterministic UUIDs derived from slugs, so rerunning it updates the same records rather than creating duplicates.

To import to Supabase, the shell must have a service role key:

```bash
SUPABASE_URL="https://yqcvybdabpnxyapnrjlp.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_secret_key" \
SUPABASE_STORAGE_BUCKET="archive-assets" \
node scripts/upload_squarespace_to_supabase.mjs --import-dir data/pib-import
```

Never commit the service role key. After upload, verify:

- `/collections/psychedelic-information-bulletin`
- `/archive/pic-bulletin-32`
- `/archive/pic-bulletin-33`
- `/archive/pic-bulletin-34`
