create extension if not exists pgcrypto;

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

alter table project_people
  drop constraint if exists project_people_group_key_check;
alter table project_people
  add constraint project_people_group_key_check
  check (group_key in ('team', 'advisory_board', 'past_contributor'));

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
  (
    'benjamin-breen',
    'Benjamin Breen',
    'team',
    'Project team',
    'UC Santa Cruz',
    null,
    'https://benjaminpbreen.com',
    10,
    'published'
  ),
  (
    'paul-gillis-smith',
    'Paul Gillis-Smith',
    'team',
    'Project team',
    null,
    null,
    null,
    20,
    'published'
  ),
  (
    'anne-harrington',
    'Anne Harrington',
    'team',
    'Project team',
    'Harvard University',
    null,
    null,
    30,
    'published'
  ),
  (
    'rebecca-lemov',
    'Rebecca Lemov',
    'team',
    'Project team',
    'Harvard University',
    null,
    null,
    40,
    'published'
  ),
  (
    'erik-davis',
    'Erik Davis',
    'advisory_board',
    'Advisory board',
    null,
    null,
    null,
    110,
    'published'
  ),
  (
    'alexis-turner',
    'Alexis Turner',
    'advisory_board',
    'Advisory board',
    null,
    null,
    null,
    120,
    'published'
  ),
  (
    'dagny-hatch',
    'Dagny Hatch',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    210,
    'published'
  ),
  (
    'galen-latham-fairchild',
    'Galen Latham-Fairchild',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    220,
    'published'
  ),
  (
    'molly-maher',
    'Molly Maher',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    230,
    'published'
  ),
  (
    'jamie-penilla',
    'Jamie Penilla',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    240,
    'published'
  ),
  (
    'emily-vasquez',
    'Emily Vasquez',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    250,
    'published'
  ),
  (
    'richard-wolf',
    'Richard Wolf',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    260,
    'published'
  ),
  (
    'walter-barnaby',
    'Walter Barnaby',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    270,
    'published'
  ),
  (
    'owen-casey',
    'Owen Casey',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    280,
    'published'
  ),
  (
    'francisco-moreno',
    'Francisco Moreno',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    290,
    'published'
  ),
  (
    'alia-moore',
    'Alia Moore',
    'past_contributor',
    '2024 UCSC student intern',
    null,
    null,
    null,
    300,
    'published'
  )
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
