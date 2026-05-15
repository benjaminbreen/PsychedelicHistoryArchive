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
  cover_image_path: string | null;
  thumbnail_path: string | null;
  document_sections?: AdminDocumentSection[];
  document_figures?: AdminDocumentFigure[];
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
  reader_mode,
  media_embed_url,
  cover_image_path,
  thumbnail_path,
  status,
  updated_at,
  published_at,
  pages(id, page_number, label, ocr_text),
  document_sections(id, position, heading, section_type, body, body_format),
  document_figures(id, position, image_path, alt_text, caption, placement, token, credit)
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
  reader_mode,
  media_embed_url,
  cover_image_path,
  thumbnail_path,
  status,
  updated_at,
  published_at,
  pages(id, page_number, label, ocr_text),
  document_sections(id, position, heading, section_type, body),
  document_figures(id, position, image_path, alt_text, caption, placement)
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

export function isSchemaShapeError(message = "") {
  return (
    message.includes("Could not find a relationship") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}
