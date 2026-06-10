import { filterArchiveSources, getFacetCounts } from "@/lib/archive-query";
import { canonicalizePersonName, isDisplayableBiographyName, slugifyPersonName } from "@/lib/biographies";
import { topicHref, topicSlug } from "@/lib/internal-links";
import type { PublicTopicListItem } from "@/lib/topics";
import type { ArchiveSource } from "@/lib/types";

export type TopicSearchResult = {
  count: number;
  dek?: string | null;
  href: string;
  name: string;
  slug: string;
};

export type PersonSearchResult = {
  count: number;
  href: string;
  name: string;
};

export type ArchiveSearchResults = {
  collections: ArchiveSource[];
  people: PersonSearchResult[];
  sources: ArchiveSource[];
  topics: TopicSearchResult[];
  total: number;
};

type SearchArchiveIndexInput = {
  collections: ArchiveSource[];
  curatedTopics: PublicTopicListItem[];
  query: string;
  sources: ArchiveSource[];
};

const DEFAULT_LIMITS = {
  collections: 6,
  people: 12,
  sources: 12,
  topics: 12,
};

export function searchArchiveIndex({
  collections,
  curatedTopics,
  query,
  sources,
}: SearchArchiveIndexInput): ArchiveSearchResults {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      collections: [],
      people: [],
      sources: [],
      topics: [],
      total: 0,
    };
  }

  const sourceResults = filterArchiveSources(sources, { q: cleanQuery }).slice(0, DEFAULT_LIMITS.sources);
  const collectionResults = searchCollections(collections, cleanQuery).slice(0, DEFAULT_LIMITS.collections);
  const topicResults = searchTopics(sources, curatedTopics, cleanQuery).slice(0, DEFAULT_LIMITS.topics);
  const peopleResults = searchPeople(sources, cleanQuery).slice(0, DEFAULT_LIMITS.people);

  return {
    collections: collectionResults,
    people: peopleResults,
    sources: sourceResults,
    topics: topicResults,
    total: sourceResults.length + collectionResults.length + topicResults.length + peopleResults.length,
  };
}

export function searchCollections(collections: ArchiveSource[], query: string) {
  const terms = queryTerms(query);
  return collections.filter((collection) =>
    terms.every((term) =>
      searchableText([
        collection.title,
        collection.subtitle,
        collection.summary,
        collection.excerpt,
        collection.displayDate,
        ...collection.tags,
      ]).includes(term)
    )
  );
}

export function searchTopics(sources: ArchiveSource[], curatedTopics: PublicTopicListItem[], query: string): TopicSearchResult[] {
  const terms = queryTerms(query);
  const tagCounts = getFacetCounts(sources).tags;
  const results = new Map<string, TopicSearchResult>();

  for (const [tag, count] of Object.entries(tagCounts)) {
    if (!terms.every((term) => searchableText([tag]).includes(term))) continue;
    results.set(topicSlug(tag), {
      count,
      href: topicHref(tag),
      name: tag,
      slug: topicSlug(tag),
    });
  }

  for (const topic of curatedTopics) {
    const text = searchableText([topic.name, topic.dek ?? "", topic.seoDescription ?? ""]);
    if (!terms.every((term) => text.includes(term))) continue;
    const existing = results.get(topic.slug);
    results.set(topic.slug, {
      count: topic.documentCount || existing?.count || 0,
      dek: topic.dek,
      href: `/topics/${topic.slug}`,
      name: topic.name,
      slug: topic.slug,
    });
  }

  return [...results.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function searchPeople(sources: ArchiveSource[], query: string): PersonSearchResult[] {
  const terms = queryTerms(query);
  const counts = new Map<string, number>();

  for (const source of sources) {
    for (const name of source.people.length ? source.people : [source.author]) {
      const canonicalName = canonicalizePersonName(name);
      if (!isDisplayableBiographyName(canonicalName)) continue;
      const text = searchableText([canonicalName, source.title, ...source.tags]);
      if (!terms.every((term) => text.includes(term))) continue;
      counts.set(canonicalName, (counts.get(canonicalName) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({
      count,
      href: `/biographies/${slugifyPersonName(name)}`,
      name,
    }));
}

export function queryTerms(query: string) {
  return searchableText([query]).split(/\s+/).filter(Boolean);
}

export function searchableText(values: Array<string | undefined>) {
  return values
    .join(" ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
