# Psychedelic History Archive: Design and Architecture Plan

## 1. Project Summary

The Psychedelic History Archive is a scholarly public archive for historical sources related to psychedelics, altered states, psychopharmacology, religion, medicine, literature, anthropology, and related fields.

The project is led by Benjamin Breen with Rebecca Lemov, Anne Harrington, and Paul Gillis-Smith. The expected archive scale is:

- 1,000 to 2,000 primary document records in the first major version.
- 1,000 to 10,000 compressed page images or scan images.
- Thousands of outbound links to relevant sources in external archives such as Google Books, Internet Archive, HOLLIS, Wellcome, and other institutional repositories.
- Page-level OCR search.
- Later semantic and hybrid search.
- A small editorial team of 3 to 4 mostly nontechnical users.

The site should feel like a serious scholarly catalogue with curated editorial entry points. It should not be built as a set of manually authored pages. The durable center of the project should be structured archival metadata.

## 2. Core Recommendation

Use **Next.js + Supabase** as the base system.

- **Next.js App Router** for the public site, item pages, archive browsing, SEO, routing, and admin UI.
- **TypeScript** for maintainable data contracts.
- **Tailwind CSS** for precise interface work.
- **Supabase Postgres** for archive metadata, OCR text, relationships, search indexes, and later embeddings.
- **Supabase Storage** for compressed delivery images, PDFs, thumbnails, and possibly selected original files.
- **Supabase Auth and Row Level Security** for private admin access.
- **Vercel** for deployment.

Do not add Directus at the beginning. Keep it in reserve if the custom admin becomes too slow to improve. Since the project already has a paid Supabase plan, a focused admin inside the Next.js app is likely simpler than introducing a second administrative system.

The main risk is not storage scale. The main risk is metadata inconsistency and an overly broad CMS. The admin interface should feel like a structured archival intake form, not a general-purpose website editor.

## 3. Design Direction

The reference mockups point in the right direction:

- `homepagemockup.png`: catalogue-first archive browsing with faceted filters.
- `sourcepagemockup.png`: transcript-first source page with strong provenance and scan/PDF actions.
- `nonhostedsourcemockup.jpg`: outbound-source page for records hosted elsewhere.
- `cmsmockup.png`: compact editorial dashboard with table-first source management.

The archive should default to a dense catalogue interface:

- Left-side filters on desktop.
- Drawer filters on mobile.
- URL-driven search and filters.
- List or compact view as the default.
- Grid view as an optional browsing mode.
- Results with thumbnail, title, date, type, short excerpt, tags, people, and save/bookmark affordance if added later.
- Featured source modules for editorial emphasis.
- Curated collection pages for interpretive storytelling.

Large cards should not be the default archive browsing mode. They work for featured sources and collection pages, but not for hundreds or thousands of records.

The public site should combine two modes:

- **Catalogue mode:** dense, filterable, searchable, source-centered.
- **Editorial mode:** curated collections, essays, timelines, teaching modules, and interpretive groupings.

### 3.1 Visual Identity

The site should feel like a scholarly archive with a strong editorial surface, not like a blog, museum splash page, or psychedelic-themed design object. Avoid saturated 1960s visual cliches. The identity should come from typography, spacing, source material, and browsing clarity.

The visual system should use:

- Black or near-black type.
- Warm white backgrounds.
- Pale lavender accent fields.
- Thin rules and borders.
- Compact metadata.
- Rectangular archival images.
- Minimal motion.
- Borders more than shadows.

The design target is a cross between a literary archive, a research catalogue, and a modern reading interface.

### 3.2 Typography

Use three type roles.

#### Display

Use a tall condensed face for the wordmark, large era labels, and occasional short source titles.

Recommended:

- **Oswald** as the preferred display face.
- **Bebas Neue** if the project wants a more poster-like wordmark.
- **Barlow Condensed** if Oswald feels too severe.

Oswald is a reasonable choice for the header font. It has enough compression to match the mockups while feeling less generic than the default startup stack.

Use the display face sparingly:

- Logo: 30-36px desktop, 24-28px mobile.
- Large era headings: 48-72px depending on context.
- Source-page H1 only when the title is short enough.

For long titles, fall back to the sans font or reduce the display font size aggressively so the title does not become brittle.

#### Interface Sans

Avoid Inter as the primary sans if the goal is to avoid the generic AI-coded look. Better options:

- **IBM Plex Sans**: scholarly, technical, highly readable, less generic than Inter.
- **Source Sans 3**: excellent legibility and a more editorial feel.
- **Public Sans**: restrained, civic/institutional, good for archive interfaces.
- **Atkinson Hyperlegible**: accessible and distinctive, but slightly more informal.
- **Söhne / Suisse / Neue Haas Grotesk** if a paid font budget exists.

Recommendation: use **IBM Plex Sans** or **Source Sans 3** for UI, metadata, filters, buttons, CMS tables, and navigation. IBM Plex Sans pairs especially well with Oswald because it has a research/institutional tone without looking like a default template.

#### Reading Serif

Use a real serif for transcripts and long-form reading:

- **Literata** for a bookish, readable transcript surface.
- **Source Serif 4** for a slightly more neutral scholarly tone.

Recommendation: use **Literata** for transcript text and collection essays.

Suggested font stack:

```ts
fontFamily: {
  display: ['Oswald', 'Bebas Neue', 'Arial Narrow', 'sans-serif'],
  sans: ['IBM Plex Sans', 'Source Sans 3', 'system-ui', 'sans-serif'],
  serif: ['Literata', 'Source Serif 4', 'Georgia', 'serif'],
}
```

### 3.3 Color System

Use a mostly neutral palette with lavender as the main accent. Pale olive can be used sparingly for category labels or era metadata.

```ts
colors: {
  archive: {
    ink: '#171417',
    muted: '#6E6872',
    faint: '#9B94A3',
    paper: '#FCFAF7',
    surface: '#FFFFFF',
    line: '#E7E1EA',
    lavender: '#EFE6FF',
    lavender2: '#F7F1FF',
    violet: '#7B4BD8',
    violetDark: '#5D31B5',
    olive: '#8B8F55',
    sand: '#F3EBDD',
    success: '#DDF4E4',
    warning: '#FFF0C2',
    draft: '#FFE3C7',
  }
}
```

Most UI should use `archive.paper`, `archive.surface`, `archive.line`, `archive.ink`, and `archive.muted`. Violet should be reserved for active states, links, selected tabs, and primary buttons.

### 3.4 Component Rules

- Use cards only for featured sources, collections, admin panels, side rails, and repeated editorial items.
- Do not nest cards inside cards.
- Use 1px borders and restrained radii.
- Use `rounded-md` for buttons and inputs.
- Use `rounded-full` only for chips.
- Avoid circular portraits. Rectangular image crops fit archival materials better.
- Use icons in action buttons where the meaning is conventional: download, external link, copy, share, search, filters.
- Use subtle hover states: lavender fill, border darkening, or image scale to 102%.
- Keep motion to 120-200ms and respect `prefers-reduced-motion`.

## 4. Public Site Information Architecture

Recommended top-level navigation:

- **Archive**
- **Collections**
- **People**
- **Topics**
- **Audio/Video**
- **Personal Histories**
- **About**
- **Further Reading**

These should not all be separate data silos. Most should be views over a shared archive database.

Recommended routes:

```txt
/
/archive
/archive?era=1800-1950&type=printed-book&tag=cannabis&sort=oldest&view=list
/documents/[slug]
/documents/[slug]/pages/[pageNumber]
/sources/[slug]
/collections
/collections/[slug]
/people
/people/[slug]
/topics
/topics/[slug]
/about
/further-reading
/contact
/admin
```

The archive should use URL-driven filters. Example:

```txt
/archive?query=william+james&type=academic-article&tag=nitrous-oxide&date_start=1880&date_end=1910&sort=oldest
```

This gives:

- Shareable URLs.
- Better SEO.
- Browser back-button behavior.
- Server-side querying.
- Easier debugging.
- A clearer boundary between public UI and data access.

### 4.1 Homepage Structure

The homepage should not duplicate the archive listing page. It should act as an editorial gateway into the archive while making search and browse behavior obvious.

Recommended structure:

```txt
Header
Hero
  Large heading or project statement
  Short description
  Large archive search input
  Compact browse controls

Featured source strip
  One large featured source
  Three compact source cards

Browse by era
  Horizontal timeline bands with counts

Browse by medium
  Compact tiles for Text, Images, Audio/Video, Personal Histories, Biographies, Further Reading

Featured collections
  3-6 editorial collection cards

Recent additions
  Dense list rows

Footer
```

The hero should not become a giant marketing panel. If there is no strong archival image treatment, keep the hero around 360-440px tall on desktop. The homepage should quickly reveal actual archive content.

The homepage search should route to:

```txt
/archive?q=...
```

Browse controls should route to filtered archive views:

```txt
/archive?era=1800-1950
/archive?medium=text
/archive?tag=cannabis
```

### 4.2 Hosted vs Externally Hosted Source Pages

The mockups imply two related source-page types.

#### Hosted Source

Use this when the archive hosts a transcript, PDF, page images, or all three. The source page should emphasize trust and verification:

- Breadcrumbs.
- Title and one-sentence abstract.
- Key metadata row.
- Primary actions near the title: `View original source`, `Download PDF`.
- Tabs: `Transcript`, `Original source`, `Details`.
- Transcript-first reading view when OCR/transcription exists.
- Right rail with citation, archive ID, language, rights, abstract, file actions, and related sources.

#### Externally Hosted Source

Use this when the archive is primarily a catalogue record and guide to a source hosted elsewhere.

The page should still feel like a first-class archive record, not a dead-end link. It should include:

- Title.
- Date.
- Type.
- People.
- Tags.
- Short quote or representative excerpt when rights allow.
- Source details.
- Holding institution or repository.
- Primary outbound action: `View at Google Books`, `View at Internet Archive`, `View at HOLLIS`, etc.
- Optional `Cite this source`.
- Related sources.

Externally hosted records should appear in archive search results alongside hosted records, but the result row should clearly indicate `External source` or `Hosted by [repository]`.

## 5. Content Model

The first version should be structured around a simple core model:

> A document has metadata. A document has pages. A document has files. A document can be connected to people, tags, substances, places, and collections.

### 5.1 Core Tables

#### `documents`

Represents the intellectual source object.

Suggested fields:

```sql
id uuid primary key
slug text unique not null
title text not null
subtitle text
display_date text
date_start int
date_end int
document_type text
medium text
language text
region text
publication_place text
publisher text
summary text
abstract text
editorial_note text
citation text
rights_statement text
source_url text
external_access_url text
access_type text default 'hosted'
hosting_status text default 'local'
cover_image_path text
thumbnail_path text
is_featured boolean default false
status text default 'draft'
published_at timestamptz
created_at timestamptz default now()
updated_at timestamptz default now()
```

`status` should probably be one of:

- `draft`
- `review`
- `published`
- `restricted`
- `archived`

Even if private drafts do not seem important now, this status field is useful for workflow and future privacy restrictions.

`access_type` should describe how the public source can be accessed:

- `hosted`: the archive hosts page images, transcript, PDF, or some combination of these.
- `external`: the archive has metadata and commentary, but the source itself is hosted elsewhere.
- `metadata_only`: the archive records the existence of the source but does not yet provide a transcript, scan, PDF, or stable external link.

`hosting_status` can describe the maturity of the hosted assets:

- `none`
- `metadata_only`
- `external_link`
- `transcript_only`
- `page_images`
- `pdf`
- `page_images_and_pdf`

#### `pages`

Represents individual page images and OCR text.

```sql
id uuid primary key
document_id uuid references documents(id) on delete cascade
page_number int not null
label text
readable_image_path text
thumbnail_image_path text
ocr_text text
ocr_confidence numeric
transcription_status text
created_at timestamptz default now()
updated_at timestamptz default now()
unique(document_id, page_number)
```

`transcription_status` can be:

- `none`
- `machine_ocr`
- `reviewed`
- `corrected`

#### `files`

Represents PDFs, original scans, derivatives, downloads, and other assets.

```sql
id uuid primary key
document_id uuid references documents(id) on delete cascade
page_id uuid references pages(id) on delete set null
kind text not null
storage_path text not null
mime_type text
byte_size bigint
width int
height int
checksum text
created_at timestamptz default now()
```

Possible `kind` values:

- `original_pdf`
- `download_pdf`
- `original_page_scan`
- `readable_page_image`
- `page_thumbnail`
- `document_thumbnail`
- `cover_image`
- `supplementary_file`

#### `external_sources`

Represents outbound links to sources hosted elsewhere. This should be a core table, not merely a text field, because the project expects thousands of external references.

```sql
id uuid primary key
document_id uuid references documents(id) on delete cascade
repository_name text
institution_name text
url text not null
access_label text
stable_identifier text
rights_note text
is_primary boolean default true
last_checked_at timestamptz
created_at timestamptz default now()
updated_at timestamptz default now()
```

Examples:

- Google Books record.
- Internet Archive item.
- HOLLIS record.
- Wellcome Collection record.
- JSTOR page.
- Publisher page.
- Institutional finding aid.

#### `people`

```sql
id uuid primary key
slug text unique not null
name text not null
sort_name text
birth_year int
death_year int
bio text
created_at timestamptz default now()
updated_at timestamptz default now()
```

#### `document_people`

```sql
document_id uuid references documents(id) on delete cascade
person_id uuid references people(id) on delete cascade
role text
primary key (document_id, person_id, role)
```

Roles might include:

- `author`
- `editor`
- `translator`
- `subject`
- `mentioned`
- `collector`

#### `tags`

```sql
id uuid primary key
slug text unique not null
name text not null
description text
tag_type text
created_at timestamptz default now()
```

`tag_type` can help keep vocabularies cleaner:

- `topic`
- `substance`
- `discipline`
- `genre`
- `place`
- `movement`
- `method`

#### `document_tags`

```sql
document_id uuid references documents(id) on delete cascade
tag_id uuid references tags(id) on delete cascade
primary key (document_id, tag_id)
```

#### `collections`

Curated groupings, not just tags.

```sql
id uuid primary key
slug text unique not null
title text not null
subtitle text
summary text
body text
cover_image_path text
status text default 'draft'
created_at timestamptz default now()
updated_at timestamptz default now()
```

#### `collection_documents`

```sql
collection_id uuid references collections(id) on delete cascade
document_id uuid references documents(id) on delete cascade
position int
editorial_caption text
primary key (collection_id, document_id)
```

### 5.2 Useful Later Tables

These do not all need to exist on day one, but the design should leave room for them:

- `institutions`: holding institutions, publishers, societies, universities.
- `citations`: structured CSL-style citation data.
- `ocr_jobs`: OCR processing status and logs.
- `embeddings`: semantic search vectors.
- `contact_submissions`: public source leads from the contact form.
- `controlled_vocabularies`: stricter management of eras, regions, types, and rights.

## 6. Storage Strategy

Supabase Storage is viable for delivery files at the expected scale.

If page images are compressed to roughly 300 to 500 KB:

- 1,000 images is about 0.3 to 0.5 GB.
- 10,000 images is about 3 to 5 GB.
- 20,000 images is about 6 to 10 GB.

That is manageable on a paid Supabase plan. The main cost risks are bandwidth and dynamic image transformations, not raw storage.

### 6.1 Delivery Files vs Preservation Files

Distinguish two categories:

#### Delivery Files

Files optimized for the public website:

- Compressed `.webp` page images.
- Small thumbnails.
- Cover images.
- Downloadable PDFs.
- OCR text stored in Postgres.

These can live in Supabase Storage.

#### Preservation Files

Best available originals:

- Original scans.
- Original PDFs.
- TIFFs or high-quality JPEGs when available.
- Metadata exports.
- Database backups.

These should not live only inside the application backend. Keep an offsite backup, such as institutional storage, external hard drive backup, cloud object storage, or another durable repository.

A historical archive should not have its only copy of source files inside the same system that powers the website.

### 6.2 Avoid Dynamic Transformations as Core Infrastructure

Do not depend on Supabase image transformations for routine page display. They are useful for prototyping, but recurring transformation costs can surprise you.

Instead, generate derivatives at upload or import time:

- One readable page image.
- One page thumbnail.
- One document thumbnail or cover.
- Optional downloadable PDF.

Store those derivatives directly.

### 6.3 Recommended Storage Paths

```txt
documents/{document_id}/original/source.pdf
documents/{document_id}/original/page-0001.jpg
documents/{document_id}/pages/readable/page-0001.webp
documents/{document_id}/pages/thumb/page-0001.webp
documents/{document_id}/thumb.webp
documents/{document_id}/download/source.pdf
```

If originals are too large or too numerous for Supabase, store only delivery files in Supabase and keep originals in separate preservation storage.

## 7. OCR and Search

Search should be developed in phases.

### Phase 1: Metadata and Full-Text Search

Start with Postgres full-text search over:

- Title.
- Summary.
- Abstract.
- Citation.
- People.
- Tags.
- Document type.
- OCR text.

This is more important than semantic search at the beginning. Most archive users will search for exact entities and metadata:

- William James
- nitrous oxide
- peyote
- cannabis
- Popular Science Monthly
- Havelock Ellis
- 1890s
- ethnography

### Phase 2: Page-Level OCR Search

Add page-level results that can take users directly to the matching page.

Search result examples:

- Document-level result: "1882: William James on Nitrous Oxide"
- Page-level result: "Match on page 3"
- Snippet with highlighted query terms.

### Phase 3: Semantic Search

Add embeddings later, once there is enough content and a clear user need.

Recommended embedding targets:

- Document summaries.
- OCR chunks of 500 to 1,000 tokens.
- Collection essays.
- Person biographies.

Store vectors in Postgres using pgvector.

### Phase 4: Hybrid Search

The long-term goal should be hybrid search:

- Exact keyword match.
- Faceted metadata filters.
- Semantic similarity.
- Date filtering.
- Source type filtering.
- Curated boosts for featured or canonical records.

Hybrid search is better than semantic search alone. Scholarly archive users need precision.

## 8. Admin and CMS Design

The first admin system should be custom, constrained, and source-centered.

Do not expose Supabase Studio to nontechnical editors except perhaps for emergency or advanced maintenance. Editors should not need to think about:

- Buckets.
- UUIDs.
- Storage paths.
- RLS policies.
- Database rows.
- Join tables.
- File naming conventions.

The `cmsmockup.png` direction is strong: a left navigation rail, dense source table, quick filters, status tabs, and a right-side details drawer. This is a better model than a page-builder CMS. The admin should feel like an editorial database with guardrails.

### 8.1 Admin Routes

```txt
/admin
/admin/documents
/admin/documents/new
/admin/documents/[id]
/admin/documents/[id]/pages
/admin/people
/admin/tags
/admin/collections
/admin/import
/admin/export
```

### 8.1.1 Admin Layout

Recommended admin shell:

- Dark left rail with primary sections: Dashboard, Sources, People, Tags, Collections, Media, Users, Settings.
- Main pane with table-first source management.
- Status tabs: All, Published, Drafts, Review, Restricted.
- Filter bar: search, type, era, tags, status, sort.
- Row actions: edit, preview, duplicate, archive.
- Right-side details drawer for quick edits and metadata inspection.
- Full editor page for deeper work.

The right-side drawer in the mockup is especially useful. It lets editors quickly correct title, slug, type, date, era, language, region, and tags without losing table context.

### 8.2 Source Intake Workflow

The ideal editor workflow:

1. Create a source record.
2. Fill in title, date, type, language, region, rights, citation, and abstract.
3. Upload a PDF or page images.
4. System generates readable images and thumbnails.
5. OCR is added or pasted.
6. Editor attaches people, tags, and collections.
7. Editor sets status to `draft`, `review`, or `published`.

For externally hosted records, the workflow should be:

1. Create a source record.
2. Set `access_type = external`.
3. Add the holding institution and outbound URL.
4. Fill citation and metadata.
5. Add a short quote or description if rights allow.
6. Attach people, tags, and collections.
7. Publish once the link and citation are verified.

The editor should see clear form sections:

- Identity.
- Dates.
- Source type.
- People.
- Tags and substances.
- Rights and citation.
- Files and scans.
- OCR or transcript.
- Editorial notes.
- Publication status.

### 8.3 Controlled Vocabularies

Controlled vocabularies should be managed in the admin UI.

Suggested controlled lists:

- Document types.
- Eras.
- Regions.
- Languages.
- Rights statements.
- Person roles.
- Source statuses.
- Transcription statuses.
- Substance tags.

Do not allow free-text tags everywhere. Free-text tagging will create duplicates and inconsistencies quickly.

### 8.4 Bulk Import and Export

The admin should support CSV import/export early.

This is important because the team may work in spreadsheets during research. The site should allow:

- Export all documents.
- Export people.
- Export tags.
- Import document metadata from CSV.
- Import external source links.
- Validate missing slugs, duplicate titles, malformed dates, and unknown tags.

## 9. Public Document Viewer

The public reader should use page images, not PDFs, as the primary interface.

Document page should include:

- Title.
- Date.
- Source type.
- Citation.
- Rights statement.
- Summary.
- People.
- Tags.
- Collections.
- External source links.
- Page image viewer.
- OCR/transcript panel.
- Download PDF link when available.
- Related sources.

The `sourcepagemockup.png` layout should be treated as the source-page reference:

- Breadcrumbs across the top.
- Large condensed title on the left.
- Primary actions aligned near the title.
- Metadata row under the abstract.
- Lavender active tab indicator.
- Compact transcript notice box.
- Serif transcript text.
- Right rail for source summary, citation, rights, and actions.

For version 1, a simple page image viewer is enough:

- Previous and next page.
- Page thumbnails.
- Page number input or dropdown.
- OCR text panel.
- Search within document.

Do not build IIIF or deep zoom first. If later needed, add a IIIF-like or OpenSeadragon-based layer for high-resolution manuscript viewing.

### 9.1 Transcript Mode

Transcript mode should be the default for hosted sources with OCR or prepared transcription.

Requirements:

- Transcript text should use the serif font.
- Max line length should be roughly 72 characters.
- Desktop transcript size should be around 20-22px with generous line height.
- Mobile transcript size should be around 18px.
- Page anchors should mark source pagination: `Page 1`, `Page 2`, etc.
- Each page marker should link to the corresponding scan when a scan exists.
- Browser find and copy/paste should work.
- Print styles should produce a readable transcript without navigation chrome.

The transcript notice should be compact:

```txt
You are in transcript reading mode. This is a text-only version of the source for easier reading and search. View original source.
```

### 9.2 Original Source Mode

Original source mode should show page images or a scan viewer.

Desktop:

- Page image viewer can occupy the main column.
- Transcript or OCR panel can appear beside or below the scan.
- Page thumbnails can appear as a horizontal rail or compact side strip.

Mobile:

- Do not attempt scan/transcript side-by-side.
- Use a segmented control: `Transcript | Scan | Details`.
- Scan mode should support pinch zoom or an enlarged image view.

### 9.3 Externally Hosted Source Page

The `nonhostedsourcemockup.jpg` direction is useful but should be tightened so users clearly understand the archive does not host the full source.

Primary action labels should name the destination:

- `View at Google Books`
- `View at Internet Archive`
- `View at HOLLIS`
- `View at Wellcome Collection`
- `View source site`

Use a right-rail card for access:

```txt
Access
Hosted externally by [Institution]
[View at external archive]
[Copy citation]
```

The excerpt or quote area should be clearly labeled:

- `Selected excerpt`
- `Editorial note`
- `Source description`

Avoid making the external-source page look like a failed hosted source page. It should be a catalogue record with a strong outbound action.

## 10. Rights and Citations

Rights metadata should be first-class from the beginning.

Each document should have:

- Rights statement.
- Source institution or repository.
- Source URL.
- Preferred citation.
- Public domain or copyright status if known.
- Notes on reproduction.

Citation export should be supported later in:

- Chicago-style formatted citation.
- RIS.
- BibTeX.
- CSL JSON if needed.

The first version can store a formatted citation string plus structured fields where practical.

## 11. Security and Access Control

The public site is read-only.

Public users should be able to:

- Browse published documents.
- Search published OCR and metadata.
- Read public pages.
- Use a contact form to submit leads.

Public users should not be able to:

- Upload files.
- Create records.
- Edit metadata.
- Access drafts.
- Access restricted sources.

Admin users should authenticate through Supabase Auth.

Use Row Level Security from the start:

- Public users can read only `status = 'published'`.
- Authenticated editors can create and update drafts.
- Admins can publish, delete, and manage vocabularies.
- Service-role keys stay server-only.

## 12. Contact and Source Leads

The contact page should not allow anonymous uploads in version 1.

Recommended contact form fields:

- Name.
- Email.
- Message.
- Suggested source title.
- Source URL.
- Institution or archive, if known.

Submissions can be stored in Postgres or sent by email. If stored, they should be private to admins.

## 13. Implementation Phases

### Phase 0: Foundation

- Set up Next.js, TypeScript, Tailwind, Supabase client utilities.
- Define database migrations.
- Set up Supabase Storage buckets.
- Configure Auth and RLS.
- Establish seed data format.
- Create basic design system components.
- Add typography: Oswald, IBM Plex Sans or Source Sans 3, and Literata.
- Encode the visual system: colors, buttons, chips, cards, metadata fields, tabs, side rails, and table rows.

### Phase 1: Public Catalogue MVP

- Archive list view.
- URL-driven filters.
- Search box.
- Sorting.
- Pagination.
- Document detail pages.
- Hosted and externally hosted source page variants.
- People and tag pages.
- Basic collection pages.
- Seed 25 to 50 representative records.

### Phase 2: Media and OCR

- Upload page images.
- Store readable images and thumbnails.
- Store PDFs.
- Add page records.
- Add OCR text fields.
- Add document viewer.
- Add page-level search.

### Phase 3: Admin MVP

- Admin login.
- Document list.
- Document editor.
- People editor.
- Tag editor.
- Collection editor.
- Media upload panel.
- Draft/review/published workflow.
- CSV export.

### Phase 4: Bulk Import and Processing

- CSV import.
- Batch image import.
- Batch OCR import.
- Slug generation.
- Duplicate detection.
- Metadata validation.
- Derivative image generation.

### Phase 5: Advanced Search

- Full-text ranking improvements.
- OCR snippets.
- Search within document.
- pgvector embeddings.
- Semantic search.
- Hybrid search.

### Phase 6: Editorial Expansion

- Curated thematic collections.
- Essays.
- Teaching modules.
- Timelines.
- Related-source recommendations.
- Citation export.

## 14. Initial Technical Decisions

### Use Supabase Storage for Delivery Files

The existing paid Supabase plan should be sufficient for compressed public image delivery in the near term.

### Generate Image Derivatives at Upload Time

Create readable and thumbnail versions immediately instead of relying on dynamic transformations.

### Build a Custom Admin First

The admin should be small and specific to archival intake. Do not start with Directus unless custom admin development becomes a bottleneck.

### Keep Search Exact Before Semantic

Build reliable metadata and OCR search first. Add semantic search once there is enough content and a clear reason.

### Keep the Database Normalized

Do not store tags, people, or collections as comma-separated fields. Use join tables.

### Preserve Originals Separately

Supabase can deliver the website assets, but preservation copies and exports should have an offsite backup.

## 15. Open Questions

Before implementation, answer these:

1. Should original files be stored in Supabase, institutional storage, or both?
2. What is the preferred OCR pipeline: local Tesseract, cloud OCR, manual paste, or a mixture?
3. What source types should be in the initial controlled vocabulary?
4. What rights statements should the archive support?
5. Should every page image be public when a document is published, or can documents have mixed public/restricted pages?
6. What is the minimum citation structure needed for launch?
7. Will the team work from spreadsheets during early source gathering?
8. Should collection pages include long-form essays at launch, or only curated lists?
9. What are the first 25 to 50 representative sources for seeding and testing the interface?

## 16. Recommended Next Step

Build a small vertical slice before designing the entire archive system.

The first prototype should include:

- 25 to 50 real source records.
- 3 to 5 documents with page images.
- OCR text for those pages.
- A functional archive list.
- A functional document viewer.
- A minimal admin editor.
- CSV import/export.

This will expose the real metadata problems early, while the system is still easy to change.
