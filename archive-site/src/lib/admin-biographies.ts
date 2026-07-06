import { biographyProfiles, findBiographyProfile, type BiographyProfile } from "@/lib/biographies";
import { biographyProfileToRow, rowToBiographyProfile } from "@/lib/supabase-biographies";
import { getAdminSupabaseClient, isAdminEnabled, isSchemaShapeError } from "@/lib/admin-cms";
import type { AdminBibliographyItem } from "@/lib/admin-bibliography";

export type AdminBiographyProfile = Omit<BiographyProfile, "bibliographyLinks"> & {
  id: string;
  status: string;
  storage: "database" | "static";
  updatedAt?: string | null;
  bibliographyLinks?: AdminBiographyBibliographyLink[];
};

export type AdminBiographyBibliographyLink = {
  biography_profile_id: string;
  bibliography_item_id: string;
  relationship_type: string;
  position: number | null;
  editorial_note: string | null;
  bibliography_item: Pick<AdminBibliographyItem, "id" | "slug" | "item_type" | "title" | "publication_title" | "year" | "status"> | Array<Pick<AdminBibliographyItem, "id" | "slug" | "item_type" | "title" | "publication_title" | "year" | "status">> | null;
};

type AdminBiographyRow = {
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
  updated_at: string | null;
};

export const ADMIN_BIOGRAPHY_SELECT = `
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
  status,
  updated_at
`;

export async function listAdminBiographyProfiles(): Promise<AdminBiographyProfile[]> {
  const databaseProfiles = await listDatabaseBiographyProfiles();
  const databaseSlugs = new Set(databaseProfiles.map((profile) => profile.slug));
  const staticProfiles = biographyProfiles
    .filter((profile) => !databaseSlugs.has(profile.slug))
    .map(staticProfileToAdminProfile);

  return [...databaseProfiles, ...staticProfiles].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAdminBiographyProfile(idOrSlug: string): Promise<AdminBiographyProfile | null> {
  if (!isAdminEnabled) return null;
  const supabase = getAdminSupabaseClient();

  if (supabase) {
    let query = supabase
      .from("biography_profiles")
      .select(ADMIN_BIOGRAPHY_SELECT);
    query = isUuid(idOrSlug) ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);
    const { data, error } = await query.maybeSingle();

    if (error && !isSchemaShapeError(error.message)) throw new Error(error.message);
    if (data) {
      const profile = rowToAdminProfile(data as AdminBiographyRow);
      profile.bibliographyLinks = await listBiographyBibliographyLinks(profile.id);
      return profile;
    }
  }

  const staticProfile = findBiographyProfile(idOrSlug);
  return staticProfile ? staticProfileToAdminProfile(staticProfile) : null;
}

export function profileFormDefaults(profile: Omit<BiographyProfile, "bibliographyLinks">) {
  const structured = structuredFactsFromProfile(profile);
  return {
    ...biographyProfileToRow(profile, "draft"),
    birth_date: profile.birthDate ?? structured.birthDate ?? "",
    birth_year: profile.birthYear?.toString() ?? structured.birthYear?.toString() ?? "",
    birth_place: profile.birthPlace ?? structured.birthPlace ?? "",
    death_date: profile.deathDate ?? structured.deathDate ?? "",
    death_year: profile.deathYear?.toString() ?? structured.deathYear?.toString() ?? "",
    death_place: profile.deathPlace ?? structured.deathPlace ?? "",
    occupations_text: (profile.occupations ?? structured.occupations ?? []).join("\n"),
    regions_text: (profile.regions ?? structured.regions ?? []).join("\n"),
    known_for_text: (profile.knownFor ?? structured.knownFor ?? []).join("\n"),
    affiliations_text: (profile.affiliations ?? structured.affiliations ?? []).join("\n"),
    custom_facts_text: factsToText(customFacts(profile.facts)),
    tags_text: (profile.tags ?? []).join("\n"),
    source_notes_text: (profile.sourceNotes ?? []).join("\n"),
    related_sources_text: (profile.relatedSources ?? []).join("\n"),
    publications_text: (profile.publications ?? []).join("\n"),
    collaborators_text: (profile.collaborators ?? []).join("\n"),
  };
}

function rowToAdminProfile(row: AdminBiographyRow): AdminBiographyProfile {
  const profile = withoutPublicBiographyLinks(rowToBiographyProfile(row));
  return {
    ...profile,
    id: row.id,
    status: row.status || "draft",
    storage: "database",
    updatedAt: row.updated_at,
  };
}

function staticProfileToAdminProfile(profile: BiographyProfile): AdminBiographyProfile {
  const adminProfile = withoutPublicBiographyLinks(profile);
  return {
    ...adminProfile,
    id: profile.slug,
    bodyMarkdown: profile.bodyMarkdown ?? profile.paragraphs.join("\n\n"),
    status: "static",
    storage: "static",
  };
}

function withoutPublicBiographyLinks(profile: BiographyProfile): Omit<BiographyProfile, "bibliographyLinks"> {
  const clone: BiographyProfile = { ...profile };
  delete clone.bibliographyLinks;
  return clone;
}

async function listDatabaseBiographyProfiles() {
  if (!isAdminEnabled) return [];
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("biography_profiles")
    .select(ADMIN_BIOGRAPHY_SELECT)
    .order("name", { ascending: true });

  if (error) {
    if (isSchemaShapeError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => rowToAdminProfile(row as AdminBiographyRow));
}

export async function listBiographyBibliographyLinks(profileId: string): Promise<AdminBiographyBibliographyLink[]> {
  if (!isAdminEnabled) return [];
  const supabase = getAdminSupabaseClient();
  if (!supabase || !isUuid(profileId)) return [];

  const { data, error } = await supabase
    .from("biography_bibliography_items")
    .select(`
      biography_profile_id,
      bibliography_item_id,
      relationship_type,
      position,
      editorial_note,
      bibliography_item:bibliography_items(id, slug, item_type, title, publication_title, year, status)
    `)
    .eq("biography_profile_id", profileId)
    .order("relationship_type", { ascending: true })
    .order("position", { ascending: true, nullsFirst: false });

  if (error) {
    if (isSchemaShapeError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as AdminBiographyBibliographyLink[];
}

function factsToText(facts: BiographyProfile["facts"]) {
  return (facts ?? [])
    .map((fact) => `${fact.label}: ${fact.value.replace(/\n/g, "\\n")}`)
    .join("\n");
}

function customFacts(facts: BiographyProfile["facts"] = []) {
  const standardLabels = new Set(["born", "died", "occupation", "occupations", "region", "regions", "known for", "affiliation", "affiliations", "institution"]);
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
