import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { ArchiveResultRow } from "@/components/archive-result-row";
import { PageShell } from "@/components/page/page-shell";
import { SearchModeToggle } from "@/components/search-mode-toggle";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SearchBar } from "@/components/ui/search-bar";
import { searchArchiveSourcesWithMode } from "@/lib/hybrid-search";
import { searchCollections, searchPeople, searchTopics, type PersonSearchResult, type TopicSearchResult } from "@/lib/search";
import { parseSearchMode, searchModeParam, type SearchMode } from "@/lib/search-types";
import { listArchiveSourceSummariesFromSupabase, listCollectionSourceSummariesFromSupabase } from "@/lib/supabase-archive";
import { getSourceTitleParts } from "@/lib/source-title";
import { listPublicTopics } from "@/lib/topics";
import type { ArchiveSource } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search | The Psychedelic History Archive",
  description: "Search sources, topics, people, and collections in The Psychedelic History Archive."
};

export const revalidate = 3600;

type SearchPageProps = {
  searchParams: Promise<{ mode?: string; q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const mode = parseSearchMode(params.mode);
  const [sources, collections, curatedTopics] = await Promise.all([
    listArchiveSourceSummariesFromSupabase(),
    listCollectionSourceSummariesFromSupabase(),
    listPublicTopics()
  ]);
  const sourceSearch = query
    ? await searchArchiveSourcesWithMode(sources, { mode, q: query })
    : { matches: {}, mode, sources: [], usedFallback: false };
  const results = {
    collections: query ? searchCollections(collections, query).slice(0, 6) : [],
    people: query ? searchPeople(sources, query).slice(0, 12) : [],
    sources: sourceSearch.sources.slice(0, 12),
    topics: query ? searchTopics(sources, curatedTopics, query).slice(0, 12) : [],
  };
  const total = results.sources.length + results.collections.length + results.topics.length + results.people.length;

  return (
    <>
      <SiteHeader />
      <PageShell width="wide" className="py-8">
        <header className="grid gap-5 border-b border-archive-line pb-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
          <div>
            <p className="display-label text-sm text-archive-muted">Search</p>
            <h1 className="mt-2 break-words font-display text-[2.5rem] font-normal uppercase leading-none text-archive-ink sm:text-[3.75rem]">
              {query ? `Results for ${query}` : "Search the archive"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-archive-muted">
              Search across source titles, people, topics, collections, citations, and editorial metadata.
            </p>
          </div>
          <div className="grid gap-3">
            <SearchBar
              defaultValue={query}
              mode={mode}
              placeholder="Search people, topics, sources, and more..."
              showModeOptions
              submitLabel="Search"
            />
            {query && (
              <div className="flex flex-wrap items-center gap-3">
                <SearchModeToggle currentMode={mode} hrefForMode={(nextMode) => searchHref(query, nextMode)} />
                {sourceSearch.usedFallback && (
                  <span className="rounded-full border border-archive-line bg-archive-paper px-2.5 py-1 text-xs font-semibold text-archive-muted">
                    Keyword fallback
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {!query ? (
          <section className="mt-8 rounded-md border border-archive-line bg-archive-surface p-7 text-sm leading-6 text-archive-muted">
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 h-5 w-5 text-archive-violet" />
              <p>Enter a name, substance, place, title, or phrase to search the archive.</p>
            </div>
          </section>
        ) : total === 0 ? (
          <NoSearchResults query={query} />
        ) : (
          <div className="mt-8 grid gap-8">
            <SearchSummary
              collectionCount={results.collections.length}
              peopleCount={results.people.length}
              sourceCount={results.sources.length}
              topicCount={results.topics.length}
            />
            <ResultSection title="Sources" count={results.sources.length} actionHref={archiveSearchHref(query, mode)} actionLabel="View all source matches">
              <div className="border-y border-archive-line">
                {results.sources.map((source) => (
                  <ArchiveResultRow key={source.id} match={sourceSearch.matches[source.id]} source={source} />
                ))}
              </div>
            </ResultSection>
            <TopicResults topics={results.topics} />
            <PeopleResults people={results.people} />
            <CollectionResults collections={results.collections} />
          </div>
        )}
      </PageShell>
      <SiteFooter />
    </>
  );
}

function searchHref(query: string, mode: SearchMode) {
  const params = new URLSearchParams({ q: query });
  const modeParam = searchModeParam(mode);
  if (modeParam) params.set("mode", modeParam);
  return `/search?${params.toString()}`;
}

function archiveSearchHref(query: string, mode: SearchMode) {
  const params = new URLSearchParams({ q: query });
  const modeParam = searchModeParam(mode);
  if (modeParam) params.set("mode", modeParam);
  return `/archive?${params.toString()}`;
}

function SearchSummary({
  collectionCount,
  peopleCount,
  sourceCount,
  topicCount
}: {
  collectionCount: number;
  peopleCount: number;
  sourceCount: number;
  topicCount: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <SearchStat label="Sources" value={sourceCount} />
      <SearchStat label="Topics" value={topicCount} />
      <SearchStat label="People" value={peopleCount} />
      <SearchStat label="Collections" value={collectionCount} />
    </div>
  );
}

function SearchStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-archive-line bg-archive-surface px-4 py-3">
      <div className="font-display text-2xl font-semibold leading-none text-archive-ink">{value}</div>
      <div className="mt-1 text-[0.66rem] font-bold uppercase tracking-[0.09em] text-archive-muted">{label}</div>
    </div>
  );
}

function ResultSection({
  actionHref,
  actionLabel,
  children,
  count,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  count: number;
  title: string;
}) {
  if (!count) return null;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="source-serif-heading">
          {title} <span className="font-sans text-sm font-medium text-archive-muted">({count})</span>
        </h2>
        {actionHref && actionLabel && (
          <Link className="focus-ring inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-archive-violet hover:text-archive-violetDark" href={actionHref}>
            {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function TopicResults({ topics }: { topics: TopicSearchResult[] }) {
  return (
    <ResultSection count={topics.length} title="Topics and tags">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Link className="focus-ring rounded-md border border-archive-line bg-archive-surface p-4 transition hover:border-archive-violet/40 hover:bg-archive-lavender2" href={topic.href} key={topic.slug}>
            <span className="display-label block text-[0.7rem] text-archive-violet">Topic</span>
            <span className="mt-1 block font-serif text-lg font-semibold leading-tight text-archive-ink">{topic.name}</span>
            <span className="mt-2 block text-sm leading-5 text-archive-muted">
              {topic.dek || `${topic.count} ${topic.count === 1 ? "source" : "sources"} tagged ${topic.name}.`}
            </span>
          </Link>
        ))}
      </div>
    </ResultSection>
  );
}

function PeopleResults({ people }: { people: PersonSearchResult[] }) {
  return (
    <ResultSection count={people.length} title="People">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <Link className="focus-ring flex items-center justify-between rounded-md border border-archive-line bg-archive-surface px-4 py-3 text-sm font-semibold text-archive-ink transition hover:border-archive-violet/40 hover:bg-archive-lavender2" href={person.href} key={person.href}>
            <span>{person.name}</span>
            <span className="font-mono text-xs text-archive-muted">{person.count}</span>
          </Link>
        ))}
      </div>
    </ResultSection>
  );
}

function CollectionResults({ collections }: { collections: ArchiveSource[] }) {
  return (
    <ResultSection count={collections.length} title="Collections">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => (
          <Link className="focus-ring rounded-md border border-archive-line bg-archive-surface p-4 transition hover:border-archive-violet/40 hover:bg-archive-lavender2" href={`/collections/${collection.slug}`} key={collection.id}>
            <span className="display-label block text-[0.7rem] text-archive-violet">Collection</span>
            <span className="mt-1 block font-serif text-lg font-semibold leading-tight text-archive-ink">{getSourceTitleParts(collection).title}</span>
            <span className="mt-2 flex items-center gap-2 text-sm text-archive-muted">
              <BookOpen className="h-4 w-4" />
              {collection.collectionItemCount ?? collection.collectionItems?.length ?? 0} sources
            </span>
          </Link>
        ))}
      </div>
    </ResultSection>
  );
}

function NoSearchResults({ query }: { query: string }) {
  return (
    <section className="mt-8 rounded-md border border-archive-line bg-archive-surface p-7">
      <h2 className="source-serif-heading">No results found</h2>
      <p className="mt-3 text-sm leading-6 text-archive-muted">
        No sources, topics, people, or collections matched “{query}.”
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
        <Link className="focus-ring rounded-md border border-archive-line px-3 py-2 text-archive-ink hover:bg-archive-lavender2" href="/archive">
          Browse archive
        </Link>
        <Link className="focus-ring rounded-md border border-archive-line px-3 py-2 text-archive-ink hover:bg-archive-lavender2" href="/topics">
          Browse topics
        </Link>
        <Link className="focus-ring rounded-md border border-archive-line px-3 py-2 text-archive-ink hover:bg-archive-lavender2" href="/people">
          Browse people
        </Link>
      </div>
    </section>
  );
}
