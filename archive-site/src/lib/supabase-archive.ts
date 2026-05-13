import { sources as fallbackSources } from "@/lib/archive-data";
import { getStoragePublicUrl, getSupabaseClient } from "@/lib/supabase";
import type { AccessType, ArchiveSource, HostingStatus, SourceType } from "@/lib/types";

type DocumentRow = {
  id: string;
  slug: string;
  title: string;
  display_date: string | null;
  date_start: number | null;
  document_type: string | null;
  medium: ArchiveSource["medium"] | null;
  language: string | null;
  region: string | null;
  summary: string | null;
  abstract: string | null;
  citation: string | null;
  rights_statement: string | null;
  source_url: string | null;
  access_type: AccessType | null;
  hosting_status: HostingStatus | null;
  cover_image_path: string | null;
  thumbnail_path: string | null;
  is_featured: boolean | null;
  published_at: string | null;
  pages?: Array<{ ocr_text: string | null }>;
  files?: Array<{ storage_path: string | null; kind: string | null }>;
  document_tags?: Array<{ tags: RelatedTag | RelatedTag[] | null }>;
  document_people?: Array<{ role: string | null; people: RelatedPerson | RelatedPerson[] | null }>;
};

type RelatedTag = { name: string | null; tag_type: string | null };
type RelatedPerson = { name: string | null };

const DOCUMENT_SELECT = `
  id,
  slug,
  title,
  display_date,
  date_start,
  document_type,
  medium,
  language,
  region,
  summary,
  abstract,
  citation,
  rights_statement,
  source_url,
  access_type,
  hosting_status,
  cover_image_path,
  thumbnail_path,
  is_featured,
  published_at,
  pages(ocr_text),
  files(storage_path, kind),
  document_tags(tags(name, tag_type)),
  document_people(role, people(name))
`;

export async function getArchiveSourcesFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return fallbackSources;

  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("status", "published")
    .order("date_start", { ascending: true });

  if (error || !data) {
    console.warn("Supabase archive query failed; using fallback data.", error?.message);
    return fallbackSources;
  }

  return (data as unknown as DocumentRow[]).map(documentToArchiveSource);
}

export async function getArchiveSourceFromSupabase(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return fallbackSources.find((source) => source.slug === slug);

  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.warn("Supabase source query failed; using fallback data.", error.message);
    return fallbackSources.find((source) => source.slug === slug);
  }

  return data ? documentToArchiveSource(data as unknown as DocumentRow) : undefined;
}

function documentToArchiveSource(document: DocumentRow): ArchiveSource {
  const tags = unique(
    document.document_tags
      ?.map((item) => firstRelated(item.tags)?.name)
      .filter(Boolean) as string[] | undefined
  );
  const people = unique(
    document.document_people
      ?.map((item) => firstRelated(item.people)?.name)
      .filter(Boolean) as string[] | undefined
  );
  const substances = unique(
    document.document_tags
      ?.filter((item) => firstRelated(item.tags)?.tag_type === "substance")
      .map((item) => firstRelated(item.tags)?.name)
      .filter(Boolean) as string[] | undefined
  );
  const transcript = document.pages?.map((page) => page.ocr_text).filter(Boolean).join("\n\n") ?? "";
  const imagePath = document.thumbnail_path || document.cover_image_path || firstImagePath(document.files);
  const title = document.title;
  const year = document.date_start ?? yearFromDisplayDate(document.display_date) ?? 0;

  return {
    id: document.id,
    slug: document.slug,
    title,
    author: people[0] ?? "The Psychedelic History Archive",
    year,
    displayDate: document.display_date || (year ? String(year) : "Undated"),
    type: normalizeType(document.document_type),
    medium: normalizeMedium(document.medium),
    era: eraForYear(year),
    region: document.region || "Unknown",
    language: document.language || "English",
    tags,
    people,
    substances,
    summary: document.summary || document.abstract || "",
    excerpt: excerptFromTranscript(transcript, document.summary || ""),
    citation: document.citation || "",
    rights: document.rights_statement || "Needs rights review before republication.",
    sourceUrl: document.source_url || "#",
    accessType: document.access_type || "hosted",
    hostingStatus: document.hosting_status || "metadata_only",
    wordCount: wordCount(transcript),
    addedDate: document.published_at?.slice(0, 10) || "",
    featured: Boolean(document.is_featured),
    imageTone: imageToneForType(document.document_type),
    imagePath: getStoragePublicUrl(imagePath),
    imageAlt: title,
    transcript
  };
}

function firstImagePath(files?: DocumentRow["files"]) {
  return files?.find((file) => file.storage_path && file.kind === "cover_image")?.storage_path ?? "";
}

function unique(values: string[] = []) {
  return [...new Set(values.filter(Boolean))];
}

function firstRelated<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeType(value: string | null): SourceType {
  const type = value || "Source";
  if (type === "Film") return "Film";
  if (type === "Newspaper Article") return "Newspaper Article";
  if (type === "Manuscript") return "Manuscript";
  if (type === "Field Notes") return "Field Notes";
  if (type === "Testimony") return "Testimony";
  if (type === "Audio/Video") return "Audio/Video";
  if (type === "Academic Article") return "Academic Article";
  if (type === "Book") return "Book";
  return "Source";
}

function normalizeMedium(value: string | null): ArchiveSource["medium"] {
  if (value === "Image" || value === "Audio/Video" || value === "Personal History" || value === "Biography") {
    return value;
  }
  return "Text";
}

function eraForYear(year: number): ArchiveSource["era"] {
  if (year < 1800) return "Pre-1800";
  if (year < 1950) return "1800-1950";
  if (year < 1970) return "1950-1970";
  if (year < 2000) return "1970-2000";
  return "2000-Present";
}

function yearFromDisplayDate(value: string | null) {
  const match = value?.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : undefined;
}

function excerptFromTranscript(transcript: string, fallback: string) {
  const compact = (transcript || fallback).replace(/\s+/g, " ").trim();
  return compact.length > 320 ? `${compact.slice(0, 317)}...` : compact;
}

function wordCount(text: string) {
  return text.match(/\b\w+\b/g)?.length ?? 0;
}

function imageToneForType(type: string | null): ArchiveSource["imageTone"] {
  if (type === "Film") return "clinical";
  if (type === "Manuscript" || type === "Field Notes") return "letter";
  if (type === "Book" || type === "Newspaper Article") return "paper";
  return "paper";
}
