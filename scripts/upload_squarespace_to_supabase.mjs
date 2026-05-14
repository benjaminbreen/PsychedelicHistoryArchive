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
const importDirArgIndex = process.argv.indexOf("--import-dir");
const importDir = importDirArgIndex === -1
  ? path.join(root, "data", "squarespace-import")
  : path.resolve(process.cwd(), process.argv[importDirArgIndex + 1]);
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "archive-assets";
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;
  if (buckets.some((item) => item.name === bucket)) return;

  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 1024 * 1024 * 50,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"],
  });
  if (error) throw error;
}

async function upsertTable(name, rows, onConflict) {
  if (!rows.length) return;
  const { error } = await supabase
    .from(name)
    .upsert(rows, { onConflict, ignoreDuplicates: false });
  if (error) throw new Error(`${name}: ${error.message}`);
  console.log(`Upserted ${rows.length} ${name}`);
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
    const { error } = await supabase.storage
      .from(bucket)
      .upload(asset.storage_path, body, {
        contentType: asset.mime_type || "application/octet-stream",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) throw new Error(`storage ${asset.storage_path}: ${error.message}`);
  }
  console.log(`Uploaded ${assets.length} assets to storage bucket ${bucket}`);
}

async function main() {
  console.log(`Using import directory: ${importDir}`);
  const documents = await readJson("documents");
  const pages = await readJson("pages");
  const files = await readJson("files");
  const externalSources = await readJson("external_sources");
  const people = await readJson("people");
  const documentPeople = await readJson("document_people");
  const tags = await readJson("tags");
  const documentTags = await readJson("document_tags");
  const assets = await readJson("assets");

  console.log(`Loaded ${documents.length} documents, ${pages.length} pages, ${files.length} files, ${assets.length} assets`);

  await uploadAssets(assets);

  await upsertTable("documents", documents, "id");
  await upsertTable("pages", pages, "id");
  await upsertTable("files", files, "id");
  await upsertTable("external_sources", externalSources, "id");
  await upsertTable("people", people, "id");
  await upsertTable("tags", tags, "id");
  await upsertTable("document_people", documentPeople, "document_id,person_id,role");
  await upsertTable("document_tags", documentTags, "document_id,tag_id");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
