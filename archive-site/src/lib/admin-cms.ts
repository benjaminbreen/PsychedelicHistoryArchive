import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isAdminEnabled =
  process.env.ADMIN_DISABLED !== "true" &&
  (process.env.NODE_ENV === "development" || process.env.ADMIN_LOCAL_ENABLED === "true");

export const isAdminWritable = Boolean(supabaseUrl && serviceRoleKey);

export type AdminSourceListItem = {
  id: string;
  slug: string;
  title: string;
  document_type: string | null;
  medium: string | null;
  display_date: string | null;
  status: string | null;
  reader_mode: string | null;
  media_embed_url: string | null;
  updated_at: string | null;
  published_at: string | null;
  document_sections?: Array<{ id: string }>;
};

export type AdminDocumentSection = {
  id: string;
  position: number | null;
  heading: string | null;
  section_type: string | null;
  body: string | null;
  body_format?: string | null;
};

export type AdminDocumentFigure = {
  id: string;
  position: number | null;
  image_path: string | null;
  alt_text: string | null;
  caption: string | null;
  placement: string | null;
  token?: string | null;
  credit?: string | null;
};

export type AdminPerson = {
  id: string;
  name: string;
  slug: string;
};

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  tag_type: string | null;
  status?: string | null;
};

export type AdminCollectionListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  status: string | null;
  updated_at: string | null;
  collection_documents?: Array<{ document_id: string | null }>;
};

export type AdminCollection = AdminCollectionListItem & {
  body: string | null;
  cover_image_path: string | null;
  collection_documents?: AdminCollectionDocument[];
};

export type AdminCollectionDocument = {
  collection_id: string;
  document_id: string;
  position: number | null;
  sequence_label: string | null;
  sequence_number: number | null;
  issue_date: string | null;
  editorial_caption: string | null;
  document?: { id: string; slug: string; title: string; status: string | null } | null;
};

export type AdminTopicListItem = {
  id: string;
  slug: string;
  name: string;
  dek: string | null;
  icon: string | null;
  status: string | null;
  sort_order: number | null;
  updated_at: string | null;
  topic_documents?: Array<{ document_id: string | null }>;
};

export type AdminTopicDocument = {
  topic_id: string;
  document_id: string;
  position: number | null;
  relationship_label: string | null;
  editorial_note: string | null;
  is_featured: boolean | null;
  document?: { id: string; slug: string; title: string; status: string | null } | null;
};

export type AdminTopicRelation = {
  topic_id: string;
  related_topic_id: string;
  position: number | null;
  relation_label: string | null;
  related_topic?: { id: string; slug: string; name: string; status: string | null } | null;
};

export type AdminTopic = AdminTopicListItem & {
  body_markdown: string | null;
  seo_title: string | null;
  seo_description: string | null;
  topic_documents?: AdminTopicDocument[];
  topic_relations?: AdminTopicRelation[];
};

export type AdminDocumentPerson = {
  role: string | null;
  people: AdminPerson | AdminPerson[] | null;
};

export type AdminDocumentTag = {
  tags: AdminTag | AdminTag[] | null;
};

export type AdminSourceCollectionMembership = {
  collection_id: string;
  document_id: string;
  position: number | null;
  sequence_label: string | null;
  sequence_number: number | null;
  issue_date: string | null;
  editorial_caption: string | null;
  collections: Pick<AdminCollectionListItem, "id" | "title" | "slug" | "status"> | Array<Pick<AdminCollectionListItem, "id" | "title" | "slug" | "status">> | null;
};

export type AdminPage = {
  id: string;
  page_number: number | null;
  label: string | null;
  ocr_text: string | null;
};

export type AdminSource = AdminSourceListItem & {
  short_title: string | null;
  subtitle: string | null;
  date_start: number | null;
  date_end: number | null;
  language: string | null;
  region: string | null;
  publisher: string | null;
  publication_title: string | null;
  summary: string | null;
  abstract: string | null;
  citation: string | null;
  rights_statement: string | null;
  source_url: string | null;
  external_access_url: string | null;
  access_type: string | null;
  hosting_status: string | null;
  source_kind: string | null;
  parent_collection_id?: string | null;
  sequence_label?: string | null;
  sequence_number?: number | null;
  issue_date?: string | null;
  cover_image_path: string | null;
  thumbnail_path: string | null;
  document_sections?: AdminDocumentSection[];
  document_figures?: AdminDocumentFigure[];
  document_people?: AdminDocumentPerson[];
  document_tags?: AdminDocumentTag[];
  collection_documents?: AdminSourceCollectionMembership[];
  pages?: AdminPage[];
};

const SOURCE_LIST_SELECT = `
  id,
  slug,
  title,
  document_type,
  medium,
  display_date,
  status,
  reader_mode,
  media_embed_url,
  updated_at,
  published_at,
  document_sections(id)
`;

const SOURCE_SELECT = `
  id,
  slug,
  title,
  short_title,
  subtitle,
  display_date,
  date_start,
  date_end,
  document_type,
  medium,
  language,
  region,
  publisher,
  publication_title,
  summary,
  abstract,
  citation,
  rights_statement,
  source_url,
  external_access_url,
  access_type,
  hosting_status,
  source_kind,
  parent_collection_id,
  sequence_label,
  sequence_number,
  issue_date,
  reader_mode,
  media_embed_url,
  cover_image_path,
  thumbnail_path,
  status,
  updated_at,
  published_at,
  pages(id, page_number, label, ocr_text),
  document_sections(id, position, heading, section_type, body, body_format),
  document_figures(id, position, image_path, alt_text, caption, placement, token, credit),
  document_people(role, people(id, name, slug)),
  document_tags(tags(id, name, slug, tag_type, status)),
  collection_documents(collection_id, document_id, position, sequence_label, sequence_number, issue_date, editorial_caption, collections(id, title, slug, status))
`;

const LEGACY_SOURCE_SELECT = `
  id,
  slug,
  title,
  short_title,
  subtitle,
  display_date,
  date_start,
  date_end,
  document_type,
  medium,
  language,
  region,
  publisher,
  publication_title,
  summary,
  abstract,
  citation,
  rights_statement,
  source_url,
  external_access_url,
  access_type,
  hosting_status,
  source_kind,
  parent_collection_id,
  sequence_label,
  sequence_number,
  issue_date,
  reader_mode,
  media_embed_url,
  cover_image_path,
  thumbnail_path,
  status,
  updated_at,
  published_at,
  pages(id, page_number, label, ocr_text),
  document_sections(id, position, heading, section_type, body),
  document_figures(id, position, image_path, alt_text, caption, placement),
  document_people(role, people(id, name, slug)),
  document_tags(tags(id, name, slug, tag_type)),
  collection_documents(collection_id, document_id, position, editorial_caption, collections(id, title, slug, status))
`;

const COLLECTION_LIST_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  status,
  updated_at,
  collection_documents(document_id)
`;

const COLLECTION_SELECT = `
  id,
  slug,
  title,
  subtitle,
  summary,
  body,
  cover_image_path,
  status,
  updated_at,
  collection_documents(
    collection_id,
    document_id,
    position,
    sequence_label,
    sequence_number,
    issue_date,
    editorial_caption,
    document:documents(id, slug, title, status)
  )
`;

const TOPIC_LIST_SELECT = `
  id,
  slug,
  name,
  dek,
  icon,
  status,
  sort_order,
  updated_at,
  topic_documents(document_id)
`;

const TOPIC_SELECT = `
  id,
  slug,
  name,
  dek,
  body_markdown,
  icon,
  seo_title,
  seo_description,
  status,
  sort_order,
  updated_at,
  topic_documents(
    topic_id,
    document_id,
    position,
    relationship_label,
    editorial_note,
    is_featured,
    document:documents(id, slug, title, status)
  ),
  topic_relations(
    topic_id,
    related_topic_id,
    position,
    relation_label,
    related_topic:topics!topic_relations_related_topic_id_fkey(id, slug, name, status)
  )
`;

export function getAdminSupabaseClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function listAdminSources() {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("documents")
    .select(SOURCE_LIST_SELECT)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("date_start", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminSourceListItem[];
}

export async function getAdminSource(id: string) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return undefined;

  let { data, error } = await supabase
    .from("documents")
    .select(SOURCE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error && isSchemaShapeError(error.message)) {
    const legacyResult = await supabase
      .from("documents")
      .select(LEGACY_SOURCE_SELECT)
      .eq("id", id)
      .maybeSingle();
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  return data as AdminSource | undefined;
}

export async function listAdminPeople() {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("people")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminPerson[];
}

export async function listAdminTags() {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  let { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, tag_type, status")
    .order("name", { ascending: true });

  if (error && isSchemaShapeError(error.message)) {
    const legacyResult = await supabase
      .from("tags")
      .select("id, name, slug, tag_type")
      .order("name", { ascending: true });
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminTag[];
}

export async function listAdminCollections() {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_LIST_SELECT)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminCollectionListItem[];
}

export async function getAdminCollection(id: string) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as AdminCollection | undefined;
}

export async function listAdminTopics() {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_LIST_SELECT)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error && isSchemaShapeError(error.message)) {
    console.warn("Curated topics schema is not installed yet.", error.message);
    return [];
  }
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminTopicListItem[];
}

export async function getAdminTopic(id: string) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error && isSchemaShapeError(error.message)) {
    console.warn("Curated topics schema is not installed yet.", error.message);
    return undefined;
  }
  if (error) throw new Error(error.message);
  return data as unknown as AdminTopic | undefined;
}

export function isSchemaShapeError(message = "") {
  return (
    message.includes("Could not find a relationship") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}
