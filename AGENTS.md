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

## Stubbed / Missing Pages Inventory

Current implemented app routes in `archive-site/src/app`:

- `/` via `src/app/page.tsx`
- `/about` via `src/app/about/page.tsx`
- `/archive` via `src/app/archive/page.tsx`
- `/archive/[slug]` via `src/app/archive/[slug]/page.tsx`
- `/collections` via `src/app/collections/page.tsx`
- `/collections/[slug]` via `src/app/collections/[slug]/page.tsx`
- `/people` via `src/app/people/page.tsx`
- `/topics` via `src/app/topics/page.tsx`
- `/further-reading` via `src/app/further-reading/page.tsx`
- `/submit-a-source` via `src/app/submit-a-source/page.tsx`
- `/faq` via `src/app/faq/page.tsx`
- `/admin` via `src/app/admin/page.tsx` - local/private CMS redirect.
- `/admin/sources` via `src/app/admin/sources/page.tsx` - local/private CMS source list.
- `/admin/sources/[id]` via `src/app/admin/sources/[id]/page.tsx` - local/private CMS source editor.

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

## CMS Plan

The staged custom CMS plan lives in `cmsplan.md`. Use it as the reference before adding admin routes, Markdown rendering, editor-auth flows, revision history, or structured figure/media editing. The plan keeps Supabase as the source of truth and treats the CMS as a project-specific editing layer inside `archive-site`, not a migration to an external CMS.

Current CMS implementation is intentionally local/private. In development it is enabled unless `ADMIN_DISABLED=true`; outside development it requires `ADMIN_LOCAL_ENABLED=true`. Writes use server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for now, with the code organized so Supabase Auth/RLS collaborator flows can replace the local write path later. Never expose the service role key with a `NEXT_PUBLIC_` prefix.

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
