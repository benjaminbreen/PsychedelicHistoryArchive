import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { MarkdownManager } from "@tiptap/markdown";
import { PGlite } from "@electric-sql/pglite";
import { emptySource, validateModel, publicationProblems } from "../src/lib/cms/model";
import { editorExtensions, needsSourceMode } from "../src/lib/cms/editor-extensions";

test("formatted editing preserves archive figures, footnotes, and text", () => {
  const manager = new MarkdownManager({ extensions: editorExtensions() });
  const original = "## A source\n\nA **bold** sentence with a [link](https://example.org) and a note[^a].\n\n{{figure:original-scan}}\n\n{{figure-row:first,second}}\n\n[^a]: A note with *emphasis*.\n  A second line of this note.\n\n{{footnotes}}";
  const output = manager.serialize(manager.parse(original));
  for (const token of ["{{figure:original-scan}}", "{{figure-row:first,second}}", "[^a]", "[^a]: A note with *emphasis*.\n  A second line of this note.", "{{footnotes}}", "**bold**", "https://example.org"]) assert.ok(output.includes(token), `Missing ${token}: ${output}`);
  assert.equal(needsSourceMode("| a | b |\n| -- | -- |"), true);
  assert.equal(needsSourceMode(original), false);
});

test("drafts permit unfinished work, publication asks only for essentials", () => {
  const model = emptySource("A source");
  assert.doesNotThrow(() => validateModel(model));
  assert.ok(publicationProblems(model).length);
  model.document.source_url = "https://example.org/original";
  assert.deepEqual(publicationProblems(model), []);
  model.document.source_url = "javascript:alert(1)";
  assert.throws(() => validateModel(model), /http/);
});

test("SQL drafts stay private; publication is atomic, versioned, and restricted", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$select null::uuid$$; create schema storage; create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint);");
    const schema = await fs.readFile(path.resolve("../scripts/supabase_schema.sql"), "utf8");
    const tables = ["documents", "pages", "files", "people", "document_people", "document_sections", "document_figures", "editor_profiles", "content_revisions", "tags", "document_tags", "collections", "collection_documents", "topics", "topic_documents", "biography_profiles", "bibliography_items", "bibliography_contributors", "bibliography_item_contributors"];
    for (const table of tables) {
      const ddl = schema.match(new RegExp(`create table if not exists ${table} \\([\\s\\S]*?\\n\\);`))?.[0];
      assert.ok(ddl, table); await db.exec(ddl);
    }
    for (const match of schema.matchAll(/alter table (?:documents|document_sections|document_figures) add column if not exists [^;]+;/g)) await db.exec(match[0]);
    const migration = await fs.readFile(path.resolve("../scripts/supabase_cms_workspace.sql"), "utf8");
    await db.exec(migration); await db.exec(migration); // Idempotent setup.
    const id = randomUUID();
    await db.query("insert into documents(id,slug,title,status) values($1,'test-source','Original title','published')", [id]);
    const model = emptySource("Edited title", "https://example.org/original");
    const a = randomUUID(), b = randomUUID();
    model.sections = [{ id: a, heading: "First", position: 10, body: "Edited reading text", body_format: "markdown", section_type: "transcript" }, { id: b, heading: "Second", position: 20, body: "Another part", body_format: "markdown", section_type: "transcript" }];
    const save = (version: number) => db.query("select cms_save_draft($1,$2::jsonb,$3,null) result", [id, JSON.stringify(model), version]);
    const publish = (version: number) => db.query("select cms_publish_source($1,$2,$3::jsonb,null) result", [id, version, JSON.stringify(model)]);
    await save(0);
    assert.equal((await db.query<{ title: string }>("select title from documents where id=$1", [id])).rows[0].title, "Original title");
    await assert.rejects(save(0), /Another editor/);
    await publish(1);
    assert.equal((await db.query<{ title: string }>("select title from documents where id=$1", [id])).rows[0].title, "Edited title");
    assert.equal((await db.query("select * from content_revisions")).rows.length, 1);
    // Reordering must not violate (document_id, position).
    model.sections = [{ ...model.sections[1], position: 10 }, { ...model.sections[0], position: 20 }];
    await save(2); await publish(3);
    assert.deepEqual((await db.query<{ id: string }>("select id from document_sections order by position")).rows.map(s => s.id), [b, a]);
    // Failure late in the transaction must roll back earlier metadata and text writes.
    model.document.title = "Must not become public"; model.tagIds = [randomUUID()];
    await save(4); await assert.rejects(publish(5), /foreign key/);
    assert.equal((await db.query<{ title: string }>("select title from documents where id=$1", [id])).rows[0].title, "Edited title");
    assert.equal((await db.query("select * from content_revisions")).rows.length, 2);
    await db.query("select cms_unpublish_source($1,5,null)", [id]);
    assert.equal((await db.query<{ status: string }>("select status from documents where id=$1", [id])).rows[0].status, "draft");
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from source_working_copies"), /permission denied/);
    await assert.rejects(save(6), /permission denied/);
    await db.exec("reset role");
    // Out-of-band live edits cannot be silently replaced by an old working copy.
    model.tagIds = []; await save(6);
    await db.query("update documents set updated_at=clock_timestamp() where id=$1", [id]);
    await assert.rejects(publish(7), /changed since this draft/);

    const queueMigration = await fs.readFile(path.resolve("../supabase/migrations/20261022193000_shared_candidate_review.sql"), "utf8");
    await db.exec(queueMigration); await db.exec(queueMigration);
    await db.query("insert into corpus_candidate_batches values ('test-batch', '{}')");
    await db.query("insert into corpus_candidates values ('test-candidate', 'test-batch', 1, '{}')");
    const proposal = emptySource("A private nomination", "https://example.org/source");
    proposal.proposal = { status: "proposed", origin: "corpus-scan", rationale: "Review this source", excerpt: "A source excerpt", provenance: { candidate_id: "test-candidate" } };
    const nominate = () => db.query<{ id: string }>("select cms_nominate_candidate('test-candidate', $1::jsonb, null) as id", [JSON.stringify(proposal)]);
    const first = (await nominate()).rows[0].id;
    assert.equal((await nominate()).rows[0].id, first, "Retrying a nomination must not duplicate a draft");
    assert.equal((await db.query<{ status: string }>("select status from documents where id=$1", [first])).rows[0].status, "draft");
    assert.equal((await db.query("select * from source_working_copies where document_id=$1", [first])).rows.length, 1);
    await db.query("insert into corpus_candidate_decisions(candidate_id,batch,payload) values ('test-candidate','test-batch','{\"decision\":\"add\"}'),('test-candidate','test-batch','{\"decision\":\"clear\"}')");
    assert.deepEqual((await db.query<{ payload: { decision: string } }>("select payload from corpus_candidate_decisions order by id")).rows.map(row => row.payload.decision), ["add", "clear"]);
    await db.exec("set role anon");
    for (const table of ["corpus_candidate_batches", "corpus_candidates", "corpus_candidate_decisions", "corpus_workspace_nominations"]) await assert.rejects(db.query(`select * from ${table}`), /permission denied/);
    await assert.rejects(nominate(), /permission denied/);
    await db.exec("reset role");
  } finally { await db.close(); }
});

test("local workspace persists drafts and rejects concurrent overwrites", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "pha-cms-test-"));
  process.env.CMS_WORKSPACE_DIR = directory;
  const { localCreate, localSave, withWorkspace } = await import("../src/lib/cms/local-store");
  try {
    const id = await localCreate("Local source", "https://example.org");
    const model = emptySource("Private title", "https://example.org");
    await localSave(id, model, 0);
    const result = await Promise.allSettled([localSave(id, model, 1), localSave(id, model, 1)]);
    assert.equal(result.filter(r => r.status === "fulfilled").length, 1);
    await localSave(id, model, 2, true);
    model.document.title = "Unpublished change";
    await localSave(id, model, 3);
    const row = await withWorkspace(w => w.rows.find(r => r.id === id)!);
    assert.equal(row.model.document.title, "Unpublished change");
    assert.equal(row.published?.document.title, "Private title");
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
