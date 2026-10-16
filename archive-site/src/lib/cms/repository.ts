import "server-only";
import { randomUUID } from "node:crypto";
import { getAdminSupabaseClient } from "@/lib/admin-cms";
import { documentToArchiveSource, type DocumentRow } from "@/lib/supabase-archive";
import { localWorkspace, requireEditor } from "./auth";
import { withWorkspace, localCreate, localSave, localUnpublish } from "./local-store";
import { emptySource, slugify, validateModel, publicationProblems, editableFields, type SourceEditModel, type SourceRecord, type Choices, type SourceListItem } from "./model";

export function cmsClient() {
  const client = getAdminSupabaseClient();
  if (!client) throw new Error("Connect Supabase to use the shared archive. For a local preview, start development with CMS_LOCAL_DATA=true. See CMS.md in the repository for setup.");
  return client;
}
function fail(message: string) { throw new Error(/source_working_copies|cms_.*(function|schema)|schema cache/.test(message) ? "The editor database update is needed. Apply scripts/supabase_cms_workspace.sql, then reload." : message); }

function modelFromRow(row: Record<string, unknown>): SourceEditModel {
  const document = Object.fromEntries(editableFields.map(k => [k, row[k] ?? null]));
  document.summary = row.summary || row.abstract || null;
  if (document.source_url === "#") document.source_url = null;
  const list = (key: string) => (row[key] || []) as Record<string, unknown>[];
  const sections = list("document_sections").sort((a, b) => Number(a.position) - Number(b.position)).map((s, i) => ({ id: String(s.id), body: String(s.body || ""), heading: String(s.heading || "Reading text"), section_type: String(s.section_type || "transcript"), body_format: String(s.body_format || "plain"), position: (i + 1) * 10 }));
  // OCR remains intact; expose it as editable reading text without a separate "seed" task.
  if (!sections.length) {
    const text = list("pages").sort((a, b) => Number(a.page_number) - Number(b.page_number)).map(p => p.ocr_text || "").filter(Boolean).join("\n\n");
    if (text) sections.push({ id: randomUUID(), heading: "Reading text", section_type: "transcript", body_format: "plain", body: text, position: 10 });
  }
  return { document, sections, editorNotes: String(row.editorial_note || ""), figures: list("document_figures").sort((a, b) => Number(a.position) - Number(b.position)).map(f => ({ ...f, caption: f.caption || "", alt_text: f.alt_text || "", credit: f.credit || "", token: f.token || f.id, placement: f.placement || "inline" })), files: list("files"), people: list("document_people").map(p => ({ id: (p.people as { id: string }).id, name: (p.people as { name: string }).name, role: p.role || "author" })), tagIds: list("document_tags").map(t => t.tag_id), collections: list("collection_documents") } as SourceEditModel;
}

export function readerFor(id: string, slug: string, model: SourceEditModel, raw: Record<string, unknown>, choices: Choices) {
  const row = { ...raw, ...model.document, id, slug, editorial_status: "published", document_sections: model.sections, document_figures: model.figures, files: model.files, document_people: model.people.map(p => ({ role: p.role, people: { name: p.name } })), document_tags: model.tagIds.map(tagId => ({ tags: { name: choices.tags.find(t => t.id === tagId)?.name || "", status: "published" } })) } as DocumentRow;
  const reader = documentToArchiveSource(row);
  const assetUrl = (fileId: string) => `/admin/media/${id}/${fileId}`;
  for (const file of model.files) {
    const target = reader.files?.find(f => f.id === file.id);
    if (target && (file.private || localWorkspace)) target.url = assetUrl(file.id);
  }
  for (const figure of model.figures) {
    const file = model.files.find(f => f.storage_path === figure.image_path);
    const target = reader.figures?.find(f => f.id === figure.id);
    if (file && target && (file.private || localWorkspace)) target.imagePath = assetUrl(file.id);
  }
  const cover = model.files.find(f => f.storage_path === (model.document.thumbnail_path || model.document.cover_image_path));
  if (cover && (cover.private || localWorkspace)) reader.imagePath = assetUrl(cover.id);
  return reader;
}

export async function getChoices(): Promise<Choices> {
  await requireEditor();
  if (localWorkspace) return withWorkspace(w => w.choices);
  const client = cmsClient();
  const results = await Promise.all([client.from("people").select("id, name").order("name").limit(2000), client.from("tags").select("id, name").order("name").limit(2000), client.from("collections").select("id, title").order("title").limit(2000)]);
  for (const result of results) if (result.error) fail(result.error.message);
  return { people: results[0].data || [], tags: results[1].data || [], collections: results[2].data || [] };
}

export async function getSource(id: string): Promise<SourceRecord | null> {
  await requireEditor();
  const choices = await getChoices();
  if (localWorkspace) return withWorkspace(w => {
    const row = w.rows.find(r => r.id === id);
    return row ? { id, slug: row.slug, status: row.status, liveUpdatedAt: row.updated_at, version: row.version, savedAt: row.version ? row.updated_at : null, savedBy: "Local editor", model: row.model, reader: readerFor(id, row.slug, row.model, row.raw, choices), revisions: row.revisions, featured: Boolean(row.raw.is_featured) } : null;
  });
  const client = cmsClient();
  const [live, copy, history] = await Promise.all([
    client.from("documents").select("*, pages(*, page_lines(*)), files(*), document_sections(*), document_figures(*), document_people(role, people(id, name)), document_tags(tag_id), collection_documents(*), document_citation_links(*, bibliography_item:bibliography_items(id, slug, title, year, status))").eq("id", id).maybeSingle(),
    client.from("source_working_copies").select("*").eq("document_id", id).maybeSingle(),
    client.from("content_revisions").select("id, created_at, change_note, after_data").eq("document_id", id).eq("table_name", "cms_publication").order("created_at", { ascending: false }).limit(20)
  ]);
  for (const result of [live, copy, history]) if (result.error) fail(result.error.message);
  if (!live.data) return null;
  const model = (copy.data?.payload as SourceEditModel) || modelFromRow(live.data);
  let savedBy: string | null = null;
  if (copy.data?.updated_by) {
    const profile = await client.from("editor_profiles").select("display_name").eq("user_id", copy.data.updated_by).maybeSingle();
    savedBy = profile.data?.display_name || "Another editor";
  }
  return { id, slug: live.data.slug, status: live.data.status, liveUpdatedAt: live.data.updated_at, version: copy.data?.version || 0, savedAt: copy.data?.updated_at || null, savedBy, model, reader: readerFor(id, live.data.slug, model, live.data, choices), revisions: history.data || [], featured: Boolean(live.data.is_featured) };
}

export async function listSources(): Promise<SourceListItem[]> {
  await requireEditor();
  if (localWorkspace) return withWorkspace(w => w.rows.map(r => ({ id: r.id, slug: r.slug, title: String(r.model.document.title || "Untitled source"), date: String(r.model.document.display_date || ""), creator: r.model.people.filter(p => p.role === "author" || p.role === "speaker").map(p => p.name).join(", "), medium: String(r.model.document.medium || "Text"), status: r.status, hasChanges: r.status === "published" && JSON.stringify(r.model) !== JSON.stringify(r.published), updatedAt: r.updated_at })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  const client = cmsClient();
  // No transcripts, page lines, or images in the list response.
  const rows: SourceListItem[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await client.from("documents").select("id, slug, title, display_date, medium, status, updated_at, document_people(role, people(name)), source_working_copies(version, title, display_date, updated_at, dirty)").order("id").range(from, from + 499);
    if (error) fail(error.message);
    for (const row of data || []) {
      const copy = row.source_working_copies?.[0];
      rows.push({ id: row.id, slug: row.slug, title: copy?.title || row.title, date: copy?.display_date || row.display_date || "", medium: row.medium || "Text", status: row.status, hasChanges: !!copy?.dirty, creator: row.document_people.filter(p => ["author", "speaker"].includes(p.role)).flatMap(p => Array.isArray(p.people) ? p.people.map(person => person.name) : [(p.people as { name: string } | null)?.name || ""]).join(", "), updatedAt: copy?.updated_at || row.updated_at });
    }
    if (!data || data.length < 500) break;
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createDraft(title: string, url: string) {
  const editor = await requireEditor();
  if (localWorkspace) return localCreate(title, url);
  const model = validateModel(emptySource(title, url));
  const id = randomUUID();
  const { error } = await cmsClient().from("documents").insert({ id, slug: `${slugify(title)}-${id.slice(0, 8)}`, title: title || "Untitled source", status: "draft", updated_by: editor.id });
  if (error) fail(error.message);
  await saveDraft(id, model, 0);
  return id;
}

export async function saveDraft(id: string, model: SourceEditModel, version: number) {
  const editor = await requireEditor();
  const payload = validateModel(model);
  for (const file of payload.files) if (file.private && !file.storage_path.startsWith(`${id}/${file.id}/`)) throw new Error("An attached file belongs to another source.");
  if (localWorkspace) return localSave(id, payload, version);
  const { data, error } = await cmsClient().rpc("cms_save_draft", { source_id: id, edit_payload: payload, expected_version: version, actor_id: editor.id });
  if (error) fail(error.message);
  return { version: data.version as number, savedAt: data.updated_at as string };
}

export async function publishDraft(id: string, version: number) {
  const editor = await requireEditor();
  const record = await getSource(id);
  if (!record) throw new Error("Source not found.");
  if (record.version !== version) throw new Error("This source changed in another tab. Reload before publishing.");
  const problems = publicationProblems(record.model);
  if (problems.length) throw new Error(problems.join(" "));
  if (localWorkspace) return localSave(id, record.model, version, true);
  const client = cmsClient();
  const payload = structuredClone(record.model);
  // Original uploads remain private. Published copies use stable, unique paths.
  const copied: string[] = [];
  try {
    for (const file of payload.files.filter(f => f.private)) {
      const { data, error } = await client.storage.from("archive-drafts").download(file.storage_path);
      if (error || !data) throw new Error("An attached file could not be prepared for publication.");
      const publicPath = `documents/${id}/cms/${randomUUID()}/${file.name || "file"}`;
      const upload = await client.storage.from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "archive-assets").upload(publicPath, data, { contentType: file.mime_type, upsert: false });
      if (upload.error) throw new Error(upload.error.message);
      copied.push(publicPath);
      const previous = file.storage_path;
      file.storage_path = publicPath; file.private = false;
      for (const figure of payload.figures) if (figure.image_path === previous) figure.image_path = publicPath;
      for (const field of ["cover_image_path", "thumbnail_path"]) if (payload.document[field] === previous) payload.document[field] = publicPath;
    }
    const { data, error } = await client.rpc("cms_publish_source", { source_id: id, expected_version: version, publish_payload: payload, actor_id: editor.id });
    if (error) fail(error.message);
    return { version: data.version as number, savedAt: data.updated_at as string };
  } catch (error) {
    if (copied.length) await client.storage.from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "archive-assets").remove(copied);
    throw error;
  }
}

export async function unpublishSource(id: string, version: number) {
  const editor = await requireEditor();
  if (localWorkspace) return localUnpublish(id, version);
  const { data, error } = await cmsClient().rpc("cms_unpublish_source", { source_id: id, expected_version: version, actor_id: editor.id });
  if (error) fail(error.message);
  return { version: data.version as number, savedAt: data.updated_at as string };
}

// Home-page curation applies immediately; it is not part of the source's draft/publish text.
export async function setSourceFeatured(id: string, featured: boolean) {
  await requireEditor();
  if (localWorkspace) throw new Error("Featured picks are stored in the shared archive. Connect Supabase to change them.");
  const { error } = await cmsClient().from("documents").update({ is_featured: featured }).eq("id", id);
  if (error) fail(error.message);
}
