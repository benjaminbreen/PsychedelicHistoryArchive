create extension if not exists pgcrypto;

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

create index if not exists topics_slug_idx on topics(slug);
create index if not exists topics_status_idx on topics(status);
create index if not exists topic_documents_topic_id_idx on topic_documents(topic_id, position);
create index if not exists topic_documents_document_id_idx on topic_documents(document_id);
create index if not exists topic_relations_topic_id_idx on topic_relations(topic_id, position);

grant select on topics to anon, authenticated;
grant select on topic_documents to anon, authenticated;
grant select on topic_relations to anon, authenticated;
grant all privileges on topics to service_role;
grant all privileges on topic_documents to service_role;
grant all privileges on topic_relations to service_role;

alter table topics enable row level security;
alter table topic_documents enable row level security;
alter table topic_relations enable row level security;

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
