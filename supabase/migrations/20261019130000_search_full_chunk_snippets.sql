-- Search RPCs return the whole matching chunk (capped) instead of its first 320
-- characters, so the app can pick out the sentences that actually match.
create or replace function search_archive_keyword(
  query_text text,
  match_count int default 200
)
returns table (
  document_id uuid,
  score real,
  snippet text,
  match_kind text,
  href text
)
language sql
stable
as $$
  with query as (
    select
      websearch_to_tsquery('english', coalesce(query_text, '')) as ts_query,
      lower(trim(coalesce(query_text, ''))) as normalized_query
  ),
  chunk_matches as (
    select
      search_chunks.document_id,
      search_chunks.chunk_kind,
      search_chunks.href,
      left(regexp_replace(search_chunks.chunk_text, '\s+', ' ', 'g'), 2400) as snippet,
      (
        ts_rank_cd(search_chunks.search_vector, query.ts_query) *
          case search_chunks.chunk_kind
            when 'metadata' then 3.0
            when 'section' then 1.5
            when 'translation' then 1.5
            else 1.0
          end
      ) +
      case
        when query.normalized_query <> '' and lower(search_chunks.title) = query.normalized_query then 5.0
        when query.normalized_query <> '' and lower(search_chunks.title) like '%' || query.normalized_query || '%' then 3.0
        else 0.0
      end +
      case
        when query.normalized_query <> '' then similarity(search_chunks.title, query.normalized_query)
        else 0.0
      end as score
    from search_chunks, query
    where
      query.normalized_query <> '' and (
        search_chunks.search_vector @@ query.ts_query or
        search_chunks.title % query.normalized_query or
        search_chunks.chunk_text % query.normalized_query
      )
  ),
  ranked as (
    select
      chunk_matches.*,
      row_number() over (partition by chunk_matches.document_id order by chunk_matches.score desc) as rank_in_document
    from chunk_matches
  )
  select
    ranked.document_id,
    max(ranked.score)::real as score,
    (array_agg(ranked.snippet order by ranked.score desc))[1] as snippet,
    (array_agg(ranked.chunk_kind order by ranked.score desc))[1] as match_kind,
    (array_agg(ranked.href order by ranked.score desc))[1] as href
  from ranked
  where ranked.rank_in_document <= 3
  group by ranked.document_id
  order by max(ranked.score) desc
  limit greatest(match_count, 1);
$$;

create or replace function search_archive_semantic(
  query_embedding vector(1536),
  match_count int default 200,
  similarity_threshold real default 0.12
)
returns table (
  document_id uuid,
  score real,
  snippet text,
  match_kind text,
  href text
)
language sql
stable
as $$
  with nearest_chunks as (
    select
      search_chunks.document_id,
      search_chunks.chunk_kind,
      search_chunks.href,
      left(regexp_replace(search_chunks.chunk_text, '\s+', ' ', 'g'), 2400) as snippet,
      (1 - (search_chunks.embedding <=> query_embedding))::real as score
    from search_chunks
    where search_chunks.embedding is not null
      and (1 - (search_chunks.embedding <=> query_embedding)) >= similarity_threshold
    order by search_chunks.embedding <=> query_embedding
    limit greatest(match_count, 1) * 4
  )
  select
    nearest_chunks.document_id,
    max(nearest_chunks.score)::real as score,
    (array_agg(nearest_chunks.snippet order by nearest_chunks.score desc))[1] as snippet,
    (array_agg(nearest_chunks.chunk_kind order by nearest_chunks.score desc))[1] as match_kind,
    (array_agg(nearest_chunks.href order by nearest_chunks.score desc))[1] as href
  from nearest_chunks
  group by nearest_chunks.document_id
  order by max(nearest_chunks.score) desc
  limit greatest(match_count, 1);
$$;

notify pgrst, 'reload schema';
