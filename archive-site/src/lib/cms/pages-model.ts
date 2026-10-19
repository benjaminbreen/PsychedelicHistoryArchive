export type PageKind = "collection" | "topic" | "biography" | "bibliography";
export type PageFields = Record<string, string | number | boolean | null | string[] | unknown[]>;
export type PageModel = { fields: PageFields; sources: Record<string, unknown>[]; contributors?: { id?: string; name: string; role: string }[] };
export type EditorialPage = { id: string; kind: PageKind; slug: string; status: string; version: number; dirty: boolean; updatedAt: string; model: PageModel; published: PageModel | null };
export type PageField = { key: string; label: string; type?: "number" | "lines" | "long" };
export const pageKinds = {
  collection: { table: "collections", route: "collections", label: "Collections", singular: "collection", title: "title", intro: "summary", body: "body", fields: [{ key: "subtitle", label: "Subtitle" }, { key: "cover_image_path", label: "Cover image path" }] as PageField[] },
  topic: { table: "topics", route: "topics", label: "Topics", singular: "topic", title: "name", intro: "dek", body: "body_markdown", fields: [{ key: "icon", label: "Icon" }, { key: "sort_order", label: "Display order", type: "number" }, { key: "seo_title", label: "Search engine title" }, { key: "seo_description", label: "Search engine description", type: "long" }] as PageField[] },
  biography: { table: "biography_profiles", route: "biographies", label: "People", singular: "biography", title: "name", intro: "dek", body: "body_markdown", fields: [{ key: "author_name", label: "Written by" }, { key: "author_slug", label: "Writer's team-page slug" }, { key: "years", label: "Life dates" }, { key: "birth_date", label: "Birth date" }, { key: "birth_year", label: "Birth year", type: "number" }, { key: "birth_place", label: "Birthplace" }, { key: "death_date", label: "Death date" }, { key: "death_year", label: "Death year", type: "number" }, { key: "death_place", label: "Place of death" }, ...["occupations", "regions", "known_for", "affiliations", "tags", "source_notes", "related_sources", "publications", "collaborators"].map(key => ({ key, label: ({ known_for: "Known for", source_notes: "Notes & references", related_sources: "Related source slugs" } as Record<string, string>)[key] || key[0].toUpperCase() + key.slice(1), type: "lines" as const })), { key: "image_path", label: "Portrait image path" }, { key: "image_alt", label: "Portrait description" }, { key: "image_caption", label: "Portrait caption / credit" }] as PageField[] },
  bibliography: { table: "bibliography_items", route: "bibliography", label: "Further reading", singular: "bibliography item", title: "title", intro: "abstract", body: "editorial_note", fields: [{ key: "item_type", label: "Publication type" }, { key: "year", label: "Year", type: "number" }, ...[["subtitle", "Subtitle"], ["publication_title", "Journal / publication"], ["publisher", "Publisher"], ["publication_place", "Publication place"], ["volume", "Volume"], ["issue", "Issue"], ["pages", "Pages"], ["doi", "DOI"], ["isbn", "ISBN"], ["oclc", "OCLC"], ["publisher_url", "Publisher link"], ["open_access_url", "Open access link"], ["pdf_url", "PDF link"], ["jstor_url", "JSTOR link"], ["google_books_url", "Google Books link"], ["worldcat_url", "WorldCat link"], ["reliability_note", "Note on the work"]].map(([key, label]) => ({ key, label }))] as PageField[] }
} as const;
export function isPageKind(value: string): value is PageKind { return Object.hasOwn(pageKinds, value); }
export function validatePage(kind: PageKind, model: PageModel): PageModel {
  const config = pageKinds[kind];
  if (!model?.fields || !Array.isArray(model.sources) || JSON.stringify(model).length > 4_000_000) throw new Error("This page could not be saved.");
  const fields: PageFields = {};
  for (const field of [{ key: config.title }, { key: config.intro }, { key: config.body }, ...config.fields]) {
    const value = model.fields[field.key]; if (value === undefined) continue;
    if ("type" in field && field.type === "number") {
      if (value !== null && value !== "" && !Number.isSafeInteger(Number(value))) throw new Error(`Use a whole number for ${field.label.toLowerCase()}.`);
      fields[field.key] = value === null || value === "" ? null : Number(value);
    } else if ("type" in field && field.type === "lines") {
      if (!Array.isArray(value) || value.some(v => typeof v !== "string")) throw new Error(`Invalid ${field.label.toLowerCase()}.`);
      fields[field.key] = value;
    } else {
      if (value !== null && typeof value !== "string") throw new Error(`Invalid ${field.key}.`);
      if (field.key.endsWith("_url") && value && !/^https?:\/\//i.test(value)) throw new Error("Use complete links beginning with https:// or http://.");
      fields[field.key] = value;
    }
  }
  if (model.contributors?.some(p => !p.name.trim() || p.name.length > 300 || !["author", "editor", "translator"].includes(p.role))) throw new Error("Add a name and role for each contributor.");
  return { fields, sources: model.sources, ...(model.contributors ? { contributors: model.contributors } : {}) };
}
