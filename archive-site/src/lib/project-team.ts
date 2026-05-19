import { existsSync } from "node:fs";
import path from "node:path";
import { getStoragePublicUrl, getSupabaseClient } from "@/lib/supabase";

export type ProjectPersonGroup = "team" | "advisory_board" | "past_contributor";

export type ProjectPerson = {
  id?: string;
  slug: string;
  name: string;
  group: ProjectPersonGroup;
  roleTitle: string;
  affiliation?: string;
  bio: string;
  portraitPath?: string;
  portraitHoverPath?: string;
  portraitAlt?: string;
  profileUrl?: string;
  sortOrder: number;
};

type ProjectPersonRow = {
  id: string;
  slug: string;
  display_name: string;
  group_key: ProjectPersonGroup;
  role_title: string | null;
  affiliation: string | null;
  bio: string | null;
  portrait_path: string | null;
  portrait_alt: string | null;
  profile_url: string | null;
  sort_order: number | null;
};

export const fallbackProjectPeople: ProjectPerson[] = [
  {
    slug: "benjamin-breen",
    name: "Benjamin Breen",
    group: "team",
    roleTitle: "Project team",
    affiliation: "UC Santa Cruz",
    bio: "",
    profileUrl: "https://benjaminpbreen.com",
    sortOrder: 10
  },
  {
    slug: "paul-gillis-smith",
    name: "Paul Gillis-Smith",
    group: "team",
    roleTitle: "Project team",
    bio: "",
    sortOrder: 20
  },
  {
    slug: "anne-harrington",
    name: "Anne Harrington",
    group: "team",
    roleTitle: "Project team",
    affiliation: "Harvard University",
    bio: "",
    sortOrder: 30
  },
  {
    slug: "rebecca-lemov",
    name: "Rebecca Lemov",
    group: "team",
    roleTitle: "Project team",
    affiliation: "Harvard University",
    bio: "",
    sortOrder: 40
  },
  {
    slug: "erik-davis",
    name: "Erik Davis",
    group: "advisory_board",
    roleTitle: "Advisory board",
    bio: "",
    sortOrder: 110
  },
  {
    slug: "alexis-turner",
    name: "Alexis Turner",
    group: "advisory_board",
    roleTitle: "Advisory board",
    bio: "",
    sortOrder: 120
  },
  {
    slug: "dagny-hatch",
    name: "Dagny Hatch",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 210
  },
  {
    slug: "galen-latham-fairchild",
    name: "Galen Latham-Fairchild",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 220
  },
  {
    slug: "molly-maher",
    name: "Molly Maher",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 230
  },
  {
    slug: "jamie-penilla",
    name: "Jamie Penilla",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 240
  },
  {
    slug: "emily-vasquez",
    name: "Emily Vasquez",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 250
  },
  {
    slug: "richard-wolf",
    name: "Richard Wolf",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 260
  },
  {
    slug: "walter-barnaby",
    name: "Walter Barnaby",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 270
  },
  {
    slug: "owen-casey",
    name: "Owen Casey",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 280
  },
  {
    slug: "francisco-moreno",
    name: "Francisco Moreno",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 290
  },
  {
    slug: "alia-moore",
    name: "Alia Moore",
    group: "past_contributor",
    roleTitle: "2024 UCSC student intern",
    bio: "",
    sortOrder: 300
  }
];

export async function listProjectPeople() {
  const supabase = getSupabaseClient();
  if (!supabase) return fallbackProjectPeople.map(withLocalPortrait);

  const { data, error } = await supabase
    .from("project_people")
    .select("id, slug, display_name, group_key, role_title, affiliation, bio, portrait_path, portrait_alt, profile_url, sort_order")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) return fallbackProjectPeople.map(withLocalPortrait);

  const rows = (data as ProjectPersonRow[] | null)?.map(projectPersonFromRow) ?? [];
  const merged = new Map<string, ProjectPerson>();

  for (const person of fallbackProjectPeople) merged.set(person.slug, person);
  for (const person of rows) merged.set(person.slug, person);

  return [...merged.values()]
    .map(withLocalPortrait)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function projectPersonFromRow(row: ProjectPersonRow): ProjectPerson {
  return {
    id: row.id,
    slug: row.slug,
    name: row.display_name,
    group: row.group_key,
    roleTitle: row.role_title || "Project contributor",
    affiliation: row.affiliation || undefined,
    bio: row.bio || "",
    portraitPath: getStoragePublicUrl(row.portrait_path),
    portraitAlt: row.portrait_alt || row.display_name,
    profileUrl: row.profile_url || undefined,
    sortOrder: row.sort_order ?? 100
  };
}

function withLocalPortrait(person: ProjectPerson): ProjectPerson {
  const localPath = findLocalPortraitPath(person);
  const localHoverPath = findLocalPortraitPath(person, "hover");

  return {
    ...person,
    portraitPath: localPath || person.portraitPath,
    portraitHoverPath: localHoverPath,
    portraitAlt: person.portraitAlt || `Portrait of ${person.name}`
  };
}

function findLocalPortraitPath(person: ProjectPerson, variant: "default" | "hover" = "default") {
  const publicDir = path.join(process.cwd(), "public");
  const filenames = portraitFilenameCandidates(person, variant);

  for (const filename of filenames) {
    const relativePath = `/images/project-team/${filename}`;
    if (existsSync(path.join(publicDir, relativePath))) return relativePath;
  }

  return undefined;
}

function portraitFilenameCandidates(person: ProjectPerson, variant: "default" | "hover" = "default") {
  const baseNames = new Set<string>([
    person.slug,
    person.slug.replace(/^benjamin-/, ""),
    person.slug.replace(/^anne-/, ""),
    person.slug.replace(/^rebecca-/, ""),
    person.slug.replace(/^erik-/, ""),
    person.slug.replace(/^alexis-/, ""),
    person.slug.replace(/^paul-/, ""),
    person.name.split(/\s+/).at(-1)?.toLowerCase().replace(/[^a-z0-9-]/g, "") || ""
  ]);
  const extensions = ["png", "jpg", "jpeg", "webp", "avif"];

  return [...baseNames]
    .filter(Boolean)
    .flatMap((baseName) => extensions.map((extension) => `${baseName}${variant === "hover" ? "-hover" : ""}.${extension}`));
}
