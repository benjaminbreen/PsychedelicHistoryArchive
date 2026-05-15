"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabaseClient, isAdminEnabled, isSchemaShapeError } from "@/lib/admin-cms";

function requireAdminClient() {
  if (!isAdminEnabled) throw new Error("Local admin is disabled.");
  const supabase = getAdminSupabaseClient();
  if (!supabase) throw new Error("Admin writes require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.");
  return supabase;
}

export async function updateSourceMetadata(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "id");
  if (!id) throw new Error("Missing source id.");

  const before = await fetchRow("documents", id);
  const nextStatus = readString(formData, "status") || "draft";
  const payload = {
    title: readString(formData, "title") || "Untitled source",
    short_title: readNullableString(formData, "short_title"),
    subtitle: readNullableString(formData, "subtitle"),
    display_date: readNullableString(formData, "display_date"),
    date_start: readNullableNumber(formData, "date_start"),
    date_end: readNullableNumber(formData, "date_end"),
    document_type: readNullableString(formData, "document_type"),
    medium: readNullableString(formData, "medium"),
    language: readNullableString(formData, "language"),
    region: readNullableString(formData, "region"),
    publisher: readNullableString(formData, "publisher"),
    publication_title: readNullableString(formData, "publication_title"),
    summary: readNullableString(formData, "summary"),
    abstract: readNullableString(formData, "abstract"),
    citation: readNullableString(formData, "citation"),
    rights_statement: readNullableString(formData, "rights_statement"),
    source_url: readNullableString(formData, "source_url"),
    external_access_url: readNullableString(formData, "external_access_url"),
    access_type: readNullableString(formData, "access_type"),
    hosting_status: readNullableString(formData, "hosting_status"),
    source_kind: readNullableString(formData, "source_kind"),
    reader_mode: readNullableString(formData, "reader_mode"),
    media_embed_url: readNullableString(formData, "media_embed_url"),
    status: nextStatus,
    published_at: nextStatus === "published" ? readNullableString(formData, "published_at") || new Date().toISOString() : readNullableString(formData, "published_at"),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("documents")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("documents", id, id, before, payload, readNullableString(formData, "change_note"));
  revalidateSourcePaths(data.slug, id);
}

export async function saveDocumentSection(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "section_id");
  const documentId = readString(formData, "document_id");
  if (!id || !documentId) throw new Error("Missing section id or document id.");

  const before = await fetchRow("document_sections", id);
  const payload = {
    heading: readString(formData, "heading") || "Transcript",
    section_type: readString(formData, "section_type") || "transcript",
    body: readString(formData, "body"),
    body_format: readString(formData, "body_format") || "markdown",
    updated_at: new Date().toISOString()
  };

  let { error } = await supabase
    .from("document_sections")
    .update(payload)
    .eq("id", id);

  if (error && isSchemaShapeError(error.message)) {
    const legacyPayload = {
      heading: payload.heading,
      section_type: payload.section_type,
      body: payload.body,
      updated_at: payload.updated_at
    };
    const legacyResult = await supabase
      .from("document_sections")
      .update(legacyPayload)
      .eq("id", id);
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  await logRevision("document_sections", id, documentId, before, payload, readNullableString(formData, "change_note"));
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function createDocumentSection(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  if (!documentId) throw new Error("Missing document id.");

  const { data: existing, error: existingError } = await supabase
    .from("document_sections")
    .select("position")
    .eq("document_id", documentId)
    .order("position", { ascending: false })
    .limit(1);
  if (existingError) throw new Error(existingError.message);

  const position = ((existing?.[0]?.position as number | null | undefined) ?? 0) + 1;
  const payload = {
    document_id: documentId,
    position,
    heading: readString(formData, "heading") || "Transcript",
    section_type: readString(formData, "section_type") || "transcript",
    body: readString(formData, "body") || "New section text.",
    body_format: "markdown"
  };

  let { data, error } = await supabase
    .from("document_sections")
    .insert(payload)
    .select("id")
    .single();

  if (error && isSchemaShapeError(error.message)) {
    const legacyPayload = {
      document_id: payload.document_id,
      position: payload.position,
      heading: payload.heading,
      section_type: payload.section_type,
      body: payload.body
    };
    const legacyResult = await supabase
      .from("document_sections")
      .insert(legacyPayload)
      .select("id")
      .single();
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Created section did not return an id.");
  await logRevision("document_sections", data.id, documentId, null, payload, "Created section");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function seedSectionFromImportedText(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  if (!documentId) throw new Error("Missing document id.");

  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("page_number, label, ocr_text")
    .eq("document_id", documentId)
    .order("page_number", { ascending: true });
  if (pagesError) throw new Error(pagesError.message);

  const importedText = (pages ?? [])
    .map((page) => page.ocr_text)
    .filter((value): value is string => Boolean(value?.trim()))
    .join("\n\n");
  const body = cleanImportedTranscript(importedText);
  if (!body) throw new Error("No imported OCR/transcript text is available for this source.");

  const { data: existing, error: existingError } = await supabase
    .from("document_sections")
    .select("position")
    .eq("document_id", documentId)
    .order("position", { ascending: false })
    .limit(1);
  if (existingError) throw new Error(existingError.message);

  const position = ((existing?.[0]?.position as number | null | undefined) ?? 0) + 1;
  const payload = {
    document_id: documentId,
    position,
    heading: readString(formData, "heading") || "Transcript",
    section_type: "transcript",
    body,
    body_format: "markdown"
  };

  let { data, error } = await supabase
    .from("document_sections")
    .insert(payload)
    .select("id")
    .single();

  if (error && isSchemaShapeError(error.message)) {
    const legacyPayload = {
      document_id: payload.document_id,
      position: payload.position,
      heading: payload.heading,
      section_type: payload.section_type,
      body: payload.body
    };
    const legacyResult = await supabase
      .from("document_sections")
      .insert(legacyPayload)
      .select("id")
      .single();
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Seeded section did not return an id.");
  await logRevision("document_sections", data.id, documentId, null, payload, "Seeded from imported OCR/transcript text");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

async function fetchRow(table: string, id: string) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

async function logRevision(tableName: string, rowId: string, documentId: string, beforeData: unknown, afterData: unknown, changeNote?: string | null) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("content_revisions").insert({
    table_name: tableName,
    row_id: rowId,
    document_id: documentId,
    changed_by: null,
    change_note: changeNote || null,
    before_data: beforeData,
    after_data: afterData
  });

  if (error && !isSchemaShapeError(error.message)) {
    console.warn("Could not record content revision.", error.message);
  }
}

function revalidateSourcePaths(slug: string, id: string) {
  revalidatePath("/admin/sources");
  revalidatePath(`/admin/sources/${id}`);
  if (slug) revalidatePath(`/archive/${slug}`);
  revalidatePath("/archive");
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

function readNullableNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanImportedTranscript(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const markerIndex = lines.findIndex((line) =>
    /^(transcription|complete transcription|partial transcript|partial translation)$/i.test(line.trim())
  );
  const working = markerIndex === -1 ? [...lines] : lines.slice(markerIndex + 1);

  while (working.length && (!working[0].trim() || /^(authors?|date|source|title)\s*:/i.test(working[0].trim()))) {
    working.shift();
  }

  return working
    .join("\n")
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, "\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
