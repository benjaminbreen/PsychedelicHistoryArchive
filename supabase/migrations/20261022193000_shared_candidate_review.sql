-- Private, persistent review data for the deployed editorial workspace.
create table if not exists public.corpus_candidate_batches (
  batch text primary key,
  summary jsonb not null
);
create table if not exists public.corpus_candidates (
  candidate_id text not null,
  batch text not null references public.corpus_candidate_batches(batch),
  rank integer not null,
  payload jsonb not null,
  primary key (batch, candidate_id)
);
create table if not exists public.corpus_candidate_decisions (
  id bigint generated always as identity primary key,
  candidate_id text not null,
  batch text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (batch, candidate_id) references public.corpus_candidates(batch, candidate_id)
);
create table if not exists public.corpus_workspace_nominations (
  candidate_id text primary key,
  document_id uuid not null references public.documents(id),
  sent_at timestamptz not null default now()
);
alter table public.corpus_candidate_batches enable row level security;
alter table public.corpus_candidates enable row level security;
alter table public.corpus_candidate_decisions enable row level security;
alter table public.corpus_workspace_nominations enable row level security;
revoke all on public.corpus_candidate_batches, public.corpus_candidates, public.corpus_candidate_decisions, public.corpus_workspace_nominations from anon, authenticated;
grant all on public.corpus_candidate_batches, public.corpus_candidates, public.corpus_candidate_decisions, public.corpus_workspace_nominations to service_role;
grant usage, select on sequence public.corpus_candidate_decisions_id_seq to service_role;

-- A nomination and its private draft are created together. Retrying, or two
-- editors sending the same nomination, returns the existing source.
create or replace function public.cms_nominate_candidate(candidate_key text, edit_payload jsonb, actor_id uuid default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare source_id uuid; source_title text;
begin
  perform public.cms_assert_actor(actor_id);
  perform pg_advisory_xact_lock(hashtextextended(candidate_key, 0));
  select document_id into source_id from public.corpus_workspace_nominations where candidate_id = candidate_key;
  if found then return source_id; end if;
  if not exists(select 1 from public.corpus_candidates where candidate_id = candidate_key) then
    raise exception 'Candidate not found.';
  end if;
  if edit_payload->'proposal'->'provenance'->>'candidate_id' is distinct from candidate_key then
    raise exception 'The proposal does not match this candidate.';
  end if;
  source_id := gen_random_uuid();
  source_title := coalesce(nullif(trim(edit_payload->'document'->>'title'), ''), 'Untitled source');
  insert into public.documents(id, slug, title, status, updated_by)
  values(source_id, 'corpus-' || source_id::text, source_title, 'draft', actor_id);
  perform public.cms_save_draft(source_id, edit_payload, 0, actor_id);
  insert into public.corpus_workspace_nominations(candidate_id, document_id) values(candidate_key, source_id);
  return source_id;
end;
$$;
revoke all on function public.cms_nominate_candidate(text,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.cms_nominate_candidate(text,jsonb,uuid) to service_role;
