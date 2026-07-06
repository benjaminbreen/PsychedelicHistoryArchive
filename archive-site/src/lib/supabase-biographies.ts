import { getStoragePublicUrl, getSupabaseClient } from "@/lib/supabase";
import { BIBLIOGRAPHY_SELECT, rowToBibliographyItem, type BibliographyRow } from "@/lib/bibliography";
import type { BiographyBibliographyLink, BiographyProfile } from "@/lib/biographies";

type BiographyProfileRow = {
  id: string;
  slug: string;
  name: string;
  years: string | null;
  dek: string | null;
  body_markdown: string | null;
  birth_date: string | null;
  birth_year: number | null;
  birth_place: string | null;
  death_date: string | null;
  death_year: number | null;
  death_place: string | null;
  occupations: string[] | null;
  regions: string[] | null;
  known_for: string[] | null;
  affiliations: string[] | null;
  image_path: string | null;
  image_alt: string | null;
  image_caption: string | null;
  tags: string[] | null;
  facts: Array<{ label?: string; value?: string }> | null;
  source_notes: string[] | null;
  related_sources: string[] | null;
  publications: string[] | null;
  collaborators: string[] | null;
  status: string | null;
};

const PROFILE_SELECT = `
  id,
  slug,
  name,
  years,
  dek,
  body_markdown,
  birth_date,
  birth_year,
  birth_place,
  death_date,
  death_year,
  death_place,
  occupations,
  regions,
  known_for,
  affiliations,
  image_path,
  image_alt,
  image_caption,
  tags,
  facts,
  source_notes,
  related_sources,
  publications,
  collaborators,
  status
`;

export async function getPublishedBiographyProfile(slug: string): Promise<BiographyProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("biography_profiles")
    .select(PROFILE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (isMissingBiographySchema(error.message)) return null;
    console.warn("Supabase biography profile query failed.", error.message);
    return null;
  }

  if (!data) return null;
  const profile = rowToBiographyProfile(data as BiographyProfileRow);
  profile.bibliographyLinks = await getPublishedBiographyBibliographyLinks((data as BiographyProfileRow).id);
  return profile;
}

export function rowToBiographyProfile(row: BiographyProfileRow): BiographyProfile {
  const paragraphs = splitMarkdownParagraphs(row.body_markdown);

  return {
    name: row.name,
    slug: row.slug,
    years: row.years || undefined,
    dek: row.dek || undefined,
    bodyMarkdown: row.body_markdown || undefined,
    birthDate: row.birth_date || undefined,
    birthYear: row.birth_year || undefined,
    birthPlace: row.birth_place || undefined,
    deathDate: row.death_date || undefined,
    deathYear: row.death_year || undefined,
    deathPlace: row.death_place || undefined,
    occupations: row.occupations ?? undefined,
    regions: row.regions ?? undefined,
    knownFor: row.known_for ?? undefined,
    affiliations: row.affiliations ?? undefined,
    imagePath: publicImagePath(row.image_path),
    imageAlt: row.image_alt || row.name,
    imageCaption: row.image_caption || undefined,
    tags: row.tags ?? [],
    facts: buildDisplayFacts(row),
    paragraphs: paragraphs.length ? paragraphs : ["This biography is being prepared."],
    sourceNotes: row.source_notes ?? undefined,
    relatedSources: row.related_sources ?? undefined,
    publications: row.publications ?? undefined,
    collaborators: row.collaborators ?? undefined,
  };
}

export function biographyProfileToRow(profile: BiographyProfile, status = "published") {
  const structured = structuredFactsFromProfile(profile);
  return {
    slug: profile.slug,
    name: profile.name,
    years: profile.years ?? null,
    dek: profile.dek ?? null,
    body_markdown: profile.bodyMarkdown ?? profile.paragraphs.join("\n\n"),
    birth_date: profile.birthDate ?? structured.birthDate ?? null,
    birth_year: profile.birthYear ?? structured.birthYear ?? null,
    birth_place: profile.birthPlace ?? structured.birthPlace ?? null,
    death_date: profile.deathDate ?? structured.deathDate ?? null,
    death_year: profile.deathYear ?? structured.deathYear ?? null,
    death_place: profile.deathPlace ?? structured.deathPlace ?? null,
    occupations: profile.occupations ?? structured.occupations ?? [],
    regions: profile.regions ?? structured.regions ?? [],
    known_for: profile.knownFor ?? structured.knownFor ?? [],
    affiliations: profile.affiliations ?? structured.affiliations ?? [],
    image_path: profile.imagePath ?? null,
    image_alt: profile.imageAlt ?? null,
    image_caption: profile.imageCaption ?? null,
    tags: profile.tags ?? [],
    facts: customFacts(profile.facts ?? []),
    source_notes: profile.sourceNotes ?? [],
    related_sources: profile.relatedSources ?? [],
    publications: profile.publications ?? [],
    collaborators: profile.collaborators ?? [],
    status,
  };
}

function buildDisplayFacts(row: BiographyProfileRow) {
  const facts: Array<{ label: string; value: string }> = [];
  const born = joinLines([row.birth_date || row.birth_year?.toString(), row.birth_place]);
  const died = joinLines([row.death_date || row.death_year?.toString(), row.death_place]);
  if (born) facts.push({ label: "Born", value: born });
  if (died) facts.push({ label: "Died", value: died });
  if (row.occupations?.length) facts.push({ label: "Occupation", value: row.occupations.join("\n") });
  if (row.regions?.length) facts.push({ label: "Region", value: row.regions.join("\n") });
  if (row.known_for?.length) facts.push({ label: "Known for", value: row.known_for.join("\n") });
  if (row.affiliations?.length) facts.push({ label: "Affiliations", value: row.affiliations.join("\n") });
  return [...facts, ...customFacts(normalizeFacts(row.facts))];
}

function normalizeFacts(facts: BiographyProfileRow["facts"]) {
  if (!Array.isArray(facts)) return [];
  return facts
    .map((fact) => ({
      label: String(fact?.label ?? "").trim(),
      value: String(fact?.value ?? "").trim(),
    }))
    .filter((fact) => fact.label && fact.value);
}

function customFacts(facts: Array<{ label: string; value: string }>) {
  const standardLabels = new Set(["born", "died", "occupation", "occupations", "region", "regions", "known for", "affiliation", "affiliations"]);
  return facts.filter((fact) => !standardLabels.has(fact.label.trim().toLowerCase()));
}

function structuredFactsFromProfile(profile: BiographyProfile) {
  const structured: {
    birthDate?: string;
    birthYear?: number;
    birthPlace?: string;
    deathDate?: string;
    deathYear?: number;
    deathPlace?: string;
    occupations?: string[];
    regions?: string[];
    knownFor?: string[];
    affiliations?: string[];
  } = {};

  for (const fact of profile.facts ?? []) {
    const label = fact.label.trim().toLowerCase();
    const lines = fact.value.split("\n").map((line) => line.trim()).filter(Boolean);
    if (label === "born") {
      structured.birthDate = lines[0];
      structured.birthYear = firstYear(lines[0]);
      structured.birthPlace = lines.slice(1).join("\n") || undefined;
    }
    if (label === "died") {
      structured.deathDate = lines[0];
      structured.deathYear = firstYear(lines[0]);
      structured.deathPlace = lines.slice(1).join("\n") || undefined;
    }
    if (label === "occupation" || label === "occupations") structured.occupations = splitList(fact.value);
    if (label === "region" || label === "regions") structured.regions = splitList(fact.value);
    if (label === "known for") structured.knownFor = splitList(fact.value);
    if (label === "affiliation" || label === "affiliations" || label === "institution") structured.affiliations = splitList(fact.value);
  }

  return structured;
}

function splitList(value: string) {
  return value.split(/\n|;/).flatMap((part) => part.split(/,\s+(?=[A-Z])/)).map((part) => part.trim()).filter(Boolean);
}

function firstYear(value?: string) {
  const match = value?.match(/\b(\d{3,4})\b/);
  return match ? Number(match[1]) : undefined;
}

function joinLines(values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).filter(Boolean).join("\n");
}

function publicImagePath(path?: string | null) {
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return getStoragePublicUrl(path);
}

async function getPublishedBiographyBibliographyLinks(profileId: string): Promise<BiographyBibliographyLink[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("biography_bibliography_items")
    .select(`
      relationship_type,
      position,
      editorial_note,
      bibliography_item:bibliography_items(${BIBLIOGRAPHY_SELECT})
    `)
    .eq("biography_profile_id", profileId)
    .order("relationship_type", { ascending: true })
    .order("position", { ascending: true, nullsFirst: false });

  if (error) {
    if (isMissingBiographySchema(error.message)) return [];
    console.warn("Supabase biography bibliography query failed.", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const bibliographyRow = firstRelated(row.bibliography_item as BibliographyRow | BibliographyRow[] | null);
      if (!bibliographyRow) return undefined;
      const item = rowToBibliographyItem(bibliographyRow);
      if (item.status !== "published" || item.recommendationStatus === "exclude") return undefined;
      return {
        relationshipType: String(row.relationship_type || "recommended_reading"),
        editorialNote: row.editorial_note || undefined,
        item,
      };
    })
    .filter(Boolean) as BiographyBibliographyLink[];
}

function firstRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

function splitMarkdownParagraphs(markdown?: string | null) {
  return (markdown ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function isMissingBiographySchema(message = "") {
  return (
    message.includes("biography_profiles") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}
