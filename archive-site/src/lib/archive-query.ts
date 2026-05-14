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
  page?: string;
  yearStart?: string;
  yearEnd?: string;
};

export function filterArchiveSources(items: ArchiveSource[], params: ArchiveSearchParams): ArchiveSource[] {
  const queryTerms = getQueryTerms(params.q);
  const era = normalize(params.era);
  const medium = normalize(params.medium);
  const tag = normalize(params.tag);
  const type = normalize(params.type);
  const region = normalize(params.region);
  const people = normalize(params.people);
  const access = normalize(params.access);
  const yearStart = parseYearParam(params.yearStart);
  const yearEnd = parseYearParam(params.yearEnd);

  const filtered = items.filter((source) => {
    const haystack = normalize([
      source.title,
      source.shortTitle,
      source.subtitle,
      source.author,
      source.summary,
      source.excerpt,
      source.citation,
      source.publicationTitle,
      source.type,
      source.medium,
      source.region,
      source.language,
      ...source.tags,
      ...(source.legacyTags ?? []),
      ...source.people,
      ...(source.creators?.map((creator) => `${creator.name} ${creator.role}`) ?? []),
      ...source.substances,
      source.transcript,
      ...(source.transcriptSections ?? []).flatMap((section) => [
        section.heading,
        ...section.paragraphs
      ]),
      ...(source.pages ?? []).flatMap((page) => [
        page.label,
        page.ocrText,
        ...page.lines.map((line) => line.text)
      ])
    ].join(" "));

    return (
      (queryTerms.length === 0 || queryTerms.every((term) => haystack.includes(term))) &&
      (!era || normalize(source.era) === era) &&
      (!medium || normalize(source.medium) === medium) &&
      (!tag || source.tags.some((value) => normalize(value) === tag)) &&
      (!type || normalize(source.type) === type) &&
      (!region || normalize(source.region) === region) &&
      (!people || source.people.some((value) => normalize(value).includes(people))) &&
      (!access || normalize(source.accessType) === access) &&
      (yearStart === undefined || source.year >= yearStart) &&
      (yearEnd === undefined || source.year <= yearEnd)
    );
  });

  return filtered.sort((a, b) => {
    if (params.sort === "newest") return b.year - a.year;
    if (params.sort === "title") return a.title.localeCompare(b.title);
    return a.year - b.year;
  });
}

function parseYearParam(value?: string) {
  if (!value) return undefined;
  const year = Number.parseInt(value, 10);
  return Number.isFinite(year) ? year : undefined;
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
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getQueryTerms(value?: string) {
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean);
}
