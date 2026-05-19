create extension if not exists pgcrypto;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_title text,
  subtitle text,
  display_date text,
  date_start int,
  date_end int,
  document_type text,
  medium text,
  language text,
  region text,
  publication_place text,
  publisher text,
  summary text,
  abstract text,
  publication_title text,
  editorial_note text,
  citation text,
  rights_statement text,
  source_url text,
  external_access_url text,
  access_type text default 'hosted',
  hosting_status text default 'local',
  cover_image_path text,
  thumbnail_path text,
  is_featured boolean default false,
  status text default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table documents add column if not exists short_title text;
alter table documents add column if not exists subtitle text;
alter table documents add column if not exists publication_title text;
alter table documents add column if not exists source_kind text default 'single';
alter table documents add column if not exists sequence_label text;
alter table documents add column if not exists sequence_number int;
alter table documents add column if not exists issue_date text;
alter table documents add column if not exists content_language text;
alter table documents add column if not exists translation_language text;
alter table documents add column if not exists translation_text text;
alter table documents add column if not exists translation_provider text;
alter table documents add column if not exists translation_note text;
alter table documents add column if not exists reader_mode text;
alter table documents add column if not exists media_embed_url text;

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  page_number int not null,
  label text,
  readable_image_path text,
  thumbnail_image_path text,
  image_width int,
  image_height int,
  language text,
  ocr_text text,
  ocr_confidence numeric,
  transcription_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(document_id, page_number)
);

alter table pages add column if not exists image_width int;
alter table pages add column if not exists image_height int;
alter table pages add column if not exists language text;

create table if not exists page_lines (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references pages(id) on delete cascade,
  line_index int not null,
  text text not null,
  normalized_text text,
  bbox jsonb,
  confidence numeric,
  language text,
  paragraph_index int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(page_id, line_index)
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  page_id uuid references pages(id) on delete set null,
  kind text not null,
  storage_path text not null,
  mime_type text,
  byte_size bigint,
  width int,
  height int,
  checksum text,
  created_at timestamptz default now()
);

create table if not exists external_sources (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  repository_name text,
  institution_name text,
  url text not null,
  access_label text,
  stable_identifier text,
  rights_note text,
  is_primary boolean default true,
  last_checked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_name text,
  birth_year int,
  death_year int,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists document_people (
  document_id uuid references documents(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  role text,
  primary key (document_id, person_id, role)
);

create table if not exists document_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  position int not null,
  heading text not null,
  section_type text,
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(document_id, position)
);

alter table document_sections add column if not exists body_format text default 'plain';

create table if not exists document_figures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  position int not null,
  image_path text,
  alt_text text,
  caption text,
  placement text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(document_id, position)
);

alter table document_figures add column if not exists section_id uuid references document_sections(id) on delete set null;
alter table document_figures add column if not exists token text;
alter table document_figures add column if not exists credit text;

create table if not exists editor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table documents add column if not exists updated_by uuid references auth.users(id);
alter table documents add column if not exists editorial_status text default 'draft';

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

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  tag_type text,
  status text default 'published',
  created_at timestamptz default now()
);

alter table tags add column if not exists status text default 'published';

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  dek text,
  body_markdown text,
  icon text,
  seo_title text,
  seo_description text,
  status text default 'draft',
  sort_order int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists topic_documents (
  topic_id uuid references topics(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  position int,
  relationship_label text,
  editorial_note text,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (topic_id, document_id)
);

create table if not exists bibliography_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  item_type text not null,
  title text not null,
  subtitle text,
  publication_title text,
  publisher text,
  publication_place text,
  year int,
  volume text,
  issue text,
  pages text,
  doi text,
  isbn text,
  oclc text,
  jstor_url text,
  publisher_url text,
  google_books_url text,
  worldcat_url text,
  open_access_url text,
  pdf_url text,
  abstract text,
  editorial_note text,
  reliability_note text,
  recommendation_status text default 'recommended',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists bibliography_contributors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  family_name text,
  given_name text,
  slug text unique,
  created_at timestamptz default now()
);

create table if not exists bibliography_item_contributors (
  bibliography_item_id uuid references bibliography_items(id) on delete cascade,
  contributor_id uuid references bibliography_contributors(id) on delete cascade,
  role text default 'author',
  position int default 1,
  primary key (bibliography_item_id, contributor_id, role)
);

create table if not exists bibliography_item_tags (
  bibliography_item_id uuid references bibliography_items(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (bibliography_item_id, tag_id)
);

create table if not exists bibliography_item_eras (
  bibliography_item_id uuid references bibliography_items(id) on delete cascade,
  era_slug text not null,
  position int,
  primary key (bibliography_item_id, era_slug)
);

create table if not exists bibliography_item_documents (
  bibliography_item_id uuid references bibliography_items(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  relationship_label text,
  editorial_note text,
  primary key (bibliography_item_id, document_id)
);

create table if not exists topic_relations (
  topic_id uuid references topics(id) on delete cascade,
  related_topic_id uuid references topics(id) on delete cascade,
  position int,
  relation_label text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (topic_id, related_topic_id),
  check (topic_id <> related_topic_id)
);

create table if not exists document_tags (
  document_id uuid references documents(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (document_id, tag_id)
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  summary text,
  body text,
  cover_image_path text,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table documents add column if not exists parent_collection_id uuid references collections(id) on delete set null;

create table if not exists collection_documents (
  collection_id uuid references collections(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  position int,
  sequence_label text,
  sequence_number int,
  issue_date text,
  editorial_caption text,
  primary key (collection_id, document_id)
);

create table if not exists project_people (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  group_key text not null default 'team',
  role_title text,
  affiliation text,
  bio text,
  portrait_path text,
  portrait_alt text,
  profile_url text,
  sort_order int,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (group_key in ('team', 'advisory_board', 'past_contributor'))
);

create index if not exists project_people_slug_idx on project_people(slug);
create index if not exists project_people_status_group_idx on project_people(status, group_key, sort_order);

grant select on project_people to anon, authenticated;
grant all privileges on project_people to service_role;

alter table project_people enable row level security;

drop policy if exists "Public can read published project people" on project_people;
create policy "Public can read published project people"
  on project_people for select
  using (status = 'published');

insert into project_people (
  slug,
  display_name,
  group_key,
  role_title,
  affiliation,
  bio,
  profile_url,
  sort_order,
  status
) values
  ('benjamin-breen', 'Benjamin Breen', 'team', 'Project team', 'UC Santa Cruz', null, 'https://benjaminpbreen.com', 10, 'published'),
  ('paul-gillis-smith', 'Paul Gillis-Smith', 'team', 'Project team', null, null, null, 20, 'published'),
  ('anne-harrington', 'Anne Harrington', 'team', 'Project team', 'Harvard University', null, null, 30, 'published'),
  ('rebecca-lemov', 'Rebecca Lemov', 'team', 'Project team', 'Harvard University', null, null, 40, 'published'),
  ('erik-davis', 'Erik Davis', 'advisory_board', 'Advisory board', null, null, null, 110, 'published'),
  ('alexis-turner', 'Alexis Turner', 'advisory_board', 'Advisory board', null, null, null, 120, 'published'),
  ('dagny-hatch', 'Dagny Hatch', 'past_contributor', '2024 UCSC student intern', null, null, null, 210, 'published'),
  ('galen-latham-fairchild', 'Galen Latham-Fairchild', 'past_contributor', '2024 UCSC student intern', null, null, null, 220, 'published'),
  ('molly-maher', 'Molly Maher', 'past_contributor', '2024 UCSC student intern', null, null, null, 230, 'published'),
  ('jamie-penilla', 'Jamie Penilla', 'past_contributor', '2024 UCSC student intern', null, null, null, 240, 'published'),
  ('emily-vasquez', 'Emily Vasquez', 'past_contributor', '2024 UCSC student intern', null, null, null, 250, 'published'),
  ('richard-wolf', 'Richard Wolf', 'past_contributor', '2024 UCSC student intern', null, null, null, 260, 'published'),
  ('walter-barnaby', 'Walter Barnaby', 'past_contributor', '2024 UCSC student intern', null, null, null, 270, 'published'),
  ('owen-casey', 'Owen Casey', 'past_contributor', '2024 UCSC student intern', null, null, null, 280, 'published'),
  ('francisco-moreno', 'Francisco Moreno', 'past_contributor', '2024 UCSC student intern', null, null, null, 290, 'published'),
  ('alia-moore', 'Alia Moore', 'past_contributor', '2024 UCSC student intern', null, null, null, 300, 'published')
on conflict (slug) do update set
  display_name = excluded.display_name,
  group_key = excluded.group_key,
  role_title = excluded.role_title,
  affiliation = excluded.affiliation,
  bio = excluded.bio,
  profile_url = excluded.profile_url,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

create index if not exists documents_slug_idx on documents(slug);
create index if not exists documents_status_idx on documents(status);
create index if not exists documents_date_start_idx on documents(date_start);
create index if not exists documents_type_idx on documents(document_type);
create index if not exists documents_medium_idx on documents(medium);
create index if not exists pages_document_id_idx on pages(document_id);
create index if not exists page_lines_page_id_idx on page_lines(page_id);
create index if not exists files_document_id_idx on files(document_id);
create index if not exists external_sources_document_id_idx on external_sources(document_id);
create index if not exists document_sections_document_id_idx on document_sections(document_id);
create index if not exists document_figures_document_id_idx on document_figures(document_id);
create index if not exists content_revisions_document_id_idx on content_revisions(document_id, created_at desc);
create index if not exists tags_slug_idx on tags(slug);
create index if not exists topics_slug_idx on topics(slug);
create index if not exists topics_status_idx on topics(status);
create index if not exists topic_documents_topic_id_idx on topic_documents(topic_id, position);
create index if not exists topic_documents_document_id_idx on topic_documents(document_id);
create index if not exists topic_relations_topic_id_idx on topic_relations(topic_id, position);
create index if not exists bibliography_items_slug_idx on bibliography_items(slug);
create index if not exists bibliography_items_status_idx on bibliography_items(status, recommendation_status);
create index if not exists bibliography_item_contributors_item_idx on bibliography_item_contributors(bibliography_item_id, position);
create index if not exists bibliography_item_tags_item_idx on bibliography_item_tags(bibliography_item_id);
create index if not exists bibliography_item_eras_era_idx on bibliography_item_eras(era_slug, position);
create index if not exists bibliography_item_documents_document_idx on bibliography_item_documents(document_id);

grant usage on schema public to anon, authenticated, service_role;

grant select on documents to anon, authenticated;
grant select on pages to anon, authenticated;
grant select on page_lines to anon, authenticated;
grant select on files to anon, authenticated;
grant select on external_sources to anon, authenticated;
grant select on people to anon, authenticated;
grant select on document_people to anon, authenticated;
grant select on document_sections to anon, authenticated;
grant select on document_figures to anon, authenticated;
grant select on tags to anon, authenticated;
grant select on topics to anon, authenticated;
grant select on topic_documents to anon, authenticated;
grant select on topic_relations to anon, authenticated;
grant select on bibliography_items to anon, authenticated;
grant select on bibliography_contributors to anon, authenticated;
grant select on bibliography_item_contributors to anon, authenticated;
grant select on bibliography_item_tags to anon, authenticated;
grant select on bibliography_item_eras to anon, authenticated;
grant select on bibliography_item_documents to anon, authenticated;
grant select on document_tags to anon, authenticated;
grant select on collections to anon, authenticated;
grant select on collection_documents to anon, authenticated;
grant select on editor_profiles to authenticated;
grant select on content_revisions to authenticated;

grant all privileges on documents to service_role;
grant all privileges on pages to service_role;
grant all privileges on page_lines to service_role;
grant all privileges on files to service_role;
grant all privileges on external_sources to service_role;
grant all privileges on people to service_role;
grant all privileges on document_people to service_role;
grant all privileges on document_sections to service_role;
grant all privileges on document_figures to service_role;
grant all privileges on tags to service_role;
grant all privileges on topics to service_role;
grant all privileges on topic_documents to service_role;
grant all privileges on topic_relations to service_role;
grant all privileges on bibliography_items to service_role;
grant all privileges on bibliography_contributors to service_role;
grant all privileges on bibliography_item_contributors to service_role;
grant all privileges on bibliography_item_tags to service_role;
grant all privileges on bibliography_item_eras to service_role;
grant all privileges on bibliography_item_documents to service_role;
grant all privileges on document_tags to service_role;
grant all privileges on collections to service_role;
grant all privileges on collection_documents to service_role;
grant all privileges on editor_profiles to service_role;
grant all privileges on content_revisions to service_role;

alter table documents enable row level security;
alter table pages enable row level security;
alter table page_lines enable row level security;
alter table files enable row level security;
alter table external_sources enable row level security;
alter table people enable row level security;
alter table document_people enable row level security;
alter table document_sections enable row level security;
alter table document_figures enable row level security;
alter table tags enable row level security;
alter table topics enable row level security;
alter table topic_documents enable row level security;
alter table topic_relations enable row level security;
alter table bibliography_items enable row level security;
alter table bibliography_contributors enable row level security;
alter table bibliography_item_contributors enable row level security;
alter table bibliography_item_tags enable row level security;
alter table bibliography_item_eras enable row level security;
alter table bibliography_item_documents enable row level security;
alter table document_tags enable row level security;
alter table collections enable row level security;
alter table collection_documents enable row level security;
alter table editor_profiles enable row level security;
alter table content_revisions enable row level security;

drop policy if exists "Public can read published documents" on documents;
create policy "Public can read published documents"
  on documents for select
  using (status = 'published');

drop policy if exists "Public can read pages for published documents" on pages;
create policy "Public can read pages for published documents"
  on pages for select
  using (exists (
    select 1 from documents
    where documents.id = pages.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read page lines for published documents" on page_lines;
create policy "Public can read page lines for published documents"
  on page_lines for select
  using (exists (
    select 1 from pages
    join documents on documents.id = pages.document_id
    where pages.id = page_lines.page_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read files for published documents" on files;
create policy "Public can read files for published documents"
  on files for select
  using (exists (
    select 1 from documents
    where documents.id = files.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read external sources for published documents" on external_sources;
create policy "Public can read external sources for published documents"
  on external_sources for select
  using (exists (
    select 1 from documents
    where documents.id = external_sources.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read people" on people;
create policy "Public can read people"
  on people for select
  using (true);

drop policy if exists "Public can read document people" on document_people;
create policy "Public can read document people"
  on document_people for select
  using (exists (
    select 1 from documents
    where documents.id = document_people.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read document sections" on document_sections;
create policy "Public can read document sections"
  on document_sections for select
  using (exists (
    select 1 from documents
    where documents.id = document_sections.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read document figures" on document_figures;
create policy "Public can read document figures"
  on document_figures for select
  using (exists (
    select 1 from documents
    where documents.id = document_figures.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read tags" on tags;
create policy "Public can read tags"
  on tags for select
  using (true);

drop policy if exists "Public can read published topics" on topics;
create policy "Public can read published topics"
  on topics for select
  using (status = 'published');

drop policy if exists "Public can read published topic documents" on topic_documents;
create policy "Public can read published topic documents"
  on topic_documents for select
  using (exists (
    select 1 from topics
    where topics.id = topic_documents.topic_id
      and topics.status = 'published'
  ) and exists (
    select 1 from documents
    where documents.id = topic_documents.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read published topic relations" on topic_relations;
create policy "Public can read published topic relations"
  on topic_relations for select
  using (exists (
    select 1 from topics
    where topics.id = topic_relations.topic_id
      and topics.status = 'published'
  ) and exists (
    select 1 from topics related
    where related.id = topic_relations.related_topic_id
      and related.status = 'published'
  ));

drop policy if exists "Public can read published bibliography items" on bibliography_items;
create policy "Public can read published bibliography items"
  on bibliography_items for select
  using (status = 'published');

drop policy if exists "Public can read bibliography contributors" on bibliography_contributors;
create policy "Public can read bibliography contributors"
  on bibliography_contributors for select
  using (true);

drop policy if exists "Public can read published bibliography item contributors" on bibliography_item_contributors;
create policy "Public can read published bibliography item contributors"
  on bibliography_item_contributors for select
  using (exists (
    select 1 from bibliography_items
    where bibliography_items.id = bibliography_item_contributors.bibliography_item_id
      and bibliography_items.status = 'published'
  ));

drop policy if exists "Public can read published bibliography item tags" on bibliography_item_tags;
create policy "Public can read published bibliography item tags"
  on bibliography_item_tags for select
  using (exists (
    select 1 from bibliography_items
    where bibliography_items.id = bibliography_item_tags.bibliography_item_id
      and bibliography_items.status = 'published'
  ));

drop policy if exists "Public can read published bibliography item eras" on bibliography_item_eras;
create policy "Public can read published bibliography item eras"
  on bibliography_item_eras for select
  using (exists (
    select 1 from bibliography_items
    where bibliography_items.id = bibliography_item_eras.bibliography_item_id
      and bibliography_items.status = 'published'
  ));

drop policy if exists "Public can read published bibliography item documents" on bibliography_item_documents;
create policy "Public can read published bibliography item documents"
  on bibliography_item_documents for select
  using (exists (
    select 1 from bibliography_items
    where bibliography_items.id = bibliography_item_documents.bibliography_item_id
      and bibliography_items.status = 'published'
  ) and exists (
    select 1 from documents
    where documents.id = bibliography_item_documents.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read document tags" on document_tags;
create policy "Public can read document tags"
  on document_tags for select
  using (exists (
    select 1 from documents
    where documents.id = document_tags.document_id
      and documents.status = 'published'
  ));

drop policy if exists "Public can read published collections" on collections;
create policy "Public can read published collections"
  on collections for select
  using (status = 'published');

drop policy if exists "Public can read published collection documents" on collection_documents;
create policy "Public can read published collection documents"
  on collection_documents for select
  using (exists (
    select 1 from collections
    where collections.id = collection_documents.collection_id
      and collections.status = 'published'
  ));

drop policy if exists "Editors can read editor profiles" on editor_profiles;
create policy "Editors can read editor profiles"
  on editor_profiles for select
  using (auth.uid() = user_id or exists (
    select 1 from editor_profiles profile
    where profile.user_id = auth.uid()
      and profile.role in ('owner', 'editor', 'viewer')
  ));

drop policy if exists "Editors can read content revisions" on content_revisions;
create policy "Editors can read content revisions"
  on content_revisions for select
  using (exists (
    select 1 from editor_profiles profile
    where profile.user_id = auth.uid()
      and profile.role in ('owner', 'editor', 'viewer')
  ));
