import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { biographyProfiles } from "@/lib/biographies";
import { biographyProfileToRow } from "@/lib/supabase-biographies";
import { requireEditor, localWorkspace } from "./auth";
import { cmsClient } from "./repository";
import { withWorkspace, repositoryRoot, type Workspace } from "./local-store";
import { slugify, uuidPattern } from "./model";
import { pageKinds, validatePage, type PageKind, type PageModel, type EditorialPage } from "./pages-model";

function biographyId(slug: string) { const h = createHash("sha256").update(`cms:biography:${slug}`).digest("hex"); return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`; }
function pageFromRow(kind: PageKind, row: Record<string, unknown>, sources: Record<string, unknown>[] = []): EditorialPage {
  const model = { fields: row, sources } as PageModel;
  return { kind, id: String(row.id), slug: String(row.slug), status: String(row.status || "draft"), version: 0, dirty: false, updatedAt: String(row.updated_at || ""), model, published: row.status === "published" ? structuredClone(model) : null };
}
async function prepareLocalPages(w: Workspace) {
  if (w.pages) return;
  const pages = new Map<string, EditorialPage>();
  for (const entry of (await fs.readdir(path.join(repositoryRoot, "data"))).filter(n => n.endsWith("-import"))) for (const kind of Object.keys(pageKinds) as PageKind[]) {
    const config = pageKinds[kind]; const directory = path.join(repositoryRoot, "data", entry);
    let rows: Record<string, unknown>[] = [], sources: Record<string, unknown>[] = [];
    try { rows = JSON.parse(await fs.readFile(path.join(directory, `${config.table}.json`), "utf8")); } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
    if (kind === "collection" || kind === "topic") try { sources = JSON.parse(await fs.readFile(path.join(directory, `${kind === "collection" ? "collection" : "topic"}_documents.json`), "utf8")); } catch { /* No source membership in this staging directory. */ }
    for (const row of rows) {
      const page = pageFromRow(kind, row, sources.filter(s => s[`${kind}_id`] === row.id).sort((a, b) => Number(a.sequence_number ?? a.position) - Number(b.sequence_number ?? b.position)));
      if (kind === "bibliography") try {
        const people = JSON.parse(await fs.readFile(path.join(directory, "bibliography_contributors.json"), "utf8")) as { id: string; display_name: string }[];
        const links = JSON.parse(await fs.readFile(path.join(directory, "bibliography_item_contributors.json"), "utf8")) as { bibliography_item_id: string; contributor_id: string; role: string }[];
        page.model.contributors = links.filter(p => p.bibliography_item_id === row.id).map(p => ({ id: p.contributor_id, name: people.find(person => person.id === p.contributor_id)?.display_name || "Unknown author", role: p.role || "author" }));
      } catch { /* These optional joins are absent in some staging sets. */ }
      pages.set(`${kind}:${row.id}`, page);
    }
  }
  for (const profile of biographyProfiles) {
    const row = { ...biographyProfileToRow(profile, "published"), id: biographyId(profile.slug) };
    if (![...pages.values()].some(p => p.kind === "biography" && p.slug === row.slug)) pages.set(`biography:${row.id}`, pageFromRow("biography", row));
  }
  w.pages = [...pages.values()];
}
function pageError(message: string): never { throw new Error(message.includes("cms_page_drafts") || message.includes("schema cache") ? "Apply scripts/supabase_cms_workspace.sql to connect page editing." : message); }

export async function listPages(kind: PageKind): Promise<EditorialPage[]> {
  await requireEditor();
  if (localWorkspace) return withWorkspace(async w => { await prepareLocalPages(w); return w.pages!.filter(p => p.kind === kind); });
  const config = pageKinds[kind]; const client = cmsClient();
  const [rows, drafts] = await Promise.all([client.from(config.table).select(`id,slug,status,updated_at,${config.title}`).order(config.title).limit(2000), client.from("cms_page_drafts").select("row_id,version,dirty,title,updated_at").eq("kind", kind)]);
  if (rows.error || drafts.error) pageError(rows.error?.message || drafts.error!.message);
  const result = (rows.data || []).map(row => { const page = pageFromRow(kind, row as unknown as Record<string, unknown>); const copy = drafts.data?.find(d => d.row_id === page.id); if (copy) { page.version = copy.version; page.dirty = copy.dirty; page.model.fields[config.title] = copy.title; } return page; });
  if (kind === "biography") for (const profile of biographyProfiles) if (!result.some(p => p.slug === profile.slug)) result.push(pageFromRow(kind, { ...biographyProfileToRow(profile), id: biographyId(profile.slug) }));
  return result;
}

export async function getPage(kind: PageKind, id: string): Promise<EditorialPage | null> {
  await requireEditor(); if (!uuidPattern.test(id)) return null;
  if (localWorkspace) return withWorkspace(async w => { await prepareLocalPages(w); return w.pages!.find(p => p.kind === kind && p.id === id) || null; });
  const config = pageKinds[kind]; const client = cmsClient();
  const [live, draft] = await Promise.all([client.from(config.table).select("*").eq("id", id).maybeSingle(), client.from("cms_page_drafts").select("*").eq("kind", kind).eq("row_id", id).maybeSingle()]);
  if (live.error || draft.error) pageError(live.error?.message || draft.error!.message);
  if (!live.data) {
    const profile = kind === "biography" && biographyProfiles.find(p => biographyId(p.slug) === id);
    return profile ? pageFromRow(kind, { ...biographyProfileToRow(profile), id }) : null;
  }
  let sources: Record<string, unknown>[] = [];
  if (kind === "collection" || kind === "topic") { const result = await client.from(`${kind}_documents`).select("*").eq(`${kind}_id`, id).order(kind === "collection" ? "sequence_number" : "position"); if (result.error) pageError(result.error.message); sources = result.data || []; }
  const page = pageFromRow(kind, live.data, sources); page.published = page.model;
  if (kind === "bibliography") {
    const result = await client.from("bibliography_item_contributors").select("role, position, contributor:bibliography_contributors(id, display_name)").eq("bibliography_item_id", id).order("position");
    if (result.error) pageError(result.error.message);
    page.model.contributors = (result.data || []).map(p => { const person = (Array.isArray(p.contributor) ? p.contributor[0] : p.contributor) as { id: string; display_name: string }; return { id: person.id, name: person.display_name, role: p.role || "author" }; });
  }
  if (draft.data) { page.model = draft.data.payload; page.version = draft.data.version; page.dirty = draft.data.dirty; page.updatedAt = draft.data.updated_at; }
  return page;
}

export async function createPage(kind: PageKind, title: string) {
  await requireEditor(); if (!title.trim()) throw new Error("Add a title.");
  const id = randomUUID(); const config = pageKinds[kind]; const slug = `${slugify(title)}-${id.slice(0,8)}`;
  const row = { id, slug, [config.title]: title.trim(), status: "draft", ...(kind === "bibliography" ? { item_type: "book" } : {}) };
  if (localWorkspace) await withWorkspace(async w => { await prepareLocalPages(w); w.pages!.push(pageFromRow(kind, row)); if (kind === "collection") w.choices.collections.push({ id, title }); });
  else { const { error } = await cmsClient().from(config.table).insert(row); if (error) pageError(error.message); }
  return id;
}

export async function savePage(kind: PageKind, id: string, input: PageModel, version: number, operation: "save" | "publish" | "unpublish" = "save") {
  const editor = await requireEditor(); const config = pageKinds[kind]; const model = validatePage(kind, input);
  if (operation === "publish" && !String(model.fields[config.title] || "").trim()) throw new Error("Add a title before publishing.");
  if (model.sources.some(s => typeof s.document_id !== "string" || !uuidPattern.test(s.document_id)) || new Set(model.sources.map(s => s.document_id)).size !== model.sources.length) throw new Error("One of the source links could not be saved.");
  if (localWorkspace) return withWorkspace(async w => {
    await prepareLocalPages(w); const page = w.pages!.find(p => p.kind === kind && p.id === id); if (!page) throw new Error("Page not found.");
    if (page.version !== version) throw new Error("Another editor or tab saved this page. Reload before replacing their work.");
    page.model = model; page.version++; page.dirty = operation !== "publish"; page.updatedAt = new Date().toISOString();
    if (operation === "publish") { page.status = "published"; page.published = structuredClone(model); }
    if (operation === "unpublish") page.status = "draft";
    if (kind === "collection") { const choice = w.choices.collections.find(c => c.id === id); if (choice) choice.title = String(model.fields.title || "Untitled collection"); }
    return { version: page.version, status: page.status };
  });
  const client = cmsClient();
  // Built-in biographies become database drafts only when an editor saves them.
  if (kind === "biography") {
    const profile = biographyProfiles.find(p => biographyId(p.slug) === id);
    if (profile) { const { data } = await client.from(config.table).select("id").eq("id", id).maybeSingle(); if (!data) { const { error } = await client.from(config.table).insert({ ...biographyProfileToRow(profile, "draft"), id }); if (error) pageError(error.message); } }
    if (operation === "unpublish" && profile) throw new Error("This biography also has a built-in public version. Hiding it requires removing that version from the public site; this pass keeps the public site unchanged.");
  }
  if (operation !== "save") {
    // Persist the final screen first; the second RPC verifies the same version before publication.
    const saved = await savePage(kind, id, model, version); version = saved.version;
  }
  const { data, error } = await client.rpc(operation === "save" ? "cms_save_page" : operation === "publish" ? "cms_publish_page" : "cms_unpublish_page", { page_kind: kind, page_id: id, expected_version: version, actor_id: editor.id, ...(operation === "save" ? { edit_payload: model } : {}) });
  if (error) pageError(error.message);
  return { version: data.version as number, status: data.status as string };
}
