-- Brings the live database up to the current code and adds the editing workspace.
-- Safe to run more than once. Adds columns, one table, and the CMS draft/publish functions.
-- It does not delete, publish, or rewrite any existing content.

-- 1. Catch-up: columns and table the site code already expects (from scripts/supabase_schema.sql).
alter table biography_profiles add column if not exists birth_date text;
alter table biography_profiles add column if not exists birth_year int;
alter table biography_profiles add column if not exists birth_place text;
alter table biography_profiles add column if not exists death_date text;
alter table biography_profiles add column if not exists death_year int;
alter table biography_profiles add column if not exists death_place text;
alter table biography_profiles add column if not exists occupations text[] default '{}';
alter table biography_profiles add column if not exists regions text[] default '{}';
alter table biography_profiles add column if not exists known_for text[] default '{}';
alter table biography_profiles add column if not exists affiliations text[] default '{}';

alter table collection_documents add column if not exists sequence_label text;
alter table collection_documents add column if not exists sequence_number int;
alter table collection_documents add column if not exists issue_date text;

create table if not exists biography_bibliography_items (
  biography_profile_id uuid references biography_profiles(id) on delete cascade,
  bibliography_item_id uuid references bibliography_items(id) on delete cascade,
  relationship_type text not null default 'recommended_reading',
  position int,
  editorial_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (biography_profile_id, bibliography_item_id, relationship_type),
  check (relationship_type in ('work_by', 'work_about', 'recommended_reading', 'primary_source', 'archival_context'))
);
create index if not exists biography_bibliography_items_profile_idx on biography_bibliography_items(biography_profile_id, relationship_type, position);
create index if not exists biography_bibliography_items_item_idx on biography_bibliography_items(bibliography_item_id);
grant select on biography_bibliography_items to anon, authenticated;
grant all privileges on biography_bibliography_items to service_role;
alter table biography_bibliography_items enable row level security;
drop policy if exists "Public can read published biography bibliography links" on biography_bibliography_items;
create policy "Public can read published biography bibliography links"
  on biography_bibliography_items for select
  using (exists (
    select 1 from biography_profiles
    where biography_profiles.id = biography_bibliography_items.biography_profile_id
      and biography_profiles.status = 'published'
  ) and exists (
    select 1 from bibliography_items
    where bibliography_items.id = biography_bibliography_items.bibliography_item_id
      and bibliography_items.status = 'published'
  ));

-- 2. Editing workspace (same as scripts/supabase_cms_workspace.sql).
-- Apply once in the Supabase SQL editor. This migration does not publish any content.
-- CMS writes are authenticated on the server and use narrowly scoped, transactional RPCs.
create table if not exists public.source_working_copies (
  document_id uuid primary key references public.documents(id) on delete cascade,
  payload jsonb not null,
  title text not null default '',
  display_date text,
  version bigint not null default 1,
  dirty boolean not null default true,
  base_updated_at timestamptz,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.source_working_copies enable row level security;
revoke all on public.source_working_copies from anon, authenticated;
grant all on public.source_working_copies to service_role;

-- Avoid the existing self-referencing editor_profiles policy.
create or replace function public.cms_is_editor() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.editor_profiles where user_id = auth.uid() and role in ('owner', 'editor'));
$$;
revoke all on function public.cms_is_editor() from public;
grant execute on function public.cms_is_editor() to authenticated;
drop policy if exists "Editors can read editor profiles" on public.editor_profiles;
drop policy if exists cms_read_own_profile on public.editor_profiles;
-- The CMS reads profiles through its server client. No browser profile writes.
create policy cms_read_own_profile on public.editor_profiles for select to authenticated using (user_id = auth.uid());

create or replace function public.cms_assert_actor(actor_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if actor_id is not null and not exists(select 1 from public.editor_profiles where user_id = actor_id and role in ('owner', 'editor')) then
    raise exception 'Editor access is required.';
  end if;
end;
$$;
revoke all on function public.cms_assert_actor(uuid) from public, anon, authenticated;

create or replace function public.cms_save_draft(source_id uuid, edit_payload jsonb, expected_version bigint, actor_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare d public.documents; w public.source_working_copies; stamp timestamptz := clock_timestamp();
begin
  perform public.cms_assert_actor(actor_id);
  select * into d from public.documents where id = source_id for update;
  if not found then raise exception 'Source not found.'; end if;
  select * into w from public.source_working_copies where document_id = source_id for update;
  if coalesce(w.version, 0) <> expected_version then raise exception 'Another editor or tab saved this source. Reload before replacing their work.'; end if;
  if jsonb_typeof(edit_payload->'document') <> 'object' or jsonb_typeof(edit_payload->'sections') <> 'array' then raise exception 'Invalid source draft.'; end if;
  insert into public.source_working_copies(document_id, payload, title, display_date, version, base_updated_at, updated_by, updated_at, dirty)
  values(source_id, edit_payload, coalesce(edit_payload->'document'->>'title', ''), edit_payload->'document'->>'display_date', expected_version + 1, d.updated_at, actor_id, stamp, true)
  on conflict(document_id) do update set payload = excluded.payload, title = excluded.title, display_date = excluded.display_date,
    version = excluded.version, updated_by = excluded.updated_by, updated_at = excluded.updated_at, dirty = true;
  return jsonb_build_object('version', expected_version + 1, 'updated_at', stamp);
end;
$$;

create or replace function public.cms_publish_source(source_id uuid, expected_version bigint, publish_payload jsonb, actor_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare d public.documents; w public.source_working_copies; part jsonb; person_id_value uuid; stamp timestamptz := clock_timestamp(); filtered jsonb; before_snapshot jsonb;
begin
  perform public.cms_assert_actor(actor_id);
  select * into d from public.documents where id = source_id for update;
  if not found then raise exception 'Source not found.'; end if;
  select * into w from public.source_working_copies where document_id = source_id for update;
  if not found or w.version <> expected_version then raise exception 'This source changed in another tab. Reload before publishing.'; end if;
  if w.base_updated_at is distinct from d.updated_at then raise exception 'The published source changed since this draft began. Reload and reconcile the changes before publishing.'; end if;
  if length(trim(coalesce(publish_payload->'document'->>'title', ''))) = 0 then raise exception 'Add a title before publishing.'; end if;
  if coalesce(publish_payload->'document'->>'source_url', '') = '' and coalesce(publish_payload->'document'->>'citation', '') = '' then raise exception 'Add an original source link or citation.'; end if;
  before_snapshot := jsonb_build_object('document', to_jsonb(d), 'sections', coalesce((select jsonb_agg(s order by position) from public.document_sections s where document_id = source_id), '[]'::jsonb), 'figures', coalesce((select jsonb_agg(f order by position) from public.document_figures f where document_id = source_id), '[]'::jsonb));
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into filtered from jsonb_each(publish_payload->'document') where key = any(array['title', 'short_title', 'subtitle', 'display_date', 'date_start', 'date_end', 'document_type', 'medium', 'language', 'content_language', 'region', 'publisher', 'publication_title', 'summary', 'abstract', 'citation', 'rights_statement', 'source_url', 'external_access_url', 'access_type', 'hosting_status', 'source_kind', 'parent_collection_id', 'sequence_label', 'sequence_number', 'issue_date', 'reader_mode', 'media_embed_url', 'cover_image_path', 'thumbnail_path', 'translation_text', 'translation_language', 'translation_provider', 'translation_note']);
  d := jsonb_populate_record(d, filtered);
  update public.documents set title = d.title, short_title = d.short_title, subtitle = d.subtitle, display_date = d.display_date, date_start = d.date_start, date_end = d.date_end, document_type = d.document_type, medium = d.medium, language = d.language, content_language = d.content_language, region = d.region, publisher = d.publisher, publication_title = d.publication_title, summary = d.summary, abstract = d.abstract, citation = d.citation, rights_statement = d.rights_statement, source_url = d.source_url, external_access_url = d.external_access_url, access_type = d.access_type, hosting_status = d.hosting_status, source_kind = d.source_kind, parent_collection_id = d.parent_collection_id, sequence_label = d.sequence_label, sequence_number = d.sequence_number, issue_date = d.issue_date, reader_mode = d.reader_mode, media_embed_url = d.media_embed_url, cover_image_path = d.cover_image_path, thumbnail_path = d.thumbnail_path, translation_text = d.translation_text, translation_language = d.translation_language, translation_provider = d.translation_provider, translation_note = d.translation_note, status = 'published', editorial_status = 'published', published_at = coalesce(published_at, stamp), updated_at = stamp, updated_by = actor_id where id = source_id;

  -- Keep stable IDs, and move positions aside while reordering to avoid uniqueness conflicts.
  if exists(select 1 from public.document_sections where id in (select (value->>'id')::uuid from jsonb_array_elements(publish_payload->'sections')) and document_id <> source_id)
    or exists(select 1 from public.document_figures where id in (select (value->>'id')::uuid from jsonb_array_elements(publish_payload->'figures')) and document_id <> source_id)
    or exists(select 1 from public.files where id in (select (value->>'id')::uuid from jsonb_array_elements(publish_payload->'files')) and document_id <> source_id) then raise exception 'A source part belongs to another source.'; end if;
  update public.document_sections set position = -position - 1000000 where document_id = source_id;
  for part in select value from jsonb_array_elements(publish_payload->'sections') loop
    insert into public.document_sections(id, document_id, position, heading, section_type, body, body_format, updated_at)
    values((part->>'id')::uuid, source_id, (part->>'position')::int, coalesce(part->>'heading', ''), part->>'section_type', part->>'body', part->>'body_format', stamp)
    on conflict(id) do update set position = excluded.position, heading = excluded.heading, section_type = excluded.section_type, body = excluded.body, body_format = excluded.body_format, updated_at = stamp;
  end loop;
  delete from public.document_sections where document_id = source_id and id not in (select (value->>'id')::uuid from jsonb_array_elements(publish_payload->'sections'));
  update public.document_figures set position = -position - 1000000 where document_id = source_id;
  for part in select value from jsonb_array_elements(publish_payload->'figures') loop
    insert into public.document_figures(id, document_id, position, image_path, alt_text, caption, credit, token, placement, updated_at)
    values((part->>'id')::uuid, source_id, (part->>'position')::int, part->>'image_path', part->>'alt_text', part->>'caption', part->>'credit', part->>'token', part->>'placement', stamp)
    on conflict(id) do update set position = excluded.position, image_path = excluded.image_path, alt_text = excluded.alt_text, caption = excluded.caption, credit = excluded.credit, token = excluded.token, placement = excluded.placement, updated_at = stamp;
  end loop;
  delete from public.document_figures where document_id = source_id and id not in (select (value->>'id')::uuid from jsonb_array_elements(publish_payload->'figures'));
  for part in select value from jsonb_array_elements(publish_payload->'files') loop
    insert into public.files(id, document_id, kind, storage_path, mime_type, byte_size)
    values((part->>'id')::uuid, source_id, part->>'kind', part->>'storage_path', part->>'mime_type', (part->>'byte_size')::bigint)
    on conflict(id) do update set kind = excluded.kind, storage_path = excluded.storage_path, mime_type = excluded.mime_type, byte_size = excluded.byte_size;
  end loop;
  delete from public.files where document_id = source_id and id not in (select (value->>'id')::uuid from jsonb_array_elements(publish_payload->'files'));
  delete from public.document_people where document_id = source_id;
  for part in select value from jsonb_array_elements(publish_payload->'people') loop
    person_id_value := nullif(part->>'id', '')::uuid;
    if person_id_value is null then
      select id into person_id_value from public.people where lower(name) = lower(part->>'name') limit 1;
      if person_id_value is null then
        insert into public.people(slug, name) values(left(trim(both '-' from regexp_replace(lower(part->>'name'), '[^a-z0-9]+', '-', 'g')), 100) || '-' || left(md5(lower(part->>'name')), 8), part->>'name')
        on conflict(slug) do update set name = excluded.name returning id into person_id_value;
      end if;
    end if;
    insert into public.document_people(document_id, person_id, role) values(source_id, person_id_value, coalesce(part->>'role', 'author')) on conflict do nothing;
  end loop;
  delete from public.document_tags where document_id = source_id;
  insert into public.document_tags(document_id, tag_id) select source_id, value::uuid from jsonb_array_elements_text(publish_payload->'tagIds') on conflict do nothing;
  delete from public.collection_documents where document_id = source_id;
  for part in select value from jsonb_array_elements(publish_payload->'collections') loop
    insert into public.collection_documents(collection_id, document_id, position, sequence_number, sequence_label, issue_date, editorial_caption)
    values((part->>'collection_id')::uuid, source_id, (part->>'position')::int, (part->>'sequence_number')::int, part->>'sequence_label', part->>'issue_date', part->>'editorial_caption');
  end loop;
  insert into public.content_revisions(table_name, row_id, document_id, changed_by, change_note, before_data, after_data)
    values('cms_publication', source_id, source_id, actor_id, 'Published source', before_snapshot, publish_payload);
  update public.source_working_copies set payload = publish_payload, version = expected_version + 1, dirty = false, base_updated_at = stamp, updated_at = stamp, updated_by = actor_id where document_id = source_id;
  return jsonb_build_object('version', expected_version + 1, 'updated_at', stamp);
end;
$$;

create or replace function public.cms_unpublish_source(source_id uuid, expected_version bigint, actor_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare d public.documents; w public.source_working_copies; stamp timestamptz := clock_timestamp();
begin
  perform public.cms_assert_actor(actor_id);
  select * into d from public.documents where id = source_id for update;
  select * into w from public.source_working_copies where document_id = source_id for update;
  if d.id is null then raise exception 'Source not found.'; end if;
  if coalesce(w.version, 0) <> expected_version then raise exception 'This source changed in another tab. Reload before moving it to drafts.'; end if;
  update public.documents set status = 'draft', editorial_status = 'draft', updated_at = stamp, updated_by = actor_id where id = source_id;
  if w.document_id is not null then
    update public.source_working_copies set version = expected_version + 1, base_updated_at = stamp, dirty = true, updated_at = stamp, updated_by = actor_id where document_id = source_id;
  end if;
  insert into public.content_revisions(table_name, row_id, document_id, changed_by, change_note, before_data, after_data) values('cms_publication', source_id, source_id, actor_id, 'Moved to drafts', to_jsonb(d), w.payload);
  return jsonb_build_object('version', case when w.document_id is null then 0 else expected_version + 1 end, 'updated_at', stamp);
end;
$$;

revoke all on function public.cms_save_draft(uuid,jsonb,bigint,uuid) from public, anon, authenticated;
revoke all on function public.cms_publish_source(uuid,bigint,jsonb,uuid) from public, anon, authenticated;
revoke all on function public.cms_unpublish_source(uuid,bigint,uuid) from public, anon, authenticated;
grant execute on function public.cms_save_draft(uuid,jsonb,bigint,uuid) to service_role;
grant execute on function public.cms_publish_source(uuid,bigint,jsonb,uuid) to service_role;
grant execute on function public.cms_unpublish_source(uuid,bigint,uuid) to service_role;
insert into storage.buckets(id, name, public, file_size_limit) values('archive-drafts', 'archive-drafts', false, 52428800) on conflict(id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- Supporting pages use the same private draft -> preview -> publish workflow.
create table if not exists public.cms_page_drafts (
  kind text not null check(kind in ('collection','topic','biography','bibliography')),
  row_id uuid not null,
  payload jsonb not null,
  title text not null default '',
  version bigint not null default 1,
  dirty boolean not null default true,
  base_updated_at timestamptz,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key(kind,row_id)
);
alter table public.cms_page_drafts enable row level security;
revoke all on public.cms_page_drafts from anon, authenticated;
grant all on public.cms_page_drafts to service_role;
create or replace function public.cms_page_target(page_kind text) returns text language plpgsql immutable set search_path = public, pg_temp as $$
begin
  case page_kind when 'collection' then return 'collections'; when 'topic' then return 'topics'; when 'biography' then return 'biography_profiles'; when 'bibliography' then return 'bibliography_items'; else raise exception 'Unknown page type.'; end case;
end;
$$;
revoke all on function public.cms_page_target(text) from public, anon, authenticated;

create or replace function public.cms_save_page(page_kind text, page_id uuid, edit_payload jsonb, expected_version bigint, actor_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target text := public.cms_page_target(page_kind); live jsonb; w public.cms_page_drafts; stamp timestamptz := clock_timestamp();
begin
  perform public.cms_assert_actor(actor_id);
  execute format('select to_jsonb(t) from public.%I t where id=$1 for update',target) into live using page_id;
  if live is null then raise exception 'Page not found.'; end if;
  select * into w from public.cms_page_drafts where kind=page_kind and row_id=page_id for update;
  if coalesce(w.version,0) <> expected_version then raise exception 'Another editor or tab saved this page. Reload before replacing their work.'; end if;
  if jsonb_typeof(edit_payload->'fields') <> 'object' then raise exception 'Invalid page draft.'; end if;
  insert into public.cms_page_drafts(kind,row_id,payload,title,version,dirty,base_updated_at,updated_by,updated_at)
  values(page_kind,page_id,edit_payload,coalesce(edit_payload->'fields'->>'title',edit_payload->'fields'->>'name',''),expected_version+1,true,(live->>'updated_at')::timestamptz,actor_id,stamp)
  on conflict(kind,row_id) do update set payload=excluded.payload,title=excluded.title,version=excluded.version,dirty=true,updated_by=actor_id,updated_at=stamp;
  return jsonb_build_object('version',expected_version+1,'status',live->>'status');
end;
$$;

create or replace function public.cms_publish_page(page_kind text, page_id uuid, expected_version bigint, actor_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target text := public.cms_page_target(page_kind); live jsonb; w public.cms_page_drafts; stamp timestamptz := clock_timestamp(); columns text[]; assignments text; part jsonb; contributor_id_value uuid; contributor_position int := 0;
begin
  perform public.cms_assert_actor(actor_id);
  execute format('select to_jsonb(t) from public.%I t where id=$1 for update',target) into live using page_id;
  if live is null then raise exception 'Page not found.'; end if;
  select * into w from public.cms_page_drafts where kind=page_kind and row_id=page_id for update;
  if not found or w.version<>expected_version then raise exception 'This page changed in another tab. Reload before publishing.'; end if;
  if w.base_updated_at is distinct from (live->>'updated_at')::timestamptz then raise exception 'The published page changed since this draft began. Reload and reconcile before publishing.'; end if;
  if length(trim(coalesce(w.payload->'fields'->>'title',w.payload->'fields'->>'name',''))) = 0 then raise exception 'Add a title before publishing.'; end if;
  case page_kind when 'collection' then columns := array['title','subtitle','summary','body','cover_image_path']; when 'topic' then columns := array['name','dek','body_markdown','icon','sort_order','seo_title','seo_description']; when 'biography' then columns := array['name','dek','body_markdown','years','birth_date','birth_year','birth_place','death_date','death_year','death_place','occupations','regions','known_for','affiliations','image_path','image_alt','image_caption','tags','source_notes','related_sources','publications','collaborators']; when 'bibliography' then columns := array['title','subtitle','abstract','editorial_note','item_type','year','publication_title','publisher','publication_place','volume','issue','pages','doi','isbn','oclc','publisher_url','open_access_url','pdf_url','jstor_url','google_books_url','worldcat_url','reliability_note']; end case;
  select string_agg(format('%I = (jsonb_populate_record(t,$1)).%I',c,c), ', ') into assignments from unnest(columns) c;
  execute format('update public.%I t set %s, status=''published'', updated_at=$2 where id=$3',target,assignments) using w.payload->'fields',stamp,page_id;
  if page_kind='collection' then
    delete from public.collection_documents where collection_id=page_id;
    for part in select value from jsonb_array_elements(w.payload->'sources') loop
      insert into public.collection_documents(collection_id,document_id,position,sequence_number,sequence_label,issue_date,editorial_caption)
      values(page_id,(part->>'document_id')::uuid,(part->>'position')::int,(part->>'sequence_number')::int,part->>'sequence_label',part->>'issue_date',part->>'editorial_caption');
    end loop;
  elsif page_kind='topic' then
    delete from public.topic_documents where topic_id=page_id;
    for part in select value from jsonb_array_elements(w.payload->'sources') loop
      insert into public.topic_documents(topic_id,document_id,position,relationship_label,editorial_note,is_featured,updated_at)
      values(page_id,(part->>'document_id')::uuid,(part->>'position')::int,part->>'relationship_label',part->>'editorial_note',coalesce((part->>'is_featured')::boolean,false),stamp);
    end loop;
  end if;
  if page_kind='bibliography' and w.payload ? 'contributors' then
    delete from public.bibliography_item_contributors where bibliography_item_id=page_id;
    for part in select value from jsonb_array_elements(w.payload->'contributors') loop
      contributor_id_value := nullif(part->>'id','')::uuid;
      if contributor_id_value is null then
        select id into contributor_id_value from public.bibliography_contributors where lower(display_name)=lower(part->>'name') limit 1;
        if contributor_id_value is null then
          insert into public.bibliography_contributors(display_name,slug) values(part->>'name','cms-'||left(md5(lower(part->>'name')),20)) on conflict(slug) do update set display_name=excluded.display_name returning id into contributor_id_value;
        end if;
      end if;
      contributor_position := contributor_position + 1;
      insert into public.bibliography_item_contributors(bibliography_item_id,contributor_id,role,position) values(page_id,contributor_id_value,part->>'role',contributor_position) on conflict do nothing;
    end loop;
  end if;
  insert into public.content_revisions(table_name,row_id,changed_by,change_note,before_data,after_data)
  values('cms_'||page_kind,page_id,actor_id,'Published '||page_kind,live,w.payload);
  update public.cms_page_drafts set version=expected_version+1,dirty=false,base_updated_at=stamp,updated_at=stamp,updated_by=actor_id where kind=page_kind and row_id=page_id;
  return jsonb_build_object('version',expected_version+1,'status','published');
end;
$$;

create or replace function public.cms_unpublish_page(page_kind text,page_id uuid,expected_version bigint,actor_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target text := public.cms_page_target(page_kind); live jsonb; w public.cms_page_drafts; stamp timestamptz := clock_timestamp();
begin
  perform public.cms_assert_actor(actor_id);
  execute format('select to_jsonb(t) from public.%I t where id=$1 for update',target) into live using page_id;
  if live is null then raise exception 'Page not found.'; end if;
  select * into w from public.cms_page_drafts where kind=page_kind and row_id=page_id for update;
  if not found or w.version<>expected_version then raise exception 'This page changed in another tab. Reload before moving it to drafts.'; end if;
  execute format('update public.%I set status=''draft'',updated_at=$1 where id=$2',target) using stamp,page_id;
  update public.cms_page_drafts set version=expected_version+1,dirty=true,base_updated_at=stamp,updated_at=stamp,updated_by=actor_id where kind=page_kind and row_id=page_id;
  insert into public.content_revisions(table_name,row_id,changed_by,change_note,before_data,after_data) values('cms_'||page_kind,page_id,actor_id,'Moved to drafts',live,w.payload);
  return jsonb_build_object('version',expected_version+1,'status','draft');
end;
$$;
revoke all on function public.cms_save_page(text,uuid,jsonb,bigint,uuid) from public,anon,authenticated;
revoke all on function public.cms_publish_page(text,uuid,bigint,uuid) from public,anon,authenticated;
revoke all on function public.cms_unpublish_page(text,uuid,bigint,uuid) from public,anon,authenticated;
grant execute on function public.cms_save_page(text,uuid,jsonb,bigint,uuid) to service_role;
grant execute on function public.cms_publish_page(text,uuid,bigint,uuid) to service_role;
grant execute on function public.cms_unpublish_page(text,uuid,bigint,uuid) to service_role;

notify pgrst, 'reload schema';
