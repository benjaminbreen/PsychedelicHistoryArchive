create table if not exists source_issue_reports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete set null,
  source_slug text not null,
  source_title text not null,
  issue_type text not null,
  location text,
  description text not null,
  suggested_fix text,
  reporter_name text,
  reporter_email text,
  page_url text,
  status text not null default 'new',
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (issue_type in ('typo_ocr', 'metadata_error', 'factual_concern', 'broken_link', 'citation_problem', 'rights_access', 'other')),
  check (status in ('new', 'triaged', 'needs_review', 'fixed', 'dismissed'))
);

create index if not exists source_issue_reports_status_idx
  on source_issue_reports(status, created_at desc);

create index if not exists source_issue_reports_document_idx
  on source_issue_reports(document_id, status);

create index if not exists source_issue_reports_slug_idx
  on source_issue_reports(source_slug, status);

grant all privileges on source_issue_reports to service_role;

alter table source_issue_reports enable row level security;
