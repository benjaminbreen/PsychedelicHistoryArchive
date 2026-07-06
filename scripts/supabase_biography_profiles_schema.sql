create table if not exists biography_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  years text,
  dek text,
  body_markdown text,
  birth_date text,
  birth_year int,
  birth_place text,
  death_date text,
  death_year int,
  death_place text,
  occupations text[] default '{}',
  regions text[] default '{}',
  known_for text[] default '{}',
  affiliations text[] default '{}',
  image_path text,
  image_alt text,
  image_caption text,
  tags text[] default '{}',
  facts jsonb default '[]'::jsonb,
  source_notes text[] default '{}',
  related_sources text[] default '{}',
  publications text[] default '{}',
  collaborators text[] default '{}',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create index if not exists biography_profiles_slug_idx on biography_profiles(slug);
create index if not exists biography_profiles_status_idx on biography_profiles(status, name);
create index if not exists biography_bibliography_items_profile_idx on biography_bibliography_items(biography_profile_id, relationship_type, position);
create index if not exists biography_bibliography_items_item_idx on biography_bibliography_items(bibliography_item_id);

grant select on biography_profiles to anon, authenticated;
grant select on biography_bibliography_items to anon, authenticated;
grant all privileges on biography_profiles to service_role;
grant all privileges on biography_bibliography_items to service_role;

alter table biography_profiles enable row level security;
alter table biography_bibliography_items enable row level security;

drop policy if exists "Public can read published biography profiles" on biography_profiles;
create policy "Public can read published biography profiles"
  on biography_profiles for select
  using (status = 'published');

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

notify pgrst, 'reload schema';
