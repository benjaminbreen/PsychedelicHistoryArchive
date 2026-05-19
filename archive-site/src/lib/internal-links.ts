import type { ArchiveSource } from "@/lib/types";

export type RelatedSource = ArchiveSource & {
  relatedReason: string;
};

export function topicSlug(topic: string) {
  return topic
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function topicHref(topic: string) {
  return `/topics/${topicSlug(topic)}`;
}

export function findTopicBySlug(sources: ArchiveSource[], slug: string) {
  const topics = unique(sources.flatMap((source) => source.tags));
  return topics.find((topic) => topicSlug(topic) === slug);
}

export function getTopicSources(sources: ArchiveSource[], topic: string) {
  return sources
    .filter((source) => source.tags.some((tag) => topicSlug(tag) === topicSlug(topic)))
    .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
}

export function getRelatedSources(source: ArchiveSource, sources: ArchiveSource[], limit = 5): RelatedSource[] {
  return sources
    .filter((candidate) => candidate.id !== source.id)
    .map((candidate) => {
      const sharedTags = intersection(source.tags, candidate.tags);
      const sharedPeople = intersection(source.people, candidate.people);
      const sharedSubstances = intersection(source.substances, candidate.substances);
      const sameCollection = Boolean(source.parentCollectionId && source.parentCollectionId === candidate.parentCollectionId);
      const sameEra = source.era === candidate.era;
      const sameType = source.type === candidate.type;
      const score =
        sharedPeople.length * 5 +
        sharedTags.length * 4 +
        sharedSubstances.length * 4 +
        (sameCollection ? 6 : 0) +
        (sameEra ? 1 : 0) +
        (sameType ? 1 : 0);

      return {
        ...candidate,
        relatedReason: relatedReason({ sharedPeople, sharedTags, sharedSubstances, sameCollection, sameEra }),
        score
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.year - b.year || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ score: _score, ...source }) => source);
}

function relatedReason({
  sharedPeople,
  sharedTags,
  sharedSubstances,
  sameCollection,
  sameEra
}: {
  sharedPeople: string[];
  sharedTags: string[];
  sharedSubstances: string[];
  sameCollection: boolean;
  sameEra: boolean;
}) {
  if (sameCollection) return "Same collection";
  if (sharedPeople.length) return `Shared people: ${sharedPeople.slice(0, 2).join(", ")}`;
  if (sharedTags.length) return `Shared topics: ${sharedTags.slice(0, 2).join(", ")}`;
  if (sharedSubstances.length) return `Shared substances: ${sharedSubstances.slice(0, 2).join(", ")}`;
  if (sameEra) return "Same era";
  return "Related source";
}

function intersection(a: string[] = [], b: string[] = []) {
  const bSet = new Set(b.map((value) => value.toLowerCase()));
  return unique(a.filter((value) => bSet.has(value.toLowerCase())));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
