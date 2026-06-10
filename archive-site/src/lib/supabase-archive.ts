import { sources as fallbackSources } from "@/lib/archive-data";
import { getStoragePublicUrl, getSupabaseClient } from "@/lib/supabase";
import { getSourceTitleParts } from "@/lib/source-title";
import type { AccessType, ArchiveSource, CollectionItemSummary, HostingStatus, ReaderMode, SourceCitationLink, SourceCreator, SourceFigure, SourceFile, SourceKind, SourceLineBox, SourcePage, SourcePageLine, SourceType, TranscriptSection } from "@/lib/types";
import fs from "node:fs";
import path from "node:path";

type DocumentRow = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  subtitle: string | null;
  source_kind: SourceKind | null;
  parent_collection_id: string | null;
  sequence_label: string | null;
  sequence_number: number | null;
  issue_date: string | null;
  display_date: string | null;
  date_start: number | null;
  document_type: string | null;
  medium: ArchiveSource["medium"] | null;
  language: string | null;
  region: string | null;
  publisher: string | null;
  summary: string | null;
  abstract: string | null;
  publication_title: string | null;
  citation: string | null;
  rights_statement: string | null;
  source_url: string | null;
  content_language: string | null;
  translation_language: string | null;
  translation_text: string | null;
  translation_provider: ArchiveSource["translationProvider"] | null;
  translation_note: string | null;
  reader_mode: ReaderMode | null;
  media_embed_url: string | null;
  access_type: AccessType | null;
  hosting_status: HostingStatus | null;
  cover_image_path: string | null;
  thumbnail_path: string | null;
  is_featured: boolean | null;
  published_at: string | null;
  pages?: PageRow[];
  files?: FileRow[];
  document_sections?: DocumentSectionRow[];
  document_figures?: DocumentFigureRow[];
  document_citation_links?: DocumentCitationLinkRow[];
  document_tags?: Array<{ tags: RelatedTag | RelatedTag[] | null }>;
  document_people?: Array<{ role: string | null; people: RelatedPerson | RelatedPerson[] | null }>;
};

type RelatedTag = { name: string | null; tag_type: string | null; status?: string | null };
type RelatedPerson = { name: string | null };

type CollectionDocumentRow = {
  document_id?: string | null;
  position: number | null;
  sequence_label: string | null;
  sequence_number: number | null;
  issue_date: string | null;
  editorial_caption: string | null;
  document: (Partial<DocumentRow> & { pages?: Array<{ id: string }>; files?: FileRow[] }) | Array<Partial<DocumentRow> & { pages?: Array<{ id: string }>; files?: FileRow[] }> | null;
};

type CollectionRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  body: string | null;
  cover_image_path: string | null;
  collection_documents?: CollectionDocumentRow[];
};
const CORE_TOPIC_TAGS = [
  "Ayahuasca",
  "Cannabis",
  "DMT",
  "Kava",
  "LSD",
  "Nitrous Oxide",
  "Psilocybin",
  "Anesthesia",
  "Animal Research",
  "Anthropology",
  "Archaeology",
  "Architecture",
  "Chemistry",
  "Clinical",
  "Therapy",
  "Psychiatry",
  "Psychology",
  "Psychosis",
  "Psychoanalysis",
  "PTSD",
  "Consciousness",
  "Psychoactive Plants",
  "Residue Analysis",
  "Snuffing Paraphernalia",
  "Trade Networks",
  "ESP",
  "Mysticism",
  "Religion",
  "Philosophy",
  "Literature",
  "Poetry",
  "Counterculture",
  "Government Research",
  "Law",
  "Prohibition",
  "MKULTRA",
  "Military",
  "Intelligence",
  "Human Potential",
  "Indigenous Knowledge",
  "Ethnobotany",
  "Pharmacology",
  "Medicine",
  "Self-Experiment",
  "Trip Reports",
  "Oral History",
  "Visual Culture",
  "Material Culture",
  "Sound",
  "Networks"
] as const;

const CORE_TAG_SET = new Set<string>(CORE_TOPIC_TAGS);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPIC_TAG_MAP: Record<string, string> = {
  "5-meo-dmt": "DMT",
  "alcohol": "Pharmacology",
  "altered states": "Consciousness",
  "altered states of consciousness": "Consciousness",
  "anaesthesia": "Anesthesia",
  "anesthesia": "Anesthesia",
  "anaesthetic revelation": "Anesthesia",
  "anaesthetics": "Anesthesia",
  "anesthetics": "Anesthesia",
  "anesthetic revelation": "Anesthesia",
  "animal research": "Animal Research",
  "anthropology": "Anthropology",
  "archaeology": "Archaeology",
  "architecture": "Architecture",
  "ayahuasca": "Ayahuasca",
  "banisteriopsis caapi": "Ayahuasca",
  "bangue": "Cannabis",
  "bhang": "Cannabis",
  "cannabis": "Cannabis",
  "caapi": "Ayahuasca",
  "chemical research": "Chemistry",
  "chemistry": "Chemistry",
  "chloroform": "Anesthesia",
  "clinical research": "Clinical",
  "cocaine": "Pharmacology",
  "counterculture": "Counterculture",
  "dmt": "DMT",
  "dreams": "Consciousness",
  "early modern medicine": "Medicine",
  "epena": "DMT",
  "epená": "DMT",
  "esalen": "Networks",
  "esp": "ESP",
  "ether": "Anesthesia",
  "ethnobotany": "Ethnobotany",
  "ethnography": "Anthropology",
  "ethnopharmacology": "Pharmacology",
  "experimental science; self-experiment report": "Self-Experiment",
  "experimental science": "Clinical",
  "first person accounts": "Trip Reports",
  "government research": "Government Research",
  "harmala alkaloids": "Pharmacology",
  "harmaline": "Pharmacology",
  "harmine": "Pharmacology",
  "hemp": "Cannabis",
  "human experiments": "Clinical",
  "human potential": "Human Potential",
  "iconography": "Visual Culture",
  "indigenous knowledge": "Indigenous Knowledge",
  "john c. lilly": "Networks",
  "kava": "Kava",
  "kavalactones": "Kava",
  "literature": "Literature",
  "material culture": "Material Culture",
  "lsd": "LSD",
  "materia medica": "Medicine",
  "medical history": "Medicine",
  "medicine": "Medicine",
  "mental research institute": "Networks",
  "mkultra": "MKULTRA",
  "narcosynthesis": "Therapy",
  "nitrous oxide": "Nitrous Oxide",
  "nitrous oxide and ether": "Nitrous Oxide",
  "mysticism": "Mysticism",
  "oral history": "Oral History",
  "phytochemistry": "Chemistry",
  "pharmacology": "Pharmacology",
  "philosophy": "Philosophy",
  "psychoactive plants": "Psychoactive Plants",
  "residue analysis": "Residue Analysis",
  "piper methysticum": "Kava",
  "poetry": "Poetry",
  "ptsd": "PTSD",
  "psychedelic therapy": "Therapy",
  "psychoanalysis": "Psychoanalysis",
  "psychiatry": "Psychiatry",
  "psychology": "Psychology",
  "psychology of religion": "Religion",
  "psychosis": "Psychosis",
  "psychotomimetic": "Psychosis",
  "religion": "Religion",
  "self-experimentation": "Self-Experiment",
  "sound": "Sound",
  "snuffing paraphernalia": "Snuffing Paraphernalia",
  "therapy": "Therapy",
  "trade networks": "Trade Networks",
  "trial records": "Law",
  "trip reports": "Trip Reports",
  "virola": "DMT",
  "virola theiodora": "DMT",
  "visual culture": "Visual Culture"
};

const SUBSTANCE_TAG_MAP: Record<string, string> = {
  ayahuasca: "Ayahuasca",
  bufotenine: "Bufotenine",
  cannabis: "Cannabis",
  chloroform: "Chloroform",
  coca: "Coca",
  cocaine: "Cocaine",
  dmt: "DMT",
  ether: "Ether",
  harmine: "Harmine",
  ibogaine: "Ibogaine",
  ketamine: "Ketamine",
  lsd: "LSD",
  mdma: "MDMA",
  mescal: "Mescaline",
  mescaline: "Mescaline",
  "nitrous oxide": "Nitrous Oxide",
  "nitrous oxide and ether": "Nitrous Oxide",
  nicotiana: "Nicotiana",
  peyote: "Peyote",
  psilocybin: "Psilocybin",
  "san pedro": "San Pedro",
  anadenanthera: "Anadenanthera",
  vilca: "Vilca",
  yage: "Ayahuasca",
  yagé: "Ayahuasca"
};
type PageLineRow = {
  id: string;
  line_index: number | null;
  text: string | null;
  normalized_text: string | null;
  bbox: unknown;
  confidence: number | null;
  language: string | null;
  paragraph_index: number | null;
  transcription_status?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};
type PageRow = {
  id: string;
  page_number: number | null;
  label: string | null;
  readable_image_path: string | null;
  thumbnail_image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  language: string | null;
  ocr_text: string | null;
  ocr_confidence: number | null;
  transcription_status: string | null;
  transcription_reviewed_by?: string | null;
  transcription_reviewed_at?: string | null;
  transcription_note?: string | null;
  page_lines?: PageLineRow[];
};
type FileRow = {
  id: string;
  kind: string | null;
  storage_path: string | null;
  mime_type: string | null;
  byte_size: number | null;
};
type DocumentSectionRow = {
  id: string;
  position: number | null;
  heading: string | null;
  section_type: string | null;
  body: string | null;
  body_format?: string | null;
};
type DocumentFigureRow = {
  id: string;
  position: number | null;
  image_path: string | null;
  alt_text: string | null;
  caption: string | null;
  placement: string | null;
  section_id?: string | null;
  token?: string | null;
  credit?: string | null;
};

type DocumentCitationLinkRow = {
  citation_text: string | null;
  confidence: number | null;
  status: string | null;
  bibliography_item: RelatedBibliographyItem | RelatedBibliographyItem[] | null;
};

type RelatedBibliographyItem = {
  slug: string | null;
  title: string | null;
  year: number | null;
};

let localCitationLinkCache: Map<string, DocumentCitationLinkRow[]> | null | undefined;
const SUPABASE_QUERY_TIMEOUT_MS = 10_000;

const DOCUMENT_SELECT = `
  id,
  slug,
  title,
  short_title,
  subtitle,
  source_kind,
  parent_collection_id,
  sequence_label,
  sequence_number,
  issue_date,
  display_date,
  date_start,
  document_type,
  medium,
  language,
  region,
  publisher,
  summary,
  abstract,
  publication_title,
  citation,
  rights_statement,
  source_url,
  content_language,
  translation_language,
  translation_text,
  translation_provider,
  translation_note,
  reader_mode,
  media_embed_url,
  access_type,
  hosting_status,
  cover_image_path,
  thumbnail_path,
  is_featured,
  published_at,
  pages(*, page_lines(*)),
  files(id, storage_path, kind, mime_type, byte_size),
  document_sections(id, position, heading, section_type, body, body_format),
  document_figures(id, position, image_path, alt_text, caption, placement, section_id, token, credit),
  document_tags(tags(name, tag_type)),
  document_people(role, people(name))
`;

const DOCUMENT_SUMMARY_SELECT = `
  id,
  slug,
  title,
  short_title,
  subtitle,
  source_kind,
  parent_collection_id,
  sequence_label,
  sequence_number,
  issue_date,
  display_date,
  date_start,
  document_type,
  medium,
  language,
  region,
  publisher,
  summary,
  abstract,
  publication_title,
  citation,
  rights_statement,
  source_url,
  access_type,
  hosting_status,
  cover_image_path,
  thumbnail_path,
  is_featured,
  published_at,
  document_tags(tags(name, tag_type)),
  document_people(role, people(name))
`;

const LEGACY_DOCUMENT_SELECT = `
  id,
  slug,
  title,
  subtitle,
  display_date,
  date_start,
  document_type,
  medium,
  language,
  region,
  publisher,
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
  pages(*, page_lines(*)),
  files(id, storage_path, kind, mime_type, byte_size),
  document_tags(tags(name, tag_type)),
  document_people(role, people(name))
`;

const LEGACY_DOCUMENT_SUMMARY_SELECT = `
  id,
  slug,
  title,
  subtitle,
  display_date,
  date_start,
  document_type,
  medium,
  language,
  region,
  publisher,
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
  document_tags(tags(name, tag_type)),
  document_people(role, people(name))
`;

const COLLECTION_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  body,
  cover_image_path,
  collection_documents(
    position,
    sequence_label,
    sequence_number,
    issue_date,
    editorial_caption,
    document:documents(
      id,
      slug,
      title,
      short_title,
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
      cover_image_path,
      thumbnail_path,
      sequence_label,
      sequence_number,
      issue_date,
      access_type,
      hosting_status,
      published_at,
      pages(id),
      files(id, storage_path, kind, mime_type, byte_size),
      document_tags(tags(name, tag_type)),
      document_people(role, people(name))
    )
  )
`;

const COLLECTION_LIST_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  body,
  cover_image_path,
  collection_documents(
    position,
    sequence_label,
    sequence_number,
    issue_date,
    document:documents(
      id,
      slug,
      title,
      short_title,
      display_date,
      date_start,
      cover_image_path,
      thumbnail_path,
      sequence_label,
      sequence_number,
      issue_date
    )
  )
`;

const LEGACY_COLLECTION_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  body,
  cover_image_path,
  collection_documents(
    position,
    editorial_caption,
    document:documents(
      id,
      slug,
      title,
      short_title,
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
      cover_image_path,
      thumbnail_path,
      access_type,
      hosting_status,
      published_at,
      pages(id),
      files(id, storage_path, kind, mime_type, byte_size),
      document_tags(tags(name, tag_type)),
      document_people(role, people(name))
    )
  )
`;

const LEGACY_COLLECTION_LIST_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  body,
  cover_image_path,
  collection_documents(
    position,
    document:documents(
      id,
      slug,
      title,
      short_title,
      display_date,
      date_start,
      cover_image_path,
      thumbnail_path
    )
  )
`;

async function withSupabaseTimeout<T>(query: PromiseLike<T>, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${SUPABASE_QUERY_TIMEOUT_MS}ms`));
    }, SUPABASE_QUERY_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(query), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function listArchiveSourceSummariesFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return normalizedFallbackSources();

  let data: unknown;
  let error: { message: string } | null | undefined;
  try {
    const result = await withSupabaseTimeout(
      supabase
        .from("documents")
        .select(DOCUMENT_SUMMARY_SELECT)
        .eq("status", "published")
        .order("date_start", { ascending: true }),
      "Supabase archive summary query"
    );
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.warn("Supabase archive summary query failed; using fallback data.", errorMessage(queryError));
    return normalizedFallbackSources();
  }

  if (error && isSchemaShapeError(error.message)) {
    try {
      const legacyResult = await withSupabaseTimeout(
        supabase
          .from("documents")
          .select(LEGACY_DOCUMENT_SUMMARY_SELECT)
          .eq("status", "published")
          .order("date_start", { ascending: true }),
        "Supabase legacy archive summary query"
      );
      data = legacyResult.data;
      error = legacyResult.error;
    } catch (queryError) {
      console.warn("Supabase legacy archive summary query failed; using fallback data.", errorMessage(queryError));
      return normalizedFallbackSources();
    }
  }

  if (error || !data) {
    console.warn("Supabase archive summary query failed; using fallback data.", error?.message);
    return normalizedFallbackSources();
  }

  return (data as unknown as DocumentRow[]).map(documentToArchiveSource);
}

export async function getArchiveSourceDetailFromSupabase(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return fallbackSources.find((source) => source.slug === slug);

  let data: unknown;
  let error: { message: string } | null | undefined;
  try {
    const result = await withSupabaseTimeout(
      supabase
        .from("documents")
        .select(DOCUMENT_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle(),
      `Supabase source detail query for ${slug}`
    );
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.warn("Supabase source query failed; using fallback data.", errorMessage(queryError));
    return fallbackSources.find((source) => source.slug === slug);
  }

  if (error && isSchemaShapeError(error.message)) {
    try {
      const legacyResult = await withSupabaseTimeout(
        supabase
          .from("documents")
          .select(LEGACY_DOCUMENT_SELECT)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle(),
        `Supabase legacy source detail query for ${slug}`
      );
      data = legacyResult.data;
      error = legacyResult.error;
    } catch (queryError) {
      console.warn("Supabase legacy source query failed; using fallback data.", errorMessage(queryError));
      return fallbackSources.find((source) => source.slug === slug);
    }
  }

  if (error) {
    console.warn("Supabase source query failed; using fallback data.", error.message);
    return fallbackSources.find((source) => source.slug === slug);
  }

  if (!data) return undefined;
  const document = data as unknown as DocumentRow;
  document.document_citation_links = await getDocumentCitationLinks(document.id);
  return documentToArchiveSource(document);
}

export async function getArchiveSourceReaderPayloadFromSupabase(slug: string) {
  return getArchiveSourceDetailFromSupabase(slug);
}

export async function getArchiveSourcesFromSupabase() {
  return listArchiveSourceSummariesFromSupabase();
}

export async function getArchiveSourceFromSupabase(slug: string) {
  return getArchiveSourceDetailFromSupabase(slug);
}

async function getDocumentCitationLinks(documentId: string): Promise<DocumentCitationLinkRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let data: unknown;
  let error: { message: string } | null | undefined;
  try {
    const result = await withSupabaseTimeout(
      supabase
        .from("document_citation_links")
        .select("citation_text, confidence, status, bibliography_item:bibliography_items(slug, title, year)")
        .eq("document_id", documentId)
        .in("status", ["auto", "reviewed"]),
      `Supabase citation-link query for ${documentId}`
    );
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.warn("Supabase citation-link query failed.", errorMessage(queryError));
    return getLocalDocumentCitationLinks(documentId);
  }

  if (error) {
    if (!isSchemaShapeError(error.message)) {
      console.warn("Supabase citation-link query failed.", error.message);
    }
    return getLocalDocumentCitationLinks(documentId);
  }

  return (data ?? []) as DocumentCitationLinkRow[];
}

function getLocalDocumentCitationLinks(documentId: string): DocumentCitationLinkRow[] {
  const cache = loadLocalCitationLinkCache();
  return cache.get(documentId) ?? [];
}

function loadLocalCitationLinkCache(): Map<string, DocumentCitationLinkRow[]> {
  if (localCitationLinkCache) return localCitationLinkCache;
  localCitationLinkCache = new Map();

  const root = path.basename(process.cwd()) === "archive-site" ? path.resolve(process.cwd(), "..") : process.cwd();
  const dataDir = path.join(root, "data");
  if (!fs.existsSync(dataDir)) return localCitationLinkCache;

  for (const entry of fs.readdirSync(dataDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.endsWith("-import")) continue;
    const importDir = path.join(dataDir, entry.name);
    const linksPath = path.join(importDir, "document_citation_links.json");
    const itemsPath = path.join(importDir, "bibliography_items.json");
    if (!fs.existsSync(linksPath) || !fs.existsSync(itemsPath)) continue;

    try {
      const links = JSON.parse(fs.readFileSync(linksPath, "utf8")) as Array<{
        document_id: string;
        bibliography_item_id: string;
        citation_text: string;
        confidence: number | null;
        status: string | null;
      }>;
      const items = JSON.parse(fs.readFileSync(itemsPath, "utf8")) as Array<{
        id: string;
        slug: string;
        title: string;
        year: number | null;
      }>;
      const itemById = new Map(items.map((item) => [item.id, item]));
      for (const link of links) {
        const item = itemById.get(link.bibliography_item_id);
        if (!item) continue;
        const rows = localCitationLinkCache.get(link.document_id) ?? [];
        rows.push({
          citation_text: link.citation_text,
          confidence: link.confidence,
          status: link.status,
          bibliography_item: {
            slug: item.slug,
            title: item.title,
            year: item.year,
          },
        });
        localCitationLinkCache.set(link.document_id, rows);
      }
    } catch (error) {
      console.warn(`Skipping local citation-link fallback data in ${entry.name}.`, error instanceof Error ? error.message : error);
    }
  }

  return localCitationLinkCache;
}

export async function getCollectionSourceDetailFromSupabase(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;

  let data: unknown;
  let error: { message: string } | null | undefined;
  try {
    const result = await withSupabaseTimeout(
      supabase
        .from("collections")
        .select(COLLECTION_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle(),
      `Supabase collection detail query for ${slug}`
    );
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.warn("Supabase collection query failed.", errorMessage(queryError));
    return undefined;
  }

  if (error && isSchemaShapeError(error.message)) {
    try {
      const legacyResult = await withSupabaseTimeout(
        supabase
          .from("collections")
          .select(LEGACY_COLLECTION_SELECT)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle(),
        `Supabase legacy collection detail query for ${slug}`
      );
      data = legacyResult.data;
      error = legacyResult.error;
    } catch (queryError) {
      console.warn("Supabase legacy collection query failed.", errorMessage(queryError));
      return undefined;
    }
  }

  if (error) {
    console.warn("Supabase collection query failed.", error.message);
    return undefined;
  }

  return data ? collectionToArchiveSource(data as unknown as CollectionRow) : undefined;
}

export async function listCollectionSourceSummariesFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let data: unknown;
  let error: { message: string } | null | undefined;
  try {
    const result = await withSupabaseTimeout(
      supabase
        .from("collections")
        .select(COLLECTION_LIST_SELECT)
        .eq("status", "published")
        .order("title", { ascending: true }),
      "Supabase collection summary query"
    );
    data = result.data;
    error = result.error;
  } catch (queryError) {
    console.warn("Supabase collection summary query failed.", errorMessage(queryError));
    return [];
  }

  if (error && isSchemaShapeError(error.message)) {
    try {
      const legacyResult = await withSupabaseTimeout(
        supabase
          .from("collections")
          .select(LEGACY_COLLECTION_LIST_SELECT)
          .eq("status", "published")
          .order("title", { ascending: true }),
        "Supabase legacy collection summary query"
      );
      data = legacyResult.data;
      error = legacyResult.error;
    } catch (queryError) {
      console.warn("Supabase legacy collection summary query failed.", errorMessage(queryError));
      return [];
    }
  }

  if (error || !data) {
    console.warn("Supabase collection list query failed.", error?.message);
    return [];
  }

  return (data as unknown as CollectionRow[]).map((collection) => collectionToArchiveSource(collection, { includeItems: false }));
}

export async function getCollectionSourceFromSupabase(slug: string) {
  return getCollectionSourceDetailFromSupabase(slug);
}

export async function getCollectionSourcesFromSupabase() {
  return listCollectionSourceSummariesFromSupabase();
}

function isSchemaShapeError(message = "") {
  return (
    message.includes("Could not find a relationship") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function documentToArchiveSource(document: DocumentRow): ArchiveSource {
  const correction = SOURCE_METADATA_CORRECTIONS[document.slug];
  const tags = unique(
    document.document_tags
      ?.map((item) => {
        const tag = firstRelated(item.tags);
        return tag?.status === "draft" || tag?.status === "archived" ? undefined : tag?.name;
      })
      .filter(Boolean) as string[] | undefined
  );
  const people = unique(
    document.document_people
      ?.map((item) => firstRelated(item.people)?.name)
      .filter(Boolean) as string[] | undefined
  );
  const publicPeople = correction?.people ?? people.filter(isPublicPersonName);
  const substances = unique(
    [
      ...(document.document_tags
        ?.filter((item) => firstRelated(item.tags)?.tag_type === "substance" && !["draft", "archived"].includes(firstRelated(item.tags)?.status || "published"))
        .map((item) => firstRelated(item.tags)?.name)
        .filter(Boolean) as string[] | undefined) ?? [],
      ...tags.map(toSubstanceTag).filter(Boolean)
    ] as string[]
  );
  const pages = mapPages(document.pages);
  const files = mapFiles(document.files);
  const rawTranscript = pages.map((page) => page.ocrText).filter(Boolean).join("\n\n");
  const imagePath = document.thumbnail_path || document.cover_image_path || firstImagePath(document.files);
  const title = correction?.title ?? document.title;
  const year = document.date_start ?? yearFromDisplayDate(document.display_date) ?? 0;
  const parsedCreators = parseCreatorsFromTranscript(rawTranscript);
  const relationCreators = creatorsFromRelations(document.document_people);
  const correctedCreators = correction?.people?.map((name) => ({ name, role: "speaker" })) ?? [];
  const creators = uniqueCreators([...correctedCreators, ...parsedCreators, ...relationCreators]).filter((creator) => isPublicPersonName(creator.name));
  const authorNames = creators
    .filter((creator) => ["author", "speaker", "recordist"].includes(creator.role))
    .map((creator) => creator.name);
  const structuredFigures = mapDocumentFigures(document.document_figures);
  const citationLinks = mapCitationLinks(document.document_citation_links);
  const legacyFigures = extractTranscriptFigures(rawTranscript, getStoragePublicUrl(imagePath), title);
  const figures = structuredFigures.length ? structuredFigures : legacyFigures;
  const transcript = cleanTranscriptText(rawTranscript, {
    title,
    displayDate: document.display_date || (year ? String(year) : "Undated")
  });
  const curatedTranscriptSections = mapDocumentSections(document.document_sections);
  const transcriptSections = curatedTranscriptSections.length ? curatedTranscriptSections : buildTranscriptSections(transcript);
  const topicTags = unique(tags.map(toCoreTopicTag).filter(Boolean) as string[]);

  return {
    id: document.id,
    slug: document.slug,
    title,
    shortTitle: document.short_title || undefined,
    subtitle: document.subtitle || undefined,
    sourceKind: document.source_kind || "single",
    parentCollectionId: document.parent_collection_id || undefined,
    sequenceLabel: document.sequence_label || undefined,
    sequenceNumber: document.sequence_number ?? undefined,
    issueDate: document.issue_date || undefined,
    author: formatNames(authorNames) || formatNames(publicPeople) || "The Psychedelic History Archive",
    year,
    displayDate: document.display_date || (year ? String(year) : "Undated"),
    type: normalizeType(document.document_type),
    medium: normalizeMedium(document.medium),
    era: eraForYear(year),
    region: document.region || "Unknown",
    language: document.language || "English",
    tags: topicTags,
    legacyTags: tags,
    people: publicPeople,
    creators,
    substances,
    summary: document.summary || document.abstract || "",
    excerpt: excerptFromTranscript(transcript, document.summary || ""),
    citation: document.citation || "",
    publicationTitle: document.publication_title || document.publisher || undefined,
    rights: document.rights_statement || "Needs rights review before republication.",
    sourceUrl: document.source_url || "#",
    contentLanguage: document.content_language || document.language || undefined,
    translationLanguage: document.translation_language || undefined,
    translationText: document.translation_text || undefined,
    translationProvider: document.translation_provider || undefined,
    translationNote: document.translation_note || undefined,
    readerMode: document.reader_mode || undefined,
    mediaEmbedUrl: document.media_embed_url || undefined,
    accessType: document.access_type || "hosted",
    hostingStatus: document.hosting_status || "metadata_only",
    wordCount: wordCount(transcript),
    addedDate: document.published_at?.slice(0, 10) || "",
    featured: Boolean(document.is_featured),
    imageTone: imageToneForType(document.document_type),
    imagePath: getStoragePublicUrl(imagePath),
    imageAlt: title,
    transcript,
    transcriptSections,
    figures,
    citationLinks,
    pages,
    files
  };
}

function collectionToArchiveSource(collection: CollectionRow, { includeItems = true }: { includeItems?: boolean } = {}): ArchiveSource {
  const items = mapCollectionItems(collection.collection_documents);
  const itemCount = collection.collection_documents?.length ?? items.length;
  const years = items
    .map((item) => yearFromDisplayDate(item.displayDate ?? null))
    .filter((year): year is number => Boolean(year));
  const startYear = years.length ? Math.min(...years) : 0;
  const endYear = years.length ? Math.max(...years) : startYear;
  const displayDate = startYear && endYear && startYear !== endYear ? `${startYear}-${endYear}` : startYear ? String(startYear) : "Date range pending";
  const summary = collection.summary || collection.body || "";
  const sequenceNumbers = items
    .map((item) => item.sequenceNumber)
    .filter((value): value is number => typeof value === "number");
  const sequenceRange = sequenceNumbers.length
    ? `${Math.min(...sequenceNumbers)}-${Math.max(...sequenceNumbers)}`
    : "";
  const citation = sequenceRange
    ? `${collection.title}, nos. ${sequenceRange}. ${displayDate}.`
    : `${collection.title}. ${displayDate}.`;

  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    shortTitle: collection.title,
    subtitle: collection.subtitle || undefined,
    sourceKind: "collection",
    collectionItemCount: itemCount,
    collectionItems: includeItems ? items : undefined,
    author: "The Psychedelic History Archive",
    year: startYear,
    displayDate,
    type: "Source",
    medium: "Text",
    era: eraForYear(startYear),
    region: "Multiple regions",
    language: "Multiple languages",
    tags: [],
    people: [],
    creators: [],
    substances: [],
    summary,
    excerpt: collection.body || summary,
    citation,
    rights: "Collection-level rights vary by item. Review item details before republication.",
    sourceUrl: `/collections/${collection.slug}`,
    readerMode: "overview",
    accessType: "hosted",
    hostingStatus: "metadata_only",
    wordCount: wordCount(summary),
    addedDate: "",
    imageTone: "paper",
    imagePath: getStoragePublicUrl(collection.cover_image_path),
    imageAlt: collection.title
  };
}

function mapCollectionItems(collectionDocuments: CollectionDocumentRow[] = []): CollectionItemSummary[] {
  return [...collectionDocuments]
    .sort((a, b) => (a.sequence_number ?? a.position ?? 0) - (b.sequence_number ?? b.position ?? 0))
    .map((row) => {
      const document = firstRelated(row.document);
      if (!document?.id || !document.slug || !document.title) return undefined;
      const imagePath = document.thumbnail_path || document.cover_image_path || firstImagePath(document.files);
      const tags = unique(
        document.document_tags
          ?.map((item) => {
            const tag = firstRelated(item.tags);
            return tag?.status === "draft" || tag?.status === "archived" ? undefined : tag?.name;
          })
          .filter(Boolean) as string[] | undefined
      );

      return {
        id: document.id,
        slug: document.slug,
        title: document.title,
        shortTitle: document.short_title || undefined,
        sequenceLabel: row.sequence_label || document.sequence_label || undefined,
        sequenceNumber: row.sequence_number ?? document.sequence_number ?? undefined,
        displayDate: row.issue_date || document.issue_date || document.display_date || undefined,
        pageCount: document.pages?.length || undefined,
        tags,
        imagePath: getStoragePublicUrl(imagePath),
        imageAlt: document.title,
        href: `/archive/${document.slug}`
      };
    })
    .filter(Boolean) as CollectionItemSummary[];
}

function mapDocumentSections(sections: DocumentSectionRow[] = []): TranscriptSection[] {
  return [...sections]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((section) => {
      const body = section.body?.trim() ?? "";
      if (!body) return undefined;
      const bodyFormat = section.body_format === "markdown" ? "markdown" : "plain";
      return {
        id: section.id,
        heading: section.heading || "Transcript",
        kind: sectionKind(section.section_type || section.heading || "Transcript"),
        body,
        bodyFormat,
        position: section.position ?? undefined,
        paragraphs: bodyFormat === "markdown" ? [] : splitParagraphs(body)
      };
    })
    .filter(Boolean) as TranscriptSection[];
}

function mapDocumentFigures(figures: DocumentFigureRow[] = []): SourceFigure[] {
  return [...figures]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((figure, index) => {
      const caption = figure.caption?.trim() ?? "";
      const imagePath = getStoragePublicUrl(figure.image_path);
      if (!caption && !imagePath) return undefined;
      return {
        id: figure.id,
        imagePath,
        alt: figure.alt_text || caption || `Figure ${index + 1}`,
        caption,
        position: figure.placement || "inline",
        token: figure.token || figure.id,
        credit: figure.credit || undefined,
        sectionId: figure.section_id || undefined
      };
    })
    .filter(Boolean) as SourceFigure[];
}

function mapCitationLinks(rows: DocumentCitationLinkRow[] = []): SourceCitationLink[] {
  return rows
    .filter((row) => row.status === "auto" || row.status === "reviewed")
    .map((row) => {
      const item = firstRelated(row.bibliography_item);
      const citationText = row.citation_text?.trim();
      if (!citationText || !item?.slug || !item.title) return undefined;
      const title = item.year ? `${item.title} (${item.year})` : item.title;
      return {
        citationText,
        bibliographySlug: item.slug,
        bibliographyTitle: item.title,
        bibliographyYear: item.year ?? undefined,
        url: `/further-reading/${item.slug}`,
        title
      };
    })
    .filter(Boolean) as SourceCitationLink[];
}

const SOURCE_METADATA_CORRECTIONS: Record<string, { title?: string; people?: string[] }> = {
  "1965-allen-ginsberg-talks-to-joe-k-adams-about-his-first-lsd-trip": {
    title: "Allen Ginsberg Discusses LSD with Dr. Joe K. Adams",
    people: ["Allen Ginsberg", "Joe K. Adams"]
  }
};

function firstImagePath(files?: DocumentRow["files"]) {
  return files?.find((file) => file.storage_path && file.kind === "cover_image")?.storage_path ?? "";
}

function unique(values: string[] = []) {
  return [...new Set(values.filter(Boolean))];
}

function isPublicPersonName(value: string) {
  const trimmed = value.trim();
  return Boolean(trimmed) && !EMAIL_PATTERN.test(trimmed);
}

function creatorsFromRelations(relations: DocumentRow["document_people"] = []): SourceCreator[] {
  return relations
    .map((item) => {
      const name = firstRelated(item.people)?.name?.trim();
      const role = normalizeCreatorRole(item.role || "person");
      return name ? { name, role } : undefined;
    })
    .filter(Boolean) as SourceCreator[];
}

function parseCreatorsFromTranscript(transcript: string): SourceCreator[] {
  const match = transcript.match(/^\s*authors?\s*:\s*(.+)$/im);
  if (!match) return [];

  return splitNames(match[1]).map((name) => ({
    name,
    role: "author"
  }));
}

function splitNames(value: string) {
  return value
    .replace(/\s+and\s+/gi, ", ")
    .split(/\s*,\s*/)
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter(isPublicPersonName);
}

function normalizeCreatorRole(role: string) {
  const normalized = role.toLowerCase().trim();
  if (["author", "speaker", "recordist", "transcriber", "editor", "subject"].includes(normalized)) return normalized;
  return normalized || "person";
}

function uniqueCreators(creators: SourceCreator[]) {
  const seen = new Set<string>();
  return creators.filter((creator) => {
    const key = `${creator.name.toLowerCase()}::${creator.role.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatNames(names: string[]) {
  const uniqueNames = unique(names);
  if (uniqueNames.length <= 2) return uniqueNames.join(" and ");
  return `${uniqueNames.slice(0, -1).join(", ")}, and ${uniqueNames.at(-1)}`;
}

function toCoreTopicTag(value: string) {
  const trimmed = value.trim();
  if (CORE_TAG_SET.has(trimmed)) return trimmed;
  return TOPIC_TAG_MAP[trimmed.toLowerCase()];
}

function toSubstanceTag(value: string) {
  return SUBSTANCE_TAG_MAP[value.trim().toLowerCase()] ?? "";
}

function normalizedFallbackSources() {
  return fallbackSources.map((source) => ({
    ...source,
    tags: unique(source.tags.map(toCoreTopicTag).filter(Boolean) as string[])
  }));
}

function extractTranscriptFigures(transcript: string, imagePath: string | undefined, title: string): SourceFigure[] {
  const figures: SourceFigure[] = [];
  const captionPattern = /\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = captionPattern.exec(transcript))) {
    const caption = cleanCaption(match[1]);
    if (!caption) continue;
    figures.push({
      id: `figure-${index + 1}`,
      imagePath,
      alt: title,
      caption,
      position: "before_overview"
    });
    index += 1;
  }

  return figures;
}

function cleanCaption(value: string) {
  return value
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTranscriptText(transcript: string, sourceTitle: Pick<ArchiveSource, "title" | "displayDate">) {
  const withoutCaptions = transcript.replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, "\n\n");
  const lines = withoutCaptions.split(/\r?\n/);
  const titleParts = getSourceTitleParts(sourceTitle);

  while (lines.length && (!lines[0].trim() || /^(authors?|date|source)\s*:/i.test(lines[0].trim()))) {
    lines.shift();
  }

  if (lines.length && isImportedTitleLine(lines[0], titleParts.fullTitle)) {
    lines.shift();
  }

  while (lines.length && !lines[0].trim()) lines.shift();

  if (/^details$/i.test(lines[0]?.trim() ?? "")) {
    lines.shift();
  }

  while (lines.length && (!lines[0].trim() || /^(author|authors|pages?|date|source|title)\s*:/i.test(lines[0].trim()))) {
    lines.shift();
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isImportedTitleLine(line: string, title: string) {
  const normalizedLine = normalizeComparableTitle(line);
  const normalizedTitle = normalizeComparableTitle(title);

  return Boolean(normalizedLine && normalizedTitle) && (
    normalizedLine === normalizedTitle ||
    normalizedTitle.includes(normalizedLine) ||
    normalizedLine.includes(normalizedTitle.slice(0, Math.min(normalizedTitle.length, 90)))
  );
}

function normalizeComparableTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/^\s*(?:1[5-9]\d{2}|20\d{2})\s*[:\-–—]\s*/, "")
    .replace(/[:\-–—]+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTranscriptSections(transcript: string): TranscriptSection[] {
  const lines = transcript.split(/\r?\n/);
  const sections: TranscriptSection[] = [];
  let current: TranscriptSection | undefined;
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (!current || !paragraphBuffer.length) return;
    const paragraph = paragraphBuffer.join(" ").replace(/\s+/g, " ").trim();
    if (paragraph) current.paragraphs.push(paragraph);
    paragraphBuffer = [];
  }

  function startSection(heading: string) {
    flushParagraph();
    current = {
      heading,
      kind: sectionKind(heading),
      paragraphs: []
    };
    sections.push(current);
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const heading = normalizeTranscriptHeading(trimmed);
    if (heading) {
      startSection(heading);
      continue;
    }

    if (!current) startSection("Transcript");
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  return sections.filter((section) => section.paragraphs.length);
}

function normalizeTranscriptHeading(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();
  if (normalized === "historical overview") return "Historical Overview";
  if (/^(partial\s+)?(full\s+)?transcript(ion)?(\s+of\s+the\s+tape)?$/.test(normalized)) return "Transcript";
  if (/^(complete\s+)?transcription$/.test(normalized)) return "Transcript";
  if (normalized === "notes" || normalized === "editorial notes") return "Notes";
  return "";
}

function sectionKind(heading: string): TranscriptSection["kind"] {
  const normalized = heading.replace(/\s+/g, " ").trim().toLowerCase();
  if (normalized === "overview" || normalized === "historical overview") return "overview";
  if (normalized === "transcript" || normalized === "transcription") return "transcript";
  return "note";
}

function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
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
  if (type === "Ancient Text") return "Ancient Text";
  if (type === "Archaeological Site") return "Archaeological Site";
  if (type === "Architectural Site") return "Architectural Site";
  if (type === "Iconography") return "Iconography";
  if (type === "Material Artifact") return "Material Artifact";
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

function mapPages(pages: PageRow[] = []): SourcePage[] {
  return [...pages]
    .sort((a, b) => (a.page_number ?? 0) - (b.page_number ?? 0))
    .map((page) => {
      const lines = mapPageLines(page.page_lines);

      return {
        id: page.id,
        pageNumber: page.page_number ?? 0,
        label: page.label || String(page.page_number ?? ""),
        imagePath: getStoragePublicUrl(page.readable_image_path),
        thumbnailPath: getStoragePublicUrl(page.thumbnail_image_path),
        imageWidth: page.image_width ?? undefined,
        imageHeight: page.image_height ?? undefined,
        language: page.language ?? undefined,
        ocrText: page.ocr_text ?? lines.map((line) => line.text).join("\n"),
        ocrConfidence: page.ocr_confidence ?? undefined,
        transcriptionStatus: page.transcription_status ?? undefined,
        transcriptionReviewedBy: page.transcription_reviewed_by ?? undefined,
        transcriptionReviewedAt: page.transcription_reviewed_at ?? undefined,
        transcriptionNote: page.transcription_note ?? undefined,
        lines
      };
    });
}

function mapPageLines(lines: PageLineRow[] = []): SourcePageLine[] {
  return [...lines]
    .sort((a, b) => (a.line_index ?? 0) - (b.line_index ?? 0))
    .filter((line) => line.text)
    .map((line, index) => ({
      id: line.id,
      index: line.line_index ?? index + 1,
      text: line.text ?? "",
      normalizedText: line.normalized_text ?? undefined,
      confidence: line.confidence ?? undefined,
      language: line.language ?? undefined,
      paragraphIndex: line.paragraph_index ?? undefined,
      transcriptionStatus: line.transcription_status ?? undefined,
      reviewedBy: line.reviewed_by ?? undefined,
      reviewedAt: line.reviewed_at ?? undefined,
      box: normalizeBox(line.bbox)
    }));
}

function normalizeBox(value: unknown): SourceLineBox | undefined {
  if (!value || typeof value !== "object") return undefined;
  const box = value as Partial<Record<keyof SourceLineBox, unknown>>;
  const x = numberFromBox(box.x);
  const y = numberFromBox(box.y);
  const width = numberFromBox(box.width);
  const height = numberFromBox(box.height);

  if (x === undefined || y === undefined || width === undefined || height === undefined) return undefined;
  return { x, y, width, height };
}

function numberFromBox(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function mapFiles(files: FileRow[] = []): SourceFile[] {
  return files
    .filter((file) => file.id && file.kind && file.storage_path)
    .map((file) => ({
      id: file.id,
      kind: file.kind ?? "",
      url: getStoragePublicUrl(file.storage_path),
      mimeType: file.mime_type ?? undefined,
      byteSize: file.byte_size ?? undefined
    }));
}
