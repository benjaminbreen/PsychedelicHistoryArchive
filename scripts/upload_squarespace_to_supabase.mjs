#!/usr/bin/env node
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const require = createRequire(new URL("../archive-site/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const importDirArgIndex = process.argv.lastIndexOf("--import-dir");
const importDir = importDirArgIndex === -1
  ? path.join(root, "data", "squarespace-import")
  : path.resolve(process.cwd(), process.argv[importDirArgIndex + 1]);
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "archive-assets";
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const maxUpsertRowsPerRequest = 250;
const maxUpsertBytesPerRequest = 3_000_000;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Example:");
  console.error("SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload_squarespace_to_supabase.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function readJson(name) {
  const filePath = path.join(importDir, `${name}.json`);
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  return JSON.parse(raw);
}

async function resolveDocumentTranslationFiles(documents) {
  return Promise.all(documents.map(async (document) => {
    const { translation_text_path, ...documentRow } = document;
    if (!translation_text_path) return documentRow;

    const translationTextPath = path.resolve(importDir, translation_text_path);
    const translationText = await fs.readFile(translationTextPath, "utf8");
    return {
      ...documentRow,
      translation_text: translationText.trim(),
    };
  }));
}

async function ensureBucket() {
  const { data: buckets, error: listError } = await runSupabase("storage list buckets", () => supabase.storage.listBuckets());
  if (listError) throw listError;
  if (buckets.some((item) => item.name === bucket)) return;

  const { error } = await runSupabase("storage create bucket", () => supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 1024 * 1024 * 50,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"],
  }));
  if (error) throw error;
}

async function upsertTable(name, rows, onConflict) {
  rows = dedupeRowsForConflict(rows, onConflict);
  if (!rows.length) return;
  const chunks = chunkRowsForUpsert(rows);
  for (const chunk of chunks) {
    const { error } = await runSupabase(`${name} upsert`, () => supabase
      .from(name)
      .upsert(chunk, { onConflict, ignoreDuplicates: false }));
    if (error) throw new Error(`${name}: ${error.message}`);
  }
  console.log(`Upserted ${rows.length} ${name}${chunks.length > 1 ? ` in ${chunks.length} chunks` : ""}`);
}

async function upsertTagsBySlugAndMapDocumentTags(tags, documentTags) {
  if (!tags.length) return documentTags;

  const tagsWithSlugs = tags.filter((tag) => tag.slug);
  const slugs = [...new Set(tagsWithSlugs.map((tag) => tag.slug))];
  const existingTags = await fetchTagsBySlug(slugs);
  const existingBySlug = new Map(existingTags.map((tag) => [tag.slug, tag]));
  const missingTags = tagsWithSlugs.filter((tag) => !existingBySlug.has(tag.slug));

  if (missingTags.length) {
    await upsertTable("tags", missingTags, "id");
  }

  const reconciledTags = await fetchTagsBySlug(slugs);
  const reconciledBySlug = new Map(reconciledTags.map((tag) => [tag.slug, tag]));
  const remoteIdByLocalId = new Map();

  for (const tag of tagsWithSlugs) {
    remoteIdByLocalId.set(tag.id, reconciledBySlug.get(tag.slug)?.id || tag.id);
  }

  console.log(`Reconciled ${tagsWithSlugs.length} tags by slug (${missingTags.length} inserted)`);
  return documentTags.map((row) => ({
    ...row,
    tag_id: remoteIdByLocalId.get(row.tag_id) || row.tag_id,
  }));
}

/**
 * People are keyed by id but constrained unique on slug, so an import that derives its own
 * ids collides with anyone already in the table. Reuse the existing row's id, as with tags.
 */
async function upsertPeopleBySlugAndMapDocumentPeople(people, documentPeople) {
  if (!people.length) return { people, documentPeople };

  const peopleWithSlugs = people.filter((person) => person.slug);
  const slugs = [...new Set(peopleWithSlugs.map((person) => person.slug))];
  const existingBySlug = new Map((await fetchPeopleBySlug(slugs)).map((person) => [person.slug, person.id]));

  const remoteIdByLocalId = new Map();
  const rows = [];
  for (const person of peopleWithSlugs) {
    const id = existingBySlug.get(person.slug) || person.id;
    remoteIdByLocalId.set(person.id, id);
    // Do not overwrite a bio someone has already written by hand.
    rows.push(existingBySlug.has(person.slug) ? { ...person, id, bio: undefined } : { ...person, id });
  }

  console.log(`Reconciled ${peopleWithSlugs.length} people by slug (${peopleWithSlugs.length - existingBySlug.size} new)`);
  return {
    people: rows.map((row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined))),
    documentPeople: documentPeople.map((row) => ({
      ...row,
      person_id: remoteIdByLocalId.get(row.person_id) || row.person_id,
    })),
  };
}

async function fetchPeopleBySlug(slugs) {
  if (!slugs.length) return [];
  const chunkSize = 100;
  const rows = [];

  for (let index = 0; index < slugs.length; index += chunkSize) {
    const chunk = slugs.slice(index, index + chunkSize);
    const { data, error } = await runSupabase("people lookup", () => supabase
      .from("people")
      .select("id, slug")
      .in("slug", chunk));
    if (error) throw new Error(`people lookup: ${error.message}`);
    rows.push(...(data || []));
  }

  return rows;
}

async function fetchTagsBySlug(slugs) {
  if (!slugs.length) return [];
  const chunkSize = 100;
  const rows = [];

  for (let index = 0; index < slugs.length; index += chunkSize) {
    const chunk = slugs.slice(index, index + chunkSize);
    const { data, error } = await runSupabase("tags lookup", () => supabase
      .from("tags")
      .select("id, slug")
      .in("slug", chunk));
    if (error) throw new Error(`tags lookup: ${error.message}`);
    rows.push(...(data || []));
  }

  return rows;
}

async function upsertOptionalTable(name, rows, onConflict) {
  rows = dedupeRowsForConflict(rows, onConflict);
  if (!rows.length) return;
  const chunks = chunkRowsForUpsert(rows);
  for (const chunk of chunks) {
    const { error } = await runSupabase(`${name} upsert`, () => supabase
      .from(name)
      .upsert(chunk, { onConflict, ignoreDuplicates: false }));
    if (error) {
      if (isSchemaMissingError(error.message)) {
        console.warn(`Skipped optional table ${name}: ${error.message}`);
        return;
      }
      throw new Error(`${name}: ${error.message}`);
    }
  }
  console.log(`Upserted ${rows.length} ${name}${chunks.length > 1 ? ` in ${chunks.length} chunks` : ""}`);
}

function dedupeRowsForConflict(rows, onConflict) {
  const keys = onConflict.split(",").map((key) => key.trim()).filter(Boolean);
  if (!keys.length || rows.length < 2) return rows;

  const byConflictKey = new Map();
  for (const row of rows) {
    const conflictKey = keys.map((key) => String(row[key] ?? "")).join("\u0001");
    byConflictKey.set(conflictKey, row);
  }

  return [...byConflictKey.values()];
}

function chunkRowsForUpsert(rows) {
  const chunks = [];
  let chunk = [];
  let chunkBytes = 2;

  for (const row of rows) {
    const rowBytes = Buffer.byteLength(JSON.stringify(row), "utf8") + 1;
    if (
      chunk.length > 0 &&
      (chunk.length >= maxUpsertRowsPerRequest || chunkBytes + rowBytes > maxUpsertBytesPerRequest)
    ) {
      chunks.push(chunk);
      chunk = [];
      chunkBytes = 2;
    }
    chunk.push(row);
    chunkBytes += rowBytes;
  }

  if (chunk.length) chunks.push(chunk);
  return chunks;
}

async function reconcileBibliographyContributors(contributors, itemContributors) {
  if (!contributors.length) {
    return { contributors, itemContributors };
  }

  const slugs = [...new Set(contributors.map((row) => row.slug).filter(Boolean))];
  const existingBySlug = new Map();

  if (slugs.length) {
    const { data, error } = await runSupabase("bibliography_contributors lookup", () => supabase
      .from("bibliography_contributors")
      .select("id, slug")
      .in("slug", slugs));
    if (error) throw new Error(`bibliography_contributors lookup: ${error.message}`);
    for (const row of data ?? []) {
      if (row.slug) existingBySlug.set(row.slug, row.id);
    }
  }

  const contributorIdMap = new Map();
  const dedupedContributors = new Map();
  for (const contributor of contributors) {
    const existingId = contributor.slug ? existingBySlug.get(contributor.slug) : undefined;
    const id = existingId || contributor.id;
    contributorIdMap.set(contributor.id, id);
    dedupedContributors.set(id, { ...contributor, id });
  }

  return {
    contributors: [...dedupedContributors.values()],
    itemContributors: itemContributors.map((row) => ({
      ...row,
      contributor_id: contributorIdMap.get(row.contributor_id) || row.contributor_id,
    })),
  };
}

function isSchemaMissingError(message = "") {
  return message.includes("Could not find the table") || message.includes("schema cache") || message.includes("does not exist");
}

async function upsertCollectionDocuments(rows) {
  if (!rows.length) return;
  const { error } = await runSupabase("collection_documents upsert", () => supabase
    .from("collection_documents")
    .upsert(rows, { onConflict: "collection_id,document_id", ignoreDuplicates: false }));

  if (!error) {
    console.log(`Upserted ${rows.length} collection_documents`);
    return;
  }

  if (!isSchemaCacheColumnError(error.message)) {
    throw new Error(`collection_documents: ${error.message}`);
  }

  const legacyRows = rows.map(({ collection_id, document_id, position, editorial_caption }) => ({
    collection_id,
    document_id,
    position,
    editorial_caption
  }));
  const { error: legacyError } = await runSupabase("collection_documents legacy upsert", () => supabase
    .from("collection_documents")
    .upsert(legacyRows, { onConflict: "collection_id,document_id", ignoreDuplicates: false }));
  if (legacyError) throw new Error(`collection_documents: ${legacyError.message}`);
  console.log(`Upserted ${legacyRows.length} collection_documents using legacy join-table shape`);
}

function isSchemaCacheColumnError(message = "") {
  return message.includes("schema cache") || message.includes("Could not find the");
}

async function uploadAssets(assets) {
  if (!assets.length) {
    console.log("No assets to upload");
    return;
  }

  await ensureBucket();
  for (const asset of assets) {
    const filePath = path.join(importDir, asset.local_path);
    const body = await fs.readFile(filePath);
    const { error } = await runSupabase(`storage ${asset.storage_path}`, () => supabase.storage
      .from(bucket)
      .upload(asset.storage_path, body, {
        contentType: asset.mime_type || "application/octet-stream",
        cacheControl: "31536000",
        upsert: true,
      }));
    if (error) throw new Error(`storage ${asset.storage_path}: ${error.message}`);
  }
  console.log(`Uploaded ${assets.length} assets to storage bucket ${bucket}`);
}

async function runSupabase(label, operation, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await operation();
      if (isTransientSupabaseError(result?.error) && attempt < attempts) {
        lastError = result.error;
        console.warn(`Retrying ${label} after transient error: ${result.error.message}`);
        await delay(1000 * attempt);
        continue;
      }
      return result;
    } catch (error) {
      lastError = error;
      if (!isTransientSupabaseError(error) || attempt === attempts) throw error;
      console.warn(`Retrying ${label} after transient error: ${error.message || String(error)}`);
      await delay(1000 * attempt);
    }
  }
  throw lastError;
}

function isTransientSupabaseError(error) {
  const message = error?.message || String(error || "");
  return /fetch failed|network|timeout|timed out|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(message);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Using import directory: ${importDir}`);
  const documents = await resolveDocumentTranslationFiles(await readJson("documents"));
  const collections = await readJson("collections");
  const collectionDocuments = await readJson("collection_documents");
  const pages = await readJson("pages");
  const pageLines = await readJson("page_lines");
  const files = await readJson("files");
  const externalSources = await readJson("external_sources");
  let people = await readJson("people");
  let documentPeople = await readJson("document_people");
  const documentSections = await readJson("document_sections");
  const documentFigures = await readJson("document_figures");
  const bibliographyItems = await readJson("bibliography_items");
  let bibliographyContributors = await readJson("bibliography_contributors");
  let bibliographyItemContributors = await readJson("bibliography_item_contributors");
  const bibliographyItemAliases = await readJson("bibliography_item_aliases");
  const bibliographyItemDocuments = await readJson("bibliography_item_documents");
  const documentCitationLinks = await readJson("document_citation_links");
  const tags = await readJson("tags");
  const documentTags = await readJson("document_tags");
  const assets = await readJson("assets");
  let mappedDocumentTags = documentTags;

  console.log(`Loaded ${documents.length} documents, ${collections.length} collections, ${collectionDocuments.length} collection links, ${pages.length} pages, ${pageLines.length} page lines, ${files.length} files, ${documentSections.length} sections, ${documentFigures.length} figures, ${bibliographyItems.length} bibliography items, ${documentCitationLinks.length} citation links, ${assets.length} assets`);

  await uploadAssets(assets);
  ({ contributors: bibliographyContributors, itemContributors: bibliographyItemContributors } =
    await reconcileBibliographyContributors(bibliographyContributors, bibliographyItemContributors));

  await upsertTable("collections", collections, "id");
  await upsertTable("documents", documents, "id");
  await upsertTable("pages", pages, "id");
  await upsertTable("page_lines", pageLines, "id");
  await upsertTable("files", files, "id");
  await upsertTable("external_sources", externalSources, "id");
  ({ people, documentPeople } = await upsertPeopleBySlugAndMapDocumentPeople(people, documentPeople));
  await upsertTable("people", people, "id");
  await upsertTable("bibliography_items", bibliographyItems, "id");
  await upsertTable("bibliography_contributors", bibliographyContributors, "id");
  await upsertTable("document_sections", documentSections, "id");
  await upsertTable("document_figures", documentFigures, "id");
  mappedDocumentTags = await upsertTagsBySlugAndMapDocumentTags(tags, documentTags);
  await upsertTable("document_people", documentPeople, "document_id,person_id,role");
  await upsertTable("bibliography_item_contributors", bibliographyItemContributors, "bibliography_item_id,contributor_id,role");
  await upsertOptionalTable("bibliography_item_aliases", bibliographyItemAliases, "bibliography_item_id,normalized_alias");
  await upsertTable("bibliography_item_documents", bibliographyItemDocuments, "bibliography_item_id,document_id");
  await upsertOptionalTable("document_citation_links", documentCitationLinks, "document_id,normalized_citation,bibliography_item_id");
  await upsertTable("document_tags", mappedDocumentTags, "document_id,tag_id");
  await upsertCollectionDocuments(collectionDocuments);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
