#!/usr/bin/env node
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(new URL("../archive-site/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "data", "bibliography-seed", "items.json");
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
const items = JSON.parse(await fs.readFile(seedPath, "utf8"));

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function upsertOrThrow(table, rows, onConflict) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict, ignoreDuplicates: false });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`Upserted ${rows.length} ${table}`);
}

const itemRows = items.map(({ contributors, tags, eras, document_slugs, ...item }) => item);
await upsertOrThrow("bibliography_items", itemRows, "id");

const contributorRowsBySlug = new Map();
for (const item of items) {
  for (const contributor of item.contributors || []) {
    const slug = slugify(contributor.display_name);
    contributorRowsBySlug.set(slug, {
      display_name: contributor.display_name,
      family_name: contributor.family_name || null,
      given_name: contributor.given_name || null,
      slug
    });
  }
}
await upsertOrThrow("bibliography_contributors", [...contributorRowsBySlug.values()], "slug");

const { data: contributors, error: contributorsError } = await supabase
  .from("bibliography_contributors")
  .select("id, slug");
if (contributorsError) throw contributorsError;
const contributorIdBySlug = new Map(contributors.map((item) => [item.slug, item.id]));

const itemContributors = [];
const itemEras = [];
const itemTags = [];
const itemDocuments = [];

const tagSlugs = [...new Set(items.flatMap((item) => item.tags || []))];
const { data: tags, error: tagsError } = await supabase
  .from("tags")
  .select("id, slug")
  .in("slug", tagSlugs);
if (tagsError) throw tagsError;
const tagIdBySlug = new Map(tags.map((item) => [item.slug, item.id]));

const documentSlugs = [...new Set(items.flatMap((item) => item.document_slugs || []))];
const { data: documents, error: documentsError } = documentSlugs.length
  ? await supabase.from("documents").select("id, slug").in("slug", documentSlugs)
  : { data: [], error: null };
if (documentsError) throw documentsError;
const documentIdBySlug = new Map(documents.map((item) => [item.slug, item.id]));

for (const item of items) {
  for (const contributor of item.contributors || []) {
    const contributorId = contributorIdBySlug.get(slugify(contributor.display_name));
    if (!contributorId) continue;
    itemContributors.push({
      bibliography_item_id: item.id,
      contributor_id: contributorId,
      role: contributor.role || "author",
      position: contributor.position || 1
    });
  }
  for (const [index, eraSlug] of (item.eras || []).entries()) {
    itemEras.push({ bibliography_item_id: item.id, era_slug: eraSlug, position: index + 1 });
  }
  for (const tagSlug of item.tags || []) {
    const tagId = tagIdBySlug.get(tagSlug);
    if (tagId) itemTags.push({ bibliography_item_id: item.id, tag_id: tagId });
  }
  for (const documentSlug of item.document_slugs || []) {
    const documentId = documentIdBySlug.get(documentSlug);
    if (documentId) itemDocuments.push({ bibliography_item_id: item.id, document_id: documentId, relationship_label: "Discusses this source" });
  }
}

await upsertOrThrow("bibliography_item_contributors", itemContributors, "bibliography_item_id,contributor_id,role");
await upsertOrThrow("bibliography_item_eras", itemEras, "bibliography_item_id,era_slug");
await upsertOrThrow("bibliography_item_tags", itemTags, "bibliography_item_id,tag_id");
await upsertOrThrow("bibliography_item_documents", itemDocuments, "bibliography_item_id,document_id");
