import { unstable_cache } from "next/cache";
import { filterArchiveSources, type ArchiveSearchParams } from "@/lib/archive-query";
import { getServerEnv } from "@/lib/server-env";
import { getSupabaseClient } from "@/lib/supabase";
import type { ArchiveSource } from "@/lib/types";
import { buildPassage, cosine, keywordSentenceScores, splitSentences } from "@/lib/search-passages";
import { parseSearchMode, type SearchMatchSummary, type SearchMode } from "@/lib/search-types";

type SearchRpcRow = {
  document_id: string;
  href: string | null;
  match_kind: string | null;
  score: number | null;
  snippet: string | null;
};

type RankedRow = SearchRpcRow & {
  mode: SearchMode;
};

export type ArchiveSearchResultSet = {
  matches: Record<string, SearchMatchSummary>;
  mode: SearchMode;
  sources: ArchiveSource[];
  usedFallback: boolean;
};

const SEARCH_RESULT_LIMIT = 400;
// Results that get a sentence-level highlighted passage; the rest keep a plain snippet.
const PASSAGE_RESULT_LIMIT = 30;
const EMBEDDING_MODEL = getServerEnv("OPENAI_EMBEDDING_MODEL") || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = Number.parseInt(getServerEnv("OPENAI_EMBEDDING_DIMENSIONS") || "1536", 10);

export async function searchArchiveSourcesWithMode(
  sources: ArchiveSource[],
  params: ArchiveSearchParams
): Promise<ArchiveSearchResultSet> {
  const query = (params.q ?? "").trim();
  const mode = parseSearchMode(params.mode);
  if (!query) {
    return {
      matches: {},
      mode,
      sources: filterArchiveSources(sources, params),
      usedFallback: false,
    };
  }

  const filteredSources = filterArchiveSources(sources, { ...params, q: undefined, sort: undefined });
  const allowedIds = new Set(filteredSources.map((source) => source.id));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const rows: RankedRow[] = [];
  const [semanticRows, hybridKeywordRows] = await Promise.all([
    mode === "keyword" ? undefined : searchSemanticRows(query),
    mode === "semantic" ? undefined : searchKeywordRows(query),
  ]);
  const semanticFailed = !semanticRows || semanticRows.failed;
  const queryEmbedding = semanticRows?.embedding;
  // Keyword rows back up a failed semantic search (missing key, OpenAI outage) so
  // results degrade to word matches rather than to the in-memory metadata filter.
  const keywordRows = hybridKeywordRows ?? (semanticFailed ? await searchKeywordRows(query) : undefined);
  const keywordFailed = !keywordRows || keywordRows.failed;
  rows.push(...(semanticRows?.rows ?? []).map((row) => ({ ...row, mode: "semantic" as const })));
  rows.push(...(keywordRows?.rows ?? []).map((row) => ({ ...row, mode: "keyword" as const })));

  const rankMode = mode === "semantic" && semanticFailed ? "keyword" : mode;
  const ranked = rankRows(rows, sourceById, allowedIds, query, rankMode);
  const shouldUseFallback = (keywordFailed && semanticFailed) || ranked.length === 0;
  if (shouldUseFallback) {
    const fallbackSources = filterArchiveSources(sources, params);
    return {
      matches: buildFallbackMatches(fallbackSources, query, mode),
      mode,
      sources: applyExplicitSort(fallbackSources, params.sort),
      usedFallback: true,
    };
  }

  await attachPassages(ranked.slice(0, PASSAGE_RESULT_LIMIT).map((row) => row.match), query, mode === "keyword" ? undefined : queryEmbedding);
  for (const { match } of ranked) {
    // The RPCs return whole chunks; plain snippets only need the opening.
    if (!match.passage && match.snippet && match.snippet.length > 320) match.snippet = `${match.snippet.slice(0, 320).replace(/\s\S*$/, "")}…`;
  }

  const rankedSources = ranked
    .map((row) => sourceById.get(row.documentId))
    .filter((source): source is ArchiveSource => Boolean(source));

  return {
    matches: Object.fromEntries(ranked.map((row) => [row.documentId, row.match])),
    mode,
    sources: applyExplicitSort(rankedSources, params.sort),
    usedFallback: false,
  };
}

async function searchKeywordRows(query: string): Promise<{ failed: boolean; rows: SearchRpcRow[] }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { failed: true, rows: [] };

  const { data, error } = await supabase.rpc("search_archive_keyword", {
    match_count: SEARCH_RESULT_LIMIT,
    query_text: query,
  });

  if (error) {
    console.warn("Keyword search RPC failed; falling back to in-memory search.", error.message);
    return { failed: true, rows: [] };
  }

  return { failed: false, rows: (data ?? []) as SearchRpcRow[] };
}

async function searchSemanticRows(query: string): Promise<{ embedding?: number[]; failed: boolean; rows: SearchRpcRow[] }> {
  const supabase = getSupabaseClient();
  const embedding = await embedQueryCached(query.toLowerCase()).catch(() => undefined);
  if (!supabase || !embedding) return { failed: true, rows: [] };

  const { data, error } = await supabase.rpc("search_archive_semantic", {
    match_count: SEARCH_RESULT_LIMIT,
    query_embedding: vectorLiteral(embedding),
    similarity_threshold: 0.12,
  });

  if (error) {
    console.warn("Semantic search RPC failed; falling back to in-memory search.", error.message);
    return { failed: true, rows: [] };
  }

  return { embedding, failed: false, rows: (data ?? []) as SearchRpcRow[] };
}

// Popular searches repeat; caching the query vector saves an OpenAI round trip.
// Failures throw so they are never cached; the caller treats them as no vector.
const embedQueryCached = unstable_cache(
  async (query: string) => {
    const embedding = (await embedTexts([query]))?.[0];
    if (!embedding) throw new Error("Query embedding unavailable");
    return embedding;
  },
  ["search-query-embedding", EMBEDDING_MODEL, String(EMBEDDING_DIMENSIONS)],
  { revalidate: 60 * 60 * 24 * 7 }
);

// Highlights the sentences in each matched chunk closest to the query: by embedding
// similarity when a query embedding is available, otherwise by query-term hits.
async function attachPassages(matches: SearchMatchSummary[], query: string, queryEmbedding?: number[]) {
  const items = matches
    .map((match) => ({ match, sentences: splitSentences(match.snippet ?? "") }))
    .filter((item) => item.sentences.length > 0);
  const keywordScores = items.map((item) => keywordSentenceScores(item.sentences, query));

  let semanticScores: number[][] | undefined;
  if (queryEmbedding && items.length) {
    const embeddings = await embedTexts(items.flatMap((item) => item.sentences), 2500);
    if (embeddings) {
      let offset = 0;
      semanticScores = items.map((item) => {
        const scores = item.sentences.map((_, index) => cosine(queryEmbedding, embeddings[offset + index]));
        offset += item.sentences.length;
        return scores;
      });
    }
  }

  items.forEach((item, index) => {
    // A literal hit on the query term nudges the semantic choice toward it.
    const scores = semanticScores
      ? semanticScores[index].map((value, i) => value + Math.min(keywordScores[index][i], 1) * 0.04)
      : keywordScores[index];
    item.match.passage = buildPassage(item.sentences, scores);
  });
}

async function embedTexts(inputs: string[], timeoutMs?: number) {
  const apiKey = getServerEnv("OPENAI_API_KEY");
  if (!apiKey || !Number.isFinite(EMBEDDING_DIMENSIONS)) return undefined;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
      body: JSON.stringify({
        dimensions: EMBEDDING_DIMENSIONS,
        input: inputs,
        model: EMBEDDING_MODEL,
      }),
    });

    if (!response.ok) {
      console.warn("OpenAI query embedding failed.", response.status, await response.text());
      return undefined;
    }

    const payload = await response.json() as { data?: Array<{ embedding?: number[] }> };
    const embeddings = (payload.data ?? []).map((item) => item.embedding);
    const valid = embeddings.length === inputs.length &&
      embeddings.every((embedding) => Array.isArray(embedding) && embedding.length === EMBEDDING_DIMENSIONS);
    return valid ? embeddings as number[][] : undefined;
  } catch (error) {
    console.warn("OpenAI embedding failed.", error instanceof Error ? error.message : error);
    return undefined;
  }
}

function rankRows(
  rows: RankedRow[],
  sourceById: Map<string, ArchiveSource>,
  allowedIds: Set<string>,
  query: string,
  mode: SearchMode
) {
  const grouped = new Map<string, { keyword?: RankedRow; semantic?: RankedRow }>();
  for (const row of rows) {
    if (!allowedIds.has(row.document_id) || !sourceById.has(row.document_id)) continue;
    const bucket = grouped.get(row.document_id) ?? {};
    if (row.mode === "keyword" && (!bucket.keyword || score(row) > score(bucket.keyword))) bucket.keyword = row;
    if (row.mode === "semantic" && (!bucket.semantic || score(row) > score(bucket.semantic))) bucket.semantic = row;
    grouped.set(row.document_id, bucket);
  }

  const maxKeyword = Math.max(0, ...[...grouped.values()].map((item) => score(item.keyword)));
  const maxSemantic = Math.max(0, ...[...grouped.values()].map((item) => score(item.semantic)));

  return [...grouped.entries()]
    .map(([documentId, item]) => {
      const source = sourceById.get(documentId);
      const keywordScore = normalizeScore(score(item.keyword), maxKeyword);
      const semanticScore = normalizeScore(score(item.semantic), maxSemantic);
      const localBoost = source ? exactMetadataBoost(source, query) : 0;
      const combinedScore = mode === "keyword"
        ? keywordScore + localBoost
        : mode === "semantic"
          ? semanticScore + localBoost * 0.4
          : keywordScore * 0.68 + semanticScore * 0.32 + localBoost;
      const bestRow = preferredRow(item, mode);
      return {
        combinedScore,
        documentId,
        match: <SearchMatchSummary>{
          href: bestRow?.href ?? undefined,
          label: matchLabel(bestRow?.match_kind, bestRow?.mode ?? mode),
          mode,
          score: combinedScore,
          snippet: cleanSnippet(bestRow?.snippet),
        },
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

function preferredRow(item: { keyword?: RankedRow; semantic?: RankedRow }, mode: SearchMode) {
  if (mode === "keyword") return item.keyword;
  if (mode === "semantic") return item.semantic;
  return score(item.keyword) >= score(item.semantic) ? item.keyword ?? item.semantic : item.semantic ?? item.keyword;
}

function score(row?: SearchRpcRow) {
  return typeof row?.score === "number" && Number.isFinite(row.score) ? row.score : 0;
}

function normalizeScore(value: number, max: number) {
  return max > 0 ? value / max : 0;
}

function exactMetadataBoost(source: ArchiveSource, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;
  const titleText = normalize([source.title, source.shortTitle, source.subtitle].filter(Boolean).join(" "));
  if (titleText === normalizedQuery) return 0.5;
  if (titleText.includes(normalizedQuery)) return 0.25;
  if (source.people.some((name) => normalize(name) === normalizedQuery)) return 0.22;
  if (source.tags.some((tag) => normalize(tag) === normalizedQuery)) return 0.18;
  return 0;
}

function applyExplicitSort(sources: ArchiveSource[], sort?: string) {
  if (!sort || sort === "relevance") return sources;
  return [...sources].sort((a, b) => {
    if (sort === "newest") return b.year - a.year;
    if (sort === "title") return a.title.localeCompare(b.title);
    return a.year - b.year;
  });
}

function buildFallbackMatches(sources: ArchiveSource[], query: string, mode: SearchMode): Record<string, SearchMatchSummary> {
  return Object.fromEntries(sources.map((source) => [
    source.id,
    {
      label: "Keyword fallback",
      mode,
      snippet: fallbackSnippet(source, query),
    } satisfies SearchMatchSummary,
  ]));
}

function fallbackSnippet(source: ArchiveSource, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const candidates = [source.summary, source.excerpt, source.citation].filter(Boolean);
  return candidates.find((candidate) => terms.some((term) => normalize(candidate).includes(term))) ?? candidates[0];
}

function matchLabel(kind?: string | null, mode?: SearchMode) {
  if (kind === "metadata") return "Metadata";
  if (kind === "section") return "Reader section";
  if (kind === "translation") return "Translation";
  if (kind === "page") return "OCR page";
  return mode === "semantic" ? "Concept match" : "Keyword match";
}

function cleanSnippet(value?: string | null) {
  return value
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\[\^[^\]]+\]:?|\[\*[0-9a-z]+\]/g, "") // footnote and page markers
    .replace(/\s+/g, " ")
    .trim() || undefined;
}

function vectorLiteral(values: number[]) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
