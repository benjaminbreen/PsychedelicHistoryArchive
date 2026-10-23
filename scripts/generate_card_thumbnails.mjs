#!/usr/bin/env node
// Generates small WebP card thumbnails for document cover images and points
// documents.thumbnail_path at them. List rows, home cards and collection grids
// use thumbnail_path; the reader keeps cover_image_path at full size.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate_card_thumbnails.mjs [--dry-run] [--force] [--slug <slug>]
//
// Rerunnable: documents whose thumbnail_path already points at a generated
// thumbnail for their current cover are skipped unless --force is given.
import { createRequire } from "node:module";
import process from "node:process";

const require = createRequire(new URL("../archive-site/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "archive-assets";
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const slugArgIndex = process.argv.indexOf("--slug");
const onlySlug = slugArgIndex === -1 ? undefined : process.argv[slugArgIndex + 1];

const THUMB_SUFFIX = "-thumb.webp";
const MAX_WIDTH = 320;
const MAX_HEIGHT = 480;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function thumbnailPathFor(originalPath) {
  return `${originalPath.replace(/\.[^./]+$/, "")}${THUMB_SUFFIX}`;
}

function originalPathFor(document) {
  if (document.cover_image_path) return document.cover_image_path;
  if (document.thumbnail_path && !document.thumbnail_path.endsWith(THUMB_SUFFIX)) return document.thumbnail_path;
  return document.files?.find((file) => file.kind === "cover_image" && file.storage_path)?.storage_path;
}

async function makeThumbnail(originalPath) {
  const { data, error } = await supabase.storage.from(bucket).download(originalPath);
  if (error) throw new Error(`download ${originalPath}: ${error.message}`);
  const input = Buffer.from(await data.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 65 })
    .toBuffer();
  return { inputBytes: input.length, output };
}

async function main() {
  let query = supabase
    .from("documents")
    .select("id, slug, cover_image_path, thumbnail_path, files(storage_path, kind)")
    .order("slug");
  if (onlySlug) query = query.eq("slug", onlySlug);
  const { data: documents, error } = await query;
  if (error) throw error;

  const counts = { generated: 0, skipped: 0, missing: 0, failed: 0 };
  for (const document of documents) {
    const originalPath = originalPathFor(document);
    if (!originalPath) {
      counts.missing += 1;
      continue;
    }
    const targetPath = thumbnailPathFor(originalPath);
    if (!force && document.thumbnail_path === targetPath) {
      counts.skipped += 1;
      continue;
    }

    try {
      const { inputBytes, output } = await makeThumbnail(originalPath);
      const summary = `${document.slug}: ${Math.round(inputBytes / 1024)} KB -> ${Math.round(output.length / 1024)} KB`;
      if (dryRun) {
        console.log(`[dry run] ${summary}`);
        counts.generated += 1;
        continue;
      }
      const { error: uploadError } = await supabase.storage.from(bucket).upload(targetPath, output, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
      if (uploadError) throw new Error(`upload ${targetPath}: ${uploadError.message}`);
      // Keep the full image reachable as the cover before repointing thumbnail_path.
      const { error: updateError } = await supabase
        .from("documents")
        .update({ thumbnail_path: targetPath, cover_image_path: document.cover_image_path || originalPath })
        .eq("id", document.id);
      if (updateError) throw new Error(`update ${document.slug}: ${updateError.message}`);
      console.log(summary);
      counts.generated += 1;
    } catch (thumbError) {
      console.error(`${document.slug}: ${thumbError.message}`);
      counts.failed += 1;
    }
  }

  console.log(`${dryRun ? "[dry run] " : ""}generated ${counts.generated}, skipped ${counts.skipped}, no image ${counts.missing}, failed ${counts.failed}`);
  if (counts.failed) process.exitCode = 1;
}

await main();
