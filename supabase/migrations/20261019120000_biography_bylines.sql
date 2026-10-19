-- Credit the writer of each editorial biography. Additive and safe to re-run.
alter table biography_profiles add column if not exists author_name text;
alter table biography_profiles add column if not exists author_slug text;

comment on column biography_profiles.author_name is 'Name shown in the biography byline.';
comment on column biography_profiles.author_slug is 'project_people slug; the byline links to /project-team#<slug>.';
