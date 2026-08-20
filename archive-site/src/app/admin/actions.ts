"use server";

import { Buffer } from "node:buffer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { biographyProfiles } from "@/lib/biographies";
import { getAdminSupabaseClient, isAdminEnabled, isSchemaShapeError } from "@/lib/admin-cms";
import { isSourceIssueStatus } from "@/lib/source-issue-reports";
import { biographyProfileToRow } from "@/lib/supabase-biographies";

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

export async function createSource(formData: FormData) {
  const supabase = requireAdminClient();
  const title = readString(formData, "title") || "Untitled source";
  const status = readString(formData, "status") || "draft";
  const payload = {
    title,
    slug: readString(formData, "slug") || slugify(title),
    document_type: readNullableString(formData, "document_type") || "Source",
    medium: readNullableString(formData, "medium") || "Text",
    source_kind: readNullableString(formData, "source_kind") || "single",
    reader_mode: readNullableString(formData, "reader_mode"),
    display_date: readNullableString(formData, "display_date"),
    date_start: readNullableNumber(formData, "date_start"),
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  if (!payload.slug) throw new Error("Missing source slug.");

  const { data, error } = await supabase
    .from("documents")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("documents", data.id, data.id, null, payload, "Created source");
  revalidateSourcePaths(data.slug, data.id);
  redirect(`/admin/sources/${data.id}`);
}

export async function updateCollectionMetadata(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "id");
  if (!id) throw new Error("Missing collection id.");

  const before = await fetchRow("collections", id);
  const nextStatus = readString(formData, "status") || "draft";
  const payload = {
    title: readString(formData, "title") || "Untitled collection",
    subtitle: readNullableString(formData, "subtitle"),
    summary: readNullableString(formData, "summary"),
    body: readNullableString(formData, "body"),
    cover_image_path: readNullableString(formData, "cover_image_path"),
    status: nextStatus,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("collections")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("collections", id, id, before, payload, readNullableString(formData, "change_note"));
  revalidateCollectionPaths(data.slug, id);
}

export async function createCollection(formData: FormData) {
  const supabase = requireAdminClient();
  const title = readString(formData, "title") || "Untitled collection";
  const payload = {
    title,
    slug: readString(formData, "slug") || slugify(title),
    subtitle: readNullableString(formData, "subtitle"),
    summary: readNullableString(formData, "summary"),
    status: readString(formData, "status") || "draft",
    updated_at: new Date().toISOString()
  };
  if (!payload.slug) throw new Error("Missing collection slug.");

  const { data, error } = await supabase
    .from("collections")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("collections", data.id, null, null, payload, "Created collection");
  revalidateCollectionPaths(data.slug, data.id);
  redirect(`/admin/collections/${data.id}`);
}

export async function createBiographyProfile(formData: FormData) {
  const supabase = requireAdminClient();
  const payload = await biographyPayloadFromForm(supabase, formData);

  const { data, error } = await supabase
    .from("biography_profiles")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) throw adminSchemaError(error, "biography profiles", "scripts/supabase_biography_profiles_schema.sql");
  await logRevision("biography_profiles", data.id, null, null, payload, "Created biography profile");
  revalidateBiographyPaths(data.slug, data.id);
  redirect(`/admin/biographies/${data.id}`);
}

export async function updateBiographyProfile(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "id");
  const storage = readString(formData, "storage");
  const payload = await biographyPayloadFromForm(supabase, formData);
  const before = id && storage === "database" ? await fetchRow("biography_profiles", id) : null;

  const query = storage === "database" && isUuid(id)
    ? supabase.from("biography_profiles").update(payload).eq("id", id)
    : supabase.from("biography_profiles").upsert(payload, { onConflict: "slug", ignoreDuplicates: false });

  const { data, error } = await query.select("id, slug").single();
  if (error) throw adminSchemaError(error, "biography profiles", "scripts/supabase_biography_profiles_schema.sql");

  await logRevision("biography_profiles", data.id, null, before, payload, readNullableString(formData, "change_note") || "Saved biography profile");
  revalidateBiographyPaths(data.slug, data.id);
}

export async function seedStaticBiographyProfiles() {
  const supabase = requireAdminClient();
  const payload = biographyProfiles.map((profile) => ({
    ...biographyProfileToRow(profile, "published"),
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from("biography_profiles")
    .upsert(payload, { onConflict: "slug", ignoreDuplicates: false });

  if (error) throw adminSchemaError(error, "biography profiles", "scripts/supabase_biography_profiles_schema.sql");
  await logRevision("biography_profiles", "00000000-0000-0000-0000-000000000000", null, null, { count: payload.length }, "Seeded static biography profiles");
  revalidatePath("/admin/biographies");
  revalidatePath("/people");
}

export async function addBiographyBibliographyLink(formData: FormData) {
  const supabase = requireAdminClient();
  const profileId = readString(formData, "biography_profile_id");
  const bibliographyItemId = readString(formData, "bibliography_item_id");
  if (!profileId || !bibliographyItemId) throw new Error("Missing biography profile or bibliography item.");

  const payload = {
    biography_profile_id: profileId,
    bibliography_item_id: bibliographyItemId,
    relationship_type: readString(formData, "relationship_type") || "recommended_reading",
    position: readNullableNumber(formData, "position"),
    editorial_note: readNullableString(formData, "editorial_note"),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("biography_bibliography_items")
    .upsert(payload, { onConflict: "biography_profile_id,bibliography_item_id,relationship_type", ignoreDuplicates: false });

  if (error) throw adminSchemaError(error, "biography bibliography links", "scripts/supabase_biography_profiles_schema.sql");
  await logRevision("biography_bibliography_items", `${profileId}:${bibliographyItemId}:${payload.relationship_type}`, null, null, payload, "Updated biography bibliography link");
  revalidateBiographyPaths(readString(formData, "biography_slug"), profileId);
}

export async function removeBiographyBibliographyLink(formData: FormData) {
  const supabase = requireAdminClient();
  const profileId = readString(formData, "biography_profile_id");
  const bibliographyItemId = readString(formData, "bibliography_item_id");
  const relationshipType = readString(formData, "relationship_type") || "recommended_reading";
  if (!profileId || !bibliographyItemId) throw new Error("Missing biography bibliography link.");

  const before = await fetchRowByComposite("biography_bibliography_items", {
    biography_profile_id: profileId,
    bibliography_item_id: bibliographyItemId,
    relationship_type: relationshipType
  });
  const { error } = await supabase
    .from("biography_bibliography_items")
    .delete()
    .eq("biography_profile_id", profileId)
    .eq("bibliography_item_id", bibliographyItemId)
    .eq("relationship_type", relationshipType);

  if (error) throw adminSchemaError(error, "biography bibliography links", "scripts/supabase_biography_profiles_schema.sql");
  await logRevision("biography_bibliography_items", `${profileId}:${bibliographyItemId}:${relationshipType}`, null, before, null, "Removed biography bibliography link");
  revalidateBiographyPaths(readString(formData, "biography_slug"), profileId);
}

export async function createTopic(formData: FormData) {
  const supabase = requireAdminClient();
  const name = readString(formData, "name") || "Untitled topic";
  const slug = readString(formData, "slug") || slugify(name);
  if (!slug) throw new Error("Missing topic slug.");

  const payload = {
    name,
    slug,
    dek: readNullableString(formData, "dek"),
    body_markdown: readNullableString(formData, "body_markdown"),
    icon: readNullableString(formData, "icon"),
    seo_title: readNullableString(formData, "seo_title"),
    seo_description: readNullableString(formData, "seo_description"),
    status: readString(formData, "status") || "draft",
    sort_order: readNullableNumber(formData, "sort_order"),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("topics")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("topics", data.id, null, null, payload, readNullableString(formData, "change_note") || "Created topic");
  revalidateTopicPaths(data.slug, data.id);
}

export async function updateTopicMetadata(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "id");
  if (!id) throw new Error("Missing topic id.");

  const before = await fetchRow("topics", id);
  const name = readString(formData, "name") || "Untitled topic";
  const payload = {
    name,
    slug: readString(formData, "slug") || slugify(name),
    dek: readNullableString(formData, "dek"),
    body_markdown: readNullableString(formData, "body_markdown"),
    icon: readNullableString(formData, "icon"),
    seo_title: readNullableString(formData, "seo_title"),
    seo_description: readNullableString(formData, "seo_description"),
    status: readString(formData, "status") || "draft",
    sort_order: readNullableNumber(formData, "sort_order"),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("topics")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("topics", id, null, before, payload, readNullableString(formData, "change_note"));
  revalidateTopicPaths(data.slug, id);
}

export async function createBibliographyItem(formData: FormData) {
  const supabase = requireAdminClient();
  const title = readString(formData, "title") || "Untitled bibliography item";
  const slug = readString(formData, "slug") || slugify(title);
  if (!slug) throw new Error("Missing bibliography slug.");

  const payload = {
    title,
    slug,
    item_type: readString(formData, "item_type") || "book",
    recommendation_status: readString(formData, "recommendation_status") || "recommended",
    status: readString(formData, "status") || "draft",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("bibliography_items")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("bibliography_items", data.id, null, null, payload, "Created bibliography item");
  revalidateBibliographyPaths(data.slug, data.id);
}

export async function updateBibliographyItem(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "id");
  if (!id) throw new Error("Missing bibliography item id.");

  const before = await fetchRow("bibliography_items", id);
  const title = readString(formData, "title") || "Untitled bibliography item";
  const payload = {
    slug: readString(formData, "slug") || slugify(title),
    item_type: readString(formData, "item_type") || "book",
    title,
    subtitle: readNullableString(formData, "subtitle"),
    publication_title: readNullableString(formData, "publication_title"),
    publisher: readNullableString(formData, "publisher"),
    publication_place: readNullableString(formData, "publication_place"),
    year: readNullableNumber(formData, "year"),
    volume: readNullableString(formData, "volume"),
    issue: readNullableString(formData, "issue"),
    pages: readNullableString(formData, "pages"),
    doi: readNullableString(formData, "doi"),
    isbn: readNullableString(formData, "isbn"),
    oclc: readNullableString(formData, "oclc"),
    jstor_url: readNullableString(formData, "jstor_url"),
    publisher_url: readNullableString(formData, "publisher_url"),
    google_books_url: readNullableString(formData, "google_books_url"),
    worldcat_url: readNullableString(formData, "worldcat_url"),
    open_access_url: readNullableString(formData, "open_access_url"),
    pdf_url: readNullableString(formData, "pdf_url"),
    abstract: readNullableString(formData, "abstract"),
    editorial_note: readNullableString(formData, "editorial_note"),
    reliability_note: readNullableString(formData, "reliability_note"),
    recommendation_status: readString(formData, "recommendation_status") || "recommended",
    status: readString(formData, "status") || "draft",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("bibliography_items")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await logRevision("bibliography_items", id, null, before, payload, readNullableString(formData, "change_note"));
  revalidateBibliographyPaths(data.slug, id);
}

export async function addBibliographyContributor(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const displayName = readString(formData, "display_name");
  if (!itemId || !displayName) throw new Error("Missing bibliography item or contributor name.");

  const contributorPayload = {
    display_name: displayName,
    family_name: readNullableString(formData, "family_name"),
    given_name: readNullableString(formData, "given_name"),
    slug: slugify(displayName)
  };
  const { data: contributor, error: contributorError } = await supabase
    .from("bibliography_contributors")
    .upsert(contributorPayload, { onConflict: "slug", ignoreDuplicates: false })
    .select("id")
    .single();
  if (contributorError) throw new Error(contributorError.message);

  const payload = {
    bibliography_item_id: itemId,
    contributor_id: contributor.id,
    role: readString(formData, "role") || "author",
    position: readNullableNumber(formData, "position") ?? 1
  };
  const { error } = await supabase
    .from("bibliography_item_contributors")
    .upsert(payload, { onConflict: "bibliography_item_id,contributor_id,role", ignoreDuplicates: false });
  if (error) throw new Error(error.message);

  await logRevision("bibliography_item_contributors", `${itemId}:${contributor.id}:${payload.role}`, null, null, payload, "Added bibliography contributor");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function removeBibliographyContributor(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const contributorId = readString(formData, "contributor_id");
  const role = readString(formData, "role") || "author";
  if (!itemId || !contributorId) throw new Error("Missing bibliography contributor relationship.");

  const { error } = await supabase
    .from("bibliography_item_contributors")
    .delete()
    .eq("bibliography_item_id", itemId)
    .eq("contributor_id", contributorId)
    .eq("role", role);
  if (error) throw new Error(error.message);
  await logRevision("bibliography_item_contributors", `${itemId}:${contributorId}:${role}`, null, { bibliography_item_id: itemId, contributor_id: contributorId, role }, null, "Removed bibliography contributor");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function setBibliographyEra(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const eraSlug = readString(formData, "era_slug");
  if (!itemId || !eraSlug) throw new Error("Missing bibliography item or era.");
  const payload = {
    bibliography_item_id: itemId,
    era_slug: eraSlug,
    position: readNullableNumber(formData, "position")
  };
  const { error } = await supabase
    .from("bibliography_item_eras")
    .upsert(payload, { onConflict: "bibliography_item_id,era_slug", ignoreDuplicates: false });
  if (error) throw new Error(error.message);
  await logRevision("bibliography_item_eras", `${itemId}:${eraSlug}`, null, null, payload, "Updated bibliography era");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function removeBibliographyEra(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const eraSlug = readString(formData, "era_slug");
  if (!itemId || !eraSlug) throw new Error("Missing bibliography item or era.");
  const { error } = await supabase
    .from("bibliography_item_eras")
    .delete()
    .eq("bibliography_item_id", itemId)
    .eq("era_slug", eraSlug);
  if (error) throw new Error(error.message);
  await logRevision("bibliography_item_eras", `${itemId}:${eraSlug}`, null, { bibliography_item_id: itemId, era_slug: eraSlug }, null, "Removed bibliography era");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function addBibliographySourceLink(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const documentId = readString(formData, "document_id");
  if (!itemId || !documentId) throw new Error("Missing bibliography item or source.");

  const payload = {
    bibliography_item_id: itemId,
    document_id: documentId,
    relationship_label: readNullableString(formData, "relationship_label"),
    editorial_note: readNullableString(formData, "editorial_note")
  };

  const { error } = await supabase
    .from("bibliography_item_documents")
    .upsert(payload, { onConflict: "bibliography_item_id,document_id", ignoreDuplicates: false });
  if (error) throw new Error(error.message);

  await logRevision("bibliography_item_documents", `${itemId}:${documentId}`, documentId, null, payload, "Updated bibliography source link");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function removeBibliographySourceLink(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const documentId = readString(formData, "document_id");
  if (!itemId || !documentId) throw new Error("Missing bibliography item or source.");

  const before = await fetchRowByComposite("bibliography_item_documents", { bibliography_item_id: itemId, document_id: documentId });
  const { error } = await supabase
    .from("bibliography_item_documents")
    .delete()
    .eq("bibliography_item_id", itemId)
    .eq("document_id", documentId);
  if (error) throw new Error(error.message);

  await logRevision("bibliography_item_documents", `${itemId}:${documentId}`, documentId, before, null, "Removed bibliography source link");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function addBibliographyAlias(formData: FormData) {
  const supabase = requireAdminClient();
  const itemId = readString(formData, "bibliography_item_id");
  const alias = readString(formData, "alias");
  if (!itemId || !alias) throw new Error("Missing bibliography item or alias.");

  const payload = {
    bibliography_item_id: itemId,
    alias,
    normalized_alias: normalizeCitation(alias),
    source: readNullableString(formData, "source") || "manual",
    status: readString(formData, "status") || "reviewed"
  };

  const { error } = await supabase
    .from("bibliography_item_aliases")
    .upsert(payload, { onConflict: "bibliography_item_id,normalized_alias", ignoreDuplicates: false });
  if (error) throw new Error(error.message);

  await logRevision("bibliography_item_aliases", `${itemId}:${payload.normalized_alias}`, null, null, payload, "Added bibliography citation alias");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function removeBibliographyAlias(formData: FormData) {
  const supabase = requireAdminClient();
  const aliasId = readString(formData, "alias_id");
  const itemId = readString(formData, "bibliography_item_id");
  if (!aliasId || !itemId) throw new Error("Missing bibliography alias.");

  const before = await fetchRow("bibliography_item_aliases", aliasId);
  const { error } = await supabase
    .from("bibliography_item_aliases")
    .delete()
    .eq("id", aliasId);
  if (error) throw new Error(error.message);

  await logRevision("bibliography_item_aliases", aliasId, null, before, null, "Removed bibliography citation alias");
  revalidateBibliographyPaths(readString(formData, "slug"), itemId);
}

export async function createDocumentCitationLink(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const citationText = readString(formData, "citation_text");
  if (!documentId || !citationText) throw new Error("Missing source or citation text.");

  const payload = {
    document_id: documentId,
    bibliography_item_id: readNullableString(formData, "bibliography_item_id"),
    citation_text: citationText,
    normalized_citation: normalizeCitation(citationText),
    confidence: readNullableNumber(formData, "confidence"),
    status: readString(formData, "status") || "reviewed",
    match_reason: readNullableString(formData, "match_reason") || "manual",
    occurrence_count: readNullableNumber(formData, "occurrence_count") ?? 1,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("document_citation_links")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logRevision("document_citation_links", data.id, documentId, null, payload, "Created citation link");
  revalidateSourcePaths(readString(formData, "source_slug"), documentId);
}

export async function updateDocumentCitationLink(formData: FormData) {
  const supabase = requireAdminClient();
  const linkId = readString(formData, "citation_link_id");
  const documentId = readString(formData, "document_id");
  const citationText = readString(formData, "citation_text");
  if (!linkId || !documentId || !citationText) throw new Error("Missing citation link data.");

  const before = await fetchRow("document_citation_links", linkId);
  const payload = {
    bibliography_item_id: readNullableString(formData, "bibliography_item_id"),
    citation_text: citationText,
    normalized_citation: normalizeCitation(citationText),
    confidence: readNullableNumber(formData, "confidence"),
    status: readString(formData, "status") || "reviewed",
    match_reason: readNullableString(formData, "match_reason"),
    occurrence_count: readNullableNumber(formData, "occurrence_count") ?? 1,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("document_citation_links")
    .update(payload)
    .eq("id", linkId);
  if (error) throw new Error(error.message);

  await logRevision("document_citation_links", linkId, documentId, before, payload, "Updated citation link");
  revalidateSourcePaths(readString(formData, "source_slug"), documentId);
}

export async function deleteDocumentCitationLink(formData: FormData) {
  const supabase = requireAdminClient();
  const linkId = readString(formData, "citation_link_id");
  const documentId = readString(formData, "document_id");
  if (!linkId || !documentId) throw new Error("Missing citation link.");

  const before = await fetchRow("document_citation_links", linkId);
  const { error } = await supabase
    .from("document_citation_links")
    .delete()
    .eq("id", linkId);
  if (error) throw new Error(error.message);

  await logRevision("document_citation_links", linkId, documentId, before, null, "Deleted citation link");
  revalidateSourcePaths(readString(formData, "source_slug"), documentId);
}

export async function addSourceToTopic(formData: FormData) {
  const supabase = requireAdminClient();
  const topicId = readString(formData, "topic_id");
  const documentId = readString(formData, "document_id");
  if (!topicId || !documentId) throw new Error("Missing topic or source.");

  const payload = {
    topic_id: topicId,
    document_id: documentId,
    position: readNullableNumber(formData, "position"),
    relationship_label: readNullableString(formData, "relationship_label"),
    editorial_note: readNullableString(formData, "editorial_note"),
    is_featured: readBoolean(formData, "is_featured"),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("topic_documents")
    .upsert(payload, { onConflict: "topic_id,document_id", ignoreDuplicates: false });

  if (error) throw new Error(error.message);
  await logRevision("topic_documents", `${topicId}:${documentId}`, null, null, payload, "Updated topic source membership");
  revalidateTopicPaths(readString(formData, "topic_slug"), topicId);
}

export async function removeSourceFromTopic(formData: FormData) {
  const supabase = requireAdminClient();
  const topicId = readString(formData, "topic_id");
  const documentId = readString(formData, "document_id");
  if (!topicId || !documentId) throw new Error("Missing topic or source.");

  const before = await fetchRowByComposite("topic_documents", { topic_id: topicId, document_id: documentId });
  const { error } = await supabase
    .from("topic_documents")
    .delete()
    .eq("topic_id", topicId)
    .eq("document_id", documentId);

  if (error) throw new Error(error.message);
  await logRevision("topic_documents", `${topicId}:${documentId}`, null, before, null, "Removed source from topic");
  revalidateTopicPaths(readString(formData, "topic_slug"), topicId);
}

export async function addDocumentPerson(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const personId = readString(formData, "person_id");
  const role = readString(formData, "role") || "person";
  if (!documentId || !personId) throw new Error("Missing source or person.");

  const payload = { document_id: documentId, person_id: personId, role };
  const { error } = await supabase
    .from("document_people")
    .upsert(payload, { onConflict: "document_id,person_id,role", ignoreDuplicates: true });
  if (error) throw new Error(error.message);

  await logRevision("document_people", `${documentId}:${personId}:${role}`, documentId, null, payload, "Added person relationship");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function removeDocumentPerson(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const personId = readString(formData, "person_id");
  const role = readString(formData, "role");
  if (!documentId || !personId) throw new Error("Missing source or person.");

  let query = supabase
    .from("document_people")
    .delete()
    .eq("document_id", documentId)
    .eq("person_id", personId);
  query = role ? query.eq("role", role) : query.is("role", null);
  const { error } = await query;
  if (error) throw new Error(error.message);

  await logRevision("document_people", `${documentId}:${personId}:${role}`, documentId, { document_id: documentId, person_id: personId, role }, null, "Removed person relationship");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function addDocumentTag(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const tagId = readString(formData, "tag_id");
  if (!documentId || !tagId) throw new Error("Missing source or tag.");

  const payload = { document_id: documentId, tag_id: tagId };
  const { error } = await supabase
    .from("document_tags")
    .upsert(payload, { onConflict: "document_id,tag_id", ignoreDuplicates: true });
  if (error) throw new Error(error.message);

  await logRevision("document_tags", `${documentId}:${tagId}`, documentId, null, payload, "Added tag relationship");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function removeDocumentTag(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const tagId = readString(formData, "tag_id");
  if (!documentId || !tagId) throw new Error("Missing source or tag.");

  const { error } = await supabase
    .from("document_tags")
    .delete()
    .eq("document_id", documentId)
    .eq("tag_id", tagId);
  if (error) throw new Error(error.message);

  await logRevision("document_tags", `${documentId}:${tagId}`, documentId, payloadForDelete({ document_id: documentId, tag_id: tagId }), null, "Removed tag relationship");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function updateTagVisibility(formData: FormData) {
  const supabase = requireAdminClient();
  const tagId = readString(formData, "tag_id");
  const status = readString(formData, "status") || "published";
  if (!tagId) throw new Error("Missing tag.");

  const before = await fetchRow("tags", tagId);
  const { error } = await supabase
    .from("tags")
    .update({ status })
    .eq("id", tagId);

  if (error && isSchemaShapeError(error.message)) {
    throw new Error("The tags.status column is not installed yet. Apply scripts/supabase_schema.sql before hiding topic cards.");
  }

  if (error) throw new Error(error.message);
  await logRevision("tags", tagId, readString(formData, "document_id") || tagId, before, { status }, "Updated tag visibility");
  revalidatePath("/topics");
  revalidatePath("/archive");
}

export async function addSourceToCollection(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const collectionId = readString(formData, "collection_id");
  if (!documentId || !collectionId) throw new Error("Missing source or collection.");

  const payload = {
    collection_id: collectionId,
    document_id: documentId,
    position: readNullableNumber(formData, "position"),
    sequence_label: readNullableString(formData, "sequence_label"),
    sequence_number: readNullableNumber(formData, "sequence_number"),
    issue_date: readNullableString(formData, "issue_date"),
    editorial_caption: readNullableString(formData, "editorial_caption")
  };

  const { error } = await supabase
    .from("collection_documents")
    .upsert(payload, { onConflict: "collection_id,document_id", ignoreDuplicates: false });
  if (error) throw new Error(error.message);

  await supabase
    .from("documents")
    .update({ parent_collection_id: collectionId })
    .eq("id", documentId);

  await logRevision("collection_documents", `${collectionId}:${documentId}`, documentId, null, payload, "Updated collection membership");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
  revalidatePath("/collections");
}

export async function removeSourceFromCollection(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  const collectionId = readString(formData, "collection_id");
  if (!documentId || !collectionId) throw new Error("Missing source or collection.");

  const before = await fetchRowByComposite("collection_documents", { collection_id: collectionId, document_id: documentId });
  const { error } = await supabase
    .from("collection_documents")
    .delete()
    .eq("collection_id", collectionId)
    .eq("document_id", documentId);
  if (error) throw new Error(error.message);

  await logRevision("collection_documents", `${collectionId}:${documentId}`, documentId, before, null, "Removed collection membership");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
  revalidatePath("/collections");
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

export async function moveDocumentSection(formData: FormData) {
  const supabase = requireAdminClient();
  const sectionId = readString(formData, "section_id");
  const documentId = readString(formData, "document_id");
  const direction = readString(formData, "direction");
  if (!sectionId || !documentId) throw new Error("Missing section id or document id.");
  if (direction !== "up" && direction !== "down") throw new Error("Unknown section move direction.");

  const { data: current, error: currentError } = await supabase
    .from("document_sections")
    .select("id, position")
    .eq("id", sectionId)
    .single();
  if (currentError) throw new Error(currentError.message);
  if (typeof current.position !== "number") throw new Error("Section has no sortable position.");

  const neighborQuery = supabase
    .from("document_sections")
    .select("id, position")
    .eq("document_id", documentId)
    .order("position", { ascending: direction === "down" })
    .limit(1);

  const { data: neighbors, error: neighborError } = direction === "up"
    ? await neighborQuery.lt("position", current.position)
    : await neighborQuery.gt("position", current.position);
  if (neighborError) throw new Error(neighborError.message);
  const neighbor = neighbors?.[0];
  if (!neighbor || typeof neighbor.position !== "number") return;

  const before = { current, neighbor };
  const tempPosition = -Math.floor(Date.now() / 1000);
  await updatePositionOrThrow("document_sections", current.id, tempPosition);
  await updatePositionOrThrow("document_sections", neighbor.id, current.position);
  await updatePositionOrThrow("document_sections", current.id, neighbor.position);

  await logRevision("document_sections", sectionId, documentId, before, {
    current: { id: current.id, position: neighbor.position },
    neighbor: { id: neighbor.id, position: current.position }
  }, `Moved section ${direction}`);
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function duplicateDocumentSection(formData: FormData) {
  const supabase = requireAdminClient();
  const sectionId = readString(formData, "section_id");
  const documentId = readString(formData, "document_id");
  if (!sectionId || !documentId) throw new Error("Missing section id or document id.");

  const { data: section, error: sectionError } = await supabase
    .from("document_sections")
    .select("heading, section_type, body, body_format")
    .eq("id", sectionId)
    .single();
  if (sectionError) throw new Error(sectionError.message);

  const { data: existing, error: existingError } = await supabase
    .from("document_sections")
    .select("position")
    .eq("document_id", documentId)
    .order("position", { ascending: false })
    .limit(1);
  if (existingError) throw new Error(existingError.message);

  const payload = {
    document_id: documentId,
    position: ((existing?.[0]?.position as number | null | undefined) ?? 0) + 1,
    heading: `${section.heading || "Section"} copy`,
    section_type: section.section_type || "transcript",
    body: section.body || "",
    body_format: section.body_format || "markdown"
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
  if (!data?.id) throw new Error("Duplicated section did not return an id.");
  await logRevision("document_sections", data.id, documentId, null, payload, "Duplicated section");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function deleteDocumentSection(formData: FormData) {
  const supabase = requireAdminClient();
  const sectionId = readString(formData, "section_id");
  const documentId = readString(formData, "document_id");
  if (!sectionId || !documentId) throw new Error("Missing section id or document id.");

  const before = await fetchRow("document_sections", sectionId);
  const { error } = await supabase
    .from("document_sections")
    .delete()
    .eq("id", sectionId);
  if (error) throw new Error(error.message);

  await logRevision("document_sections", sectionId, documentId, before, null, "Deleted section");
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

export async function createDocumentFigure(formData: FormData) {
  const supabase = requireAdminClient();
  const documentId = readString(formData, "document_id");
  if (!documentId) throw new Error("Missing document id.");

  const uploadedFile = formData.get("figure_file");
  let imagePath = readString(formData, "image_path");

  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "archive-assets";
    const storagePath = `documents/${documentId}/figures/${Date.now()}-${safeStorageFileName(uploadedFile.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, Buffer.from(await uploadedFile.arrayBuffer()), {
        contentType: uploadedFile.type || "application/octet-stream",
        upsert: false
      });
    if (uploadError) throw new Error(uploadError.message);

    imagePath = storagePath;

    const { error: fileError } = await supabase.from("files").insert({
      document_id: documentId,
      kind: "supplementary_file",
      storage_path: storagePath,
      mime_type: uploadedFile.type || null,
      byte_size: uploadedFile.size
    });
    if (fileError && !isSchemaShapeError(fileError.message)) {
      throw new Error(fileError.message);
    }
  }

  if (!imagePath) throw new Error("Add an image upload or an existing storage path.");

  const { data: existing, error: existingError } = await supabase
    .from("document_figures")
    .select("position")
    .eq("document_id", documentId)
    .order("position", { ascending: false })
    .limit(1);
  if (existingError) throw new Error(existingError.message);

  const position = ((existing?.[0]?.position as number | null | undefined) ?? 0) + 1;
  const payload = {
    document_id: documentId,
    position,
    image_path: imagePath,
    alt_text: readNullableString(formData, "alt_text"),
    caption: readNullableString(formData, "caption"),
    placement: readNullableString(formData, "placement") || "inline",
    token: readNullableString(formData, "token"),
    credit: readNullableString(formData, "credit")
  };

  let { data, error } = await supabase
    .from("document_figures")
    .insert(payload)
    .select("id")
    .single();

  if (error && isSchemaShapeError(error.message)) {
    const legacyPayload = {
      document_id: payload.document_id,
      position: payload.position,
      image_path: payload.image_path,
      alt_text: payload.alt_text,
      caption: payload.caption,
      placement: payload.placement
    };
    const legacyResult = await supabase
      .from("document_figures")
      .insert(legacyPayload)
      .select("id")
      .single();
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Created figure did not return an id.");
  await logRevision("document_figures", data.id, documentId, null, payload, "Created figure");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function updateDocumentFigure(formData: FormData) {
  const supabase = requireAdminClient();
  const figureId = readString(formData, "figure_id");
  const documentId = readString(formData, "document_id");
  if (!figureId || !documentId) throw new Error("Missing figure id or document id.");

  const before = await fetchRow("document_figures", figureId);
  const uploadedFile = formData.get("figure_file");
  let imagePath = readString(formData, "image_path").replace(/^\/+/, "");

  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    imagePath = await uploadFigureFile(supabase, documentId, uploadedFile);
  }

  const payload = {
    image_path: imagePath || null,
    alt_text: readNullableString(formData, "alt_text"),
    caption: readNullableString(formData, "caption"),
    placement: readNullableString(formData, "placement") || "inline",
    token: readNullableString(formData, "token"),
    credit: readNullableString(formData, "credit"),
    updated_at: new Date().toISOString()
  };

  let { error } = await supabase
    .from("document_figures")
    .update(payload)
    .eq("id", figureId);

  if (error && isSchemaShapeError(error.message)) {
    const legacyPayload = {
      image_path: payload.image_path,
      alt_text: payload.alt_text,
      caption: payload.caption,
      placement: payload.placement,
      updated_at: payload.updated_at
    };
    const legacyResult = await supabase
      .from("document_figures")
      .update(legacyPayload)
      .eq("id", figureId);
    error = legacyResult.error;
  }

  if (error) throw new Error(error.message);
  await logRevision("document_figures", figureId, documentId, before, payload, readNullableString(formData, "change_note") || "Updated figure");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function deleteDocumentFigure(formData: FormData) {
  const supabase = requireAdminClient();
  const figureId = readString(formData, "figure_id");
  const documentId = readString(formData, "document_id");
  if (!figureId || !documentId) throw new Error("Missing figure id or document id.");

  const before = await fetchRow("document_figures", figureId);
  const { error } = await supabase
    .from("document_figures")
    .delete()
    .eq("id", figureId);
  if (error) throw new Error(error.message);

  await logRevision("document_figures", figureId, documentId, before, null, "Deleted figure record");
  revalidateSourcePaths(readString(formData, "slug"), documentId);
}

export async function updateSourceIssueReportStatus(formData: FormData) {
  const supabase = requireAdminClient();
  const id = readString(formData, "id");
  const status = readString(formData, "status");
  if (!id || !isSourceIssueStatus(status)) throw new Error("Missing source issue report status.");

  const before = await fetchRow("source_issue_reports", id);
  const payload = {
    status,
    admin_note: readNullableString(formData, "admin_note"),
    resolved_at: status === "fixed" || status === "dismissed" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("source_issue_reports")
    .update(payload)
    .eq("id", id)
    .select("id, document_id, source_slug")
    .single();

  if (error) throw adminSchemaError(error, "source issue reports", "scripts/supabase_source_issue_reports_schema.sql");
  await logRevision("source_issue_reports", id, data.document_id, before, payload, `Set source issue report status to ${status}`);
  revalidatePath("/admin/qa");
  if (data.source_slug) revalidatePath(`/archive/${data.source_slug}`);
}

async function fetchRow(table: string, id: string) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

async function fetchRowByComposite(table: string, values: Record<string, string>) {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return null;
  let query = supabase.from(table).select("*");
  for (const [key, value] of Object.entries(values)) {
    query = query.eq(key, value);
  }
  const { data } = await query.maybeSingle();
  return data ?? null;
}

async function logRevision(tableName: string, rowId: string, documentId: string | null, beforeData: unknown, afterData: unknown, changeNote?: string | null) {
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

async function updatePositionOrThrow(tableName: "document_sections", id: string, position: number) {
  const supabase = requireAdminClient();
  const { error } = await supabase
    .from(tableName)
    .update({ position, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

function adminSchemaError(error: { message?: string }, feature: string, migrationPath: string) {
  const message = error.message ?? "";
  if (isSchemaShapeError(message) || message.includes("Could not find the table")) {
    return new Error(`Supabase is missing the ${feature} schema. Apply ${migrationPath} in the Supabase SQL editor, then retry this admin action. Original error: ${message}`);
  }
  return new Error(message || "Supabase admin write failed.");
}

async function uploadFigureFile(supabase: ReturnType<typeof requireAdminClient>, documentId: string, file: File) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "archive-assets";
  const storagePath = `documents/${documentId}/figures/${Date.now()}-${safeStorageFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });
  if (uploadError) throw new Error(uploadError.message);

  const { error: fileError } = await supabase.from("files").insert({
    document_id: documentId,
    kind: "supplementary_file",
    storage_path: storagePath,
    mime_type: file.type || null,
    byte_size: file.size
  });
  if (fileError && !isSchemaShapeError(fileError.message)) {
    throw new Error(fileError.message);
  }

  return storagePath;
}

async function uploadBiographyPortraitFile(supabase: ReturnType<typeof requireAdminClient>, slug: string, file: File) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "archive-assets";
  const storagePath = `biographies/${slug}/portrait/${Date.now()}-${safeStorageFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });
  if (error) throw new Error(error.message);
  return storagePath;
}

function revalidateSourcePaths(slug: string, id: string) {
  revalidatePath("/admin/sources");
  revalidatePath(`/admin/sources/${id}`);
  if (slug) revalidatePath(`/archive/${slug}`);
  revalidatePath("/archive");
}

function revalidateCollectionPaths(slug: string, id: string) {
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  revalidatePath("/collections");
  if (slug) revalidatePath(`/collections/${slug}`);
}

function revalidateTopicPaths(slug: string, id: string) {
  revalidatePath("/admin/topics");
  revalidatePath(`/admin/topics/${id}`);
  revalidatePath("/topics");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/topics/${slug}`);
}

function revalidateBibliographyPaths(slug: string, id: string) {
  revalidatePath("/admin/bibliography");
  revalidatePath(`/admin/bibliography/${id}`);
  revalidatePath("/further-reading");
  revalidatePath("/eras");
  if (slug) revalidatePath(`/further-reading?item=${slug}`);
}

function revalidateBiographyPaths(slug: string, id: string) {
  revalidatePath("/admin/biographies");
  revalidatePath(`/admin/biographies/${id}`);
  revalidatePath("/people");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/biographies/${slug}`);
}

async function biographyPayloadFromForm(supabase: ReturnType<typeof requireAdminClient>, formData: FormData) {
  const name = readString(formData, "name") || "Untitled biography";
  const slug = readString(formData, "slug") || slugify(name);
  if (!slug) throw new Error("Missing biography slug.");
  const uploadedPortrait = formData.get("portrait_file");
  let imagePath = readString(formData, "image_path").replace(/^\/+/, "");

  if (uploadedPortrait instanceof File && uploadedPortrait.size > 0) {
    imagePath = await uploadBiographyPortraitFile(supabase, slug, uploadedPortrait);
  }

  return {
    slug,
    name,
    years: readNullableString(formData, "years"),
    dek: readNullableString(formData, "dek"),
    body_markdown: readNullableString(formData, "body_markdown"),
    birth_date: readNullableString(formData, "birth_date"),
    birth_year: readNullableNumber(formData, "birth_year"),
    birth_place: readNullableString(formData, "birth_place"),
    death_date: readNullableString(formData, "death_date"),
    death_year: readNullableNumber(formData, "death_year"),
    death_place: readNullableString(formData, "death_place"),
    occupations: readLines(formData, "occupations_text"),
    regions: readLines(formData, "regions_text"),
    known_for: readLines(formData, "known_for_text"),
    affiliations: readLines(formData, "affiliations_text"),
    image_path: imagePath || null,
    image_alt: readNullableString(formData, "image_alt"),
    image_caption: readNullableString(formData, "image_caption"),
    tags: readLines(formData, "tags_text"),
    facts: readFacts(formData, "custom_facts_text"),
    source_notes: readLines(formData, "source_notes_text"),
    related_sources: readLines(formData, "related_sources_text"),
    publications: [],
    collaborators: readLines(formData, "collaborators_text"),
    status: readString(formData, "status") || "draft",
    updated_at: new Date().toISOString()
  };
}

function readLines(formData: FormData, key: string) {
  return readString(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readFacts(formData: FormData, key: string) {
  return readLines(formData, key)
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      return {
        label: label?.trim() ?? "",
        value: valueParts.join(":").trim().replace(/\\n/g, "\n")
      };
    })
    .filter((fact) => fact.label && fact.value);
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

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeCitation(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"“”‘’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function payloadForDelete<T>(value: T) {
  return value;
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

function safeStorageFileName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "figure";
}
