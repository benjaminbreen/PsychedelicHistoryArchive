import type { ArchiveSource } from "@/lib/types";

// The editor works on one document, rather than exposing database tables as forms.
export type Fields = Record<string, string | number | boolean | null>;
export type Section = { id: string; heading: string; section_type: string; body: string; body_format: string; position: number };
export type Figure = { id: string; image_path: string; caption: string; credit: string; alt_text: string; token: string; position: number; placement: string };
export type Asset = { id: string; kind: string; storage_path: string; mime_type: string; byte_size: number; name?: string; private?: boolean };
export type Person = { id?: string; name: string; role: string };
export type Membership = { collection_id: string; position: number | null; sequence_number: number | null; sequence_label: string | null; issue_date: string | null; editorial_caption: string | null };
export type SourceEditModel = { document: Fields; sections: Section[]; figures: Figure[]; files: Asset[]; people: Person[]; tagIds: string[]; collections: Membership[]; editorNotes?: string };
export type SourceRecord = { id: string; slug: string; status: string; liveUpdatedAt: string; version: number; savedAt: string | null; savedBy: string | null; model: SourceEditModel; reader: ArchiveSource; revisions: Revision[]; featured: boolean };
export type Revision = { id: string; created_at: string; change_note: string | null; after_data: SourceEditModel | null };
export type SourceListItem = { id: string; slug: string; title: string; date: string; creator: string; medium: string; status: string; hasChanges: boolean; updatedAt: string };
export type Choices = { people: { id: string; name: string }[]; tags: { id: string; name: string }[]; collections: { id: string; title: string }[] };

export const editableFields = ["title", "short_title", "subtitle", "display_date", "date_start", "date_end", "document_type", "medium", "language", "content_language", "region", "publisher", "publication_title", "summary", "abstract", "citation", "rights_statement", "source_url", "external_access_url", "access_type", "hosting_status", "source_kind", "parent_collection_id", "sequence_label", "sequence_number", "issue_date", "reader_mode", "media_embed_url", "cover_image_path", "thumbnail_path", "translation_text", "translation_language", "translation_provider", "translation_note"] as const;
const numericFields = new Set(["date_start", "date_end", "sequence_number"]);
const urlFields = ["source_url", "external_access_url", "media_embed_url"];
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function emptySource(title: string, url = ""): SourceEditModel {
  return { document: { title, source_url: url, medium: "Text", document_type: "Source", source_kind: "single", access_type: url ? "external" : "hosted", hosting_status: url ? "external_link" : "transcript_only" }, sections: [], figures: [], files: [], people: [], tagIds: [], collections: [] };
}

export function validateModel(input: SourceEditModel): SourceEditModel {
  if (!input || !input.document || !Array.isArray(input.sections) || !Array.isArray(input.figures) || !Array.isArray(input.files) || !Array.isArray(input.people) || !Array.isArray(input.tagIds) || !Array.isArray(input.collections)) throw new Error("This draft could not be read. Reload the source and try again.");
  if (JSON.stringify(input).length > 8_000_000) throw new Error("This text is too large for one source. Split it into issues or parts.");
  const document: Fields = {};
  for (const key of editableFields) {
    const value = input.document[key];
    if (value === undefined) continue;
    if (numericFields.has(key)) {
      if (value !== null && value !== "" && (!Number.isSafeInteger(Number(value)) || Math.abs(Number(value)) > 100_000)) throw new Error("Use a whole number for years and ordering.");
      document[key] = value === "" || value === null ? null : Number(value);
    } else {
      if (value !== null && typeof value !== "string") throw new Error(`Invalid value for ${key}.`);
      document[key] = value;
    }
  }
  if (String(document.title || "").length > 600) throw new Error("Keep the source title under 600 characters.");
  for (const key of urlFields) if (document[key]) {
    let url: URL;
    try { url = new URL(String(document[key])); } catch { continue; /* Incomplete links can be saved in private drafts. */ }
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("Source links must begin with https:// or http://.");
  }
  const checkIds = (rows: { id: string }[]) => {
    if (rows.some(row => !uuidPattern.test(row.id)) || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error("A source part has an invalid or repeated identifier.");
  };
  checkIds(input.sections); checkIds(input.figures); checkIds(input.files);
  if (input.sections.length > 200 || input.figures.length > 200 || input.files.length > 200) throw new Error("Split this source into smaller parts before adding more items.");
  if (input.tagIds.some(id => !uuidPattern.test(id)) || input.people.some(p => (p.id && !uuidPattern.test(p.id)) || !p.name.trim() || !/^[\w -]{1,40}$/.test(p.role)) || input.collections.some(c => !uuidPattern.test(c.collection_id))) throw new Error("One of the people, topics, or collections could not be saved.");
  for (const section of input.sections) if (typeof section.body !== "string" || !["plain", "markdown"].includes(section.body_format) || typeof section.heading !== "string" || !/^[\w -]{1,40}$/.test(section.section_type)) throw new Error("One of the text sections could not be saved.");
  for (const file of input.files) {
    if (!file.storage_path || file.storage_path.includes("..") || file.storage_path.startsWith("/") || /[\\\u0000]/.test(file.storage_path)) throw new Error("Invalid file path.");
    if (file.private !== undefined && typeof file.private !== "boolean") throw new Error("Invalid file visibility.");
    if (file.mime_type && !/^(image\/(jpeg|png|gif|webp)|application\/(pdf|octet-stream)|audio\/[\w.+-]+|video\/[\w.+-]+|text\/plain)$/.test(file.mime_type)) throw new Error("This file type cannot be attached here.");
  }
  return { ...input, document, sections: input.sections.map((s, i) => ({ ...s, position: (i + 1) * 10 })), figures: input.figures.map((f, i) => ({ ...f, position: (i + 1) * 10 })), tagIds: [...new Set(input.tagIds)] };
}

export function publicationProblems(model: SourceEditModel): string[] {
  const problems: string[] = [];
  if (!String(model.document.title || "").trim()) problems.push("Add a title.");
  for (const key of urlFields) if (model.document[key]) { try { const url = new URL(String(model.document[key])); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); } catch { problems.push("Complete each source link, beginning with https:// or http://."); } }
  if (!String(model.document.source_url || model.document.citation || "").trim()) problems.push("Add the original source link or a citation so readers can trace this item.");
  if (!model.sections.some(s => s.body.trim()) && !model.files.length && !model.document.source_url && !model.document.media_embed_url && !model.document.translation_text) problems.push("Add reading text, a file, or an original source link.");
  if (model.figures.some(f => !f.alt_text.trim())) problems.push("Add a short image description to each figure.");
  const tokens = new Set(model.figures.flatMap(f => [f.id, f.token]));
  for (const section of model.sections) for (const match of section.body.matchAll(/{{\s*(?:figure|figure-row|figures|gallery):([^}]+)}}/gi)) {
    if (match[1].split(",").some(token => !tokens.has(token.trim()))) problems.push("A text section refers to an image that is missing. Reinsert the image or remove its reference.");
  }
  return [...new Set(problems)];
}

export function slugify(title: string) { return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || "source"; }
