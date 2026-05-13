import type { ArchiveSource } from "@/lib/types";

export type ArchiveSearchParams = {
  q?: string;
  era?: string;
  medium?: string;
  tag?: string;
  type?: string;
  region?: string;
  people?: string;
  access?: string;
  sort?: string;
  view?: string;
};

export function filterArchiveSources(items: ArchiveSource[], params: ArchiveSearchParams): ArchiveSource[] {
  const query = normalize(params.q);
  const era = normalize(params.era);
  const medium = normalize(params.medium);
  const tag = normalize(params.tag);
  const type = normalize(params.type);
  const region = normalize(params.region);
  const people = normalize(params.people);
  const access = normalize(params.access);

  const filtered = items.filter((source) => {
    const haystack = normalize([
      source.title,
      source.author,
      source.summary,
      source.excerpt,
      source.type,
      source.medium,
      source.region,
      source.language,
      ...source.tags,
      ...source.people,
      ...source.substances
    ].join(" "));

    return (
      (!query || haystack.includes(query)) &&
      (!era || normalize(source.era) === era) &&
      (!medium || normalize(source.medium) === medium) &&
      (!tag || source.tags.some((value) => normalize(value) === tag)) &&
      (!type || normalize(source.type) === type) &&
      (!region || normalize(source.region) === region) &&
      (!people || source.people.some((value) => normalize(value).includes(people))) &&
      (!access || normalize(source.accessType) === access)
    );
  });

  return filtered.sort((a, b) => {
    if (params.sort === "newest") return b.year - a.year;
    if (params.sort === "title") return a.title.localeCompare(b.title);
    return a.year - b.year;
  });
}

export function getFacetCounts(items: ArchiveSource[]) {
  return {
    eras: countBy(items, (item) => item.era),
    mediums: countBy(items, (item) => item.medium),
    types: countBy(items, (item) => item.type),
    regions: countBy(items, (item) => item.region),
    people: countByMany(items, (item) => item.people),
    tags: countByMany(items, (item) => item.tags),
    access: countBy(items, (item) => item.accessType)
  };
}

function countBy<T extends string>(items: ArchiveSource[], fn: (item: ArchiveSource) => T) {
  return items.reduce<Record<T, number>>((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function countByMany<T extends string>(items: ArchiveSource[], fn: (item: ArchiveSource) => T[]) {
  return items.reduce<Record<T, number>>((acc, item) => {
    fn(item).forEach((key) => {
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {} as Record<T, number>);
}

function normalize(value?: string) {
  return decodeURIComponent(value ?? "")
    .toLowerCase()
    .trim();
}
