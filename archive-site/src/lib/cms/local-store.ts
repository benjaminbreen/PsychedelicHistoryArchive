import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { emptySource, slugify, validateModel, publicationProblems, type SourceEditModel, type Revision, type Choices, type Fields } from "./model";
import type { EditorialPage } from "./pages-model";

export const repositoryRoot = path.basename(process.cwd()) === "archive-site" ? path.resolve(process.cwd(), "..") : process.cwd();
export const workspaceRoot = process.env.CMS_WORKSPACE_DIR || path.join(repositoryRoot, ".cms-local");
type Row = { id: string; slug: string; status: string; updated_at: string; version: number; model: SourceEditModel; published: SourceEditModel | null; revisions: Revision[]; raw: Record<string, unknown> };
export type Workspace = { rows: Row[]; choices: Choices; assets: Record<string, string>; pages?: EditorialPage[] };
const filename = path.join(workspaceRoot, "sources.json");

async function jsonRows(dir: string, name: string): Promise<Record<string, unknown>[]> {
  try { return JSON.parse(await fs.readFile(path.join(dir, `${name}.json`), "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}

async function seed(): Promise<Workspace> {
  const rows = new Map<string, Row>();
  const people = new Map<string, { id: string; name: string }>();
  const tags = new Map<string, { id: string; name: string }>();
  const collections = new Map<string, { id: string; title: string }>();
  const assets: Record<string, string> = {};
  const entries = await fs.readdir(path.join(repositoryRoot, "data"));
  for (const entry of entries.filter(n => n.endsWith("-import")).sort()) {
    const dir = path.join(repositoryRoot, "data", entry);
    const names = ["documents", "document_sections", "document_figures", "files", "people", "tags", "collections", "document_people", "document_tags", "collection_documents", "pages", "assets"];
    const data: Record<string, Record<string, unknown>[]> = Object.fromEntries(await Promise.all(names.map(async name => [name, await jsonRows(dir, name)])));
    for (const p of data.people) people.set(String(p.id), { id: String(p.id), name: String(p.name) });
    for (const t of data.tags) tags.set(String(t.id), { id: String(t.id), name: String(t.name) });
    for (const c of data.collections) collections.set(String(c.id), { id: String(c.id), title: String(c.title) });
    for (const a of data.assets) {
      const absolute = path.resolve(dir, String(a.local_path));
      if (absolute.startsWith(path.join(repositoryRoot, "data") + path.sep)) assets[String(a.storage_path)] = absolute;
    }
    for (const doc of data.documents) {
      const id = String(doc.id);
      const own = (name: string) => data[name].filter(r => r.document_id === id);
      const sections = own("document_sections").sort((a, b) => Number(a.position) - Number(b.position)).map((s, i) => ({ id: String(s.id), heading: String(s.heading || "Reading text"), section_type: String(s.section_type || "transcript"), body: String(s.body || ""), body_format: String(s.body_format || "plain"), position: (i + 1) * 10 }));
      if (doc.translation_text_path) {
        const target = path.resolve(dir, String(doc.translation_text_path));
        if (target.startsWith(dir + path.sep)) try { doc.translation_text = await fs.readFile(target, "utf8"); } catch { /* Missing staged translation is left untouched. */ }
      }
      const model = { document: doc as Fields, sections, editorNotes: String(doc.editorial_note || ""), figures: own("document_figures").map(f => ({ ...f, caption: f.caption || "", credit: f.credit || "", alt_text: f.alt_text || "", token: f.token || f.id, placement: f.placement || "inline" })), files: own("files").map(f => ({ ...f, name: path.basename(String(f.storage_path)) })), people: own("document_people").map(p => ({ id: String(p.person_id), name: people.get(String(p.person_id))?.name || "Unknown creator", role: String(p.role || "author") })), tagIds: own("document_tags").map(t => String(t.tag_id)), collections: own("collection_documents") } as SourceEditModel;
      if (model.document.source_url === "#") model.document.source_url = null;
      rows.set(id, { id, slug: String(doc.slug), status: doc.status === "published" ? "published" : "draft", updated_at: String(doc.updated_at || new Date().toISOString()), version: 0, model, published: doc.status === "published" ? structuredClone(model) : null, revisions: [], raw: { ...doc, pages: own("pages") } });
    }
  }
  return { rows: [...rows.values()], choices: { people: [...people.values()], tags: [...tags.values()], collections: [...collections.values()] }, assets };
}

// A file lock and atomic rename make local autosaves safe across tabs and processes.
export async function withWorkspace<T>(change: (workspace: Workspace) => T | Promise<T>): Promise<T> {
  await fs.mkdir(workspaceRoot, { recursive: true });
  let lock;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { lock = await fs.open(`${filename}.lock`, "wx"); break; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; await new Promise(resolve => setTimeout(resolve, 50)); }
  }
  if (!lock) throw new Error("Another save is taking longer than expected. Try again shortly.");
  try {
    let workspace: Workspace;
    try { workspace = JSON.parse(await fs.readFile(filename, "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; workspace = await seed(); }
    const result = await change(workspace);
    const temporary = `${filename}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(workspace));
    await fs.rename(temporary, filename);
    return result;
  } finally { await lock.close(); await fs.unlink(`${filename}.lock`); }
}

export async function localCreate(title: string, url: string) {
  return withWorkspace(workspace => {
    const id = randomUUID();
    const row: Row = { id, slug: `${slugify(title)}-${id.slice(0, 8)}`, status: "draft", updated_at: new Date().toISOString(), version: 0, model: validateModel(emptySource(title, url)), published: null, revisions: [], raw: {} };
    workspace.rows.unshift(row);
    return id;
  });
}

export async function localSave(id: string, model: SourceEditModel, expectedVersion: number, publish = false) {
  return withWorkspace(workspace => {
    const row = workspace.rows.find(r => r.id === id);
    if (!row) throw new Error("Source not found.");
    if (row.version !== expectedVersion) throw new Error("Another editor or tab saved this source. Your text is still here; reload before replacing their work.");
    const next = validateModel(model);
    if (publish) { const problems = publicationProblems(next); if (problems.length) throw new Error(problems.join(" ")); }
    row.model = next; row.version++; row.updated_at = new Date().toISOString();
    if (publish) {
      row.status = "published"; row.published = structuredClone(next);
      row.revisions.unshift({ id: randomUUID(), created_at: row.updated_at, change_note: "Published in local workspace", after_data: structuredClone(next) });
    }
    return { version: row.version, savedAt: row.updated_at };
  });
}

export async function localUnpublish(id: string, version: number) {
  return withWorkspace(workspace => {
    const row = workspace.rows.find(r => r.id === id);
    if (!row) throw new Error("Source not found.");
    if (row.version !== version) throw new Error("This source changed in another tab. Reload before moving it to drafts.");
    row.status = "draft"; row.version++; row.updated_at = new Date().toISOString();
    row.revisions.unshift({ id: randomUUID(), created_at: row.updated_at, change_note: "Moved to drafts", after_data: structuredClone(row.model) });
    return { version: row.version, savedAt: row.updated_at };
  });
}
