#!/usr/bin/env node
// Fetch freely licensed portrait thumbnails from Wikipedia/Wikimedia Commons for
// people in the archive. Only accepts pages whose Wikidata item is a human (Q5)
// and whose lead image lives on Commons (so fair-use enwiki uploads are skipped).
//
// Usage:
//   node scripts/fetch_wikipedia_portraits.mjs            # all people missing a portrait
//   node scripts/fetch_wikipedia_portraits.mjs --force    # refetch everything
//   node scripts/fetch_wikipedia_portraits.mjs --only "Alan Watts"
//
// Writes images to archive-site/public/images/bios/wiki/<slug>.jpg and a manifest
// at archive-site/src/lib/generated/wikipedia-portraits.json. Overrides go in
// data/wikipedia-portrait-overrides.json: { "<slug>": "Wikipedia title" | null }.

import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const imageDir = path.join(root, "archive-site/public/images/bios/wiki");
const manifestPath = path.join(root, "archive-site/src/lib/generated/wikipedia-portraits.json");
const overridesPath = path.join(root, "data/wikipedia-portrait-overrides.json");
const UA = "PsychedelicHistoryArchive/0.1 (bebreen@ucsc.edu)";
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

function slugify(name) {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch { return fallback; }
}

async function loadEnv() {
  const text = await fs.readFile(path.join(root, "archive-site/.env.local"), "utf8").catch(() => "");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, attempt = 0) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status === 429 && attempt < 5) { await sleep(5000 * 2 ** attempt); return getJson(url, attempt + 1); }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function loadPeople() {
  if (only) return [only];
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${url}/rest/v1/people?select=name&limit=5000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Supabase people fetch failed: ${res.status}`);
  return [...new Set((await res.json()).map((row) => row.name?.trim()).filter(Boolean))];
}

async function lookup(name, titleOverride) {
  const params = new URLSearchParams({
    action: "query", format: "json", redirects: "1", prop: "pageimages|pageprops",
    piprop: "name|thumbnail", pithumbsize: "400", ppprop: "wikibase_item|disambiguation"
  });
  if (titleOverride) params.set("titles", titleOverride);
  else { params.set("generator", "search"); params.set("gsrsearch", name); params.set("gsrlimit", "1"); }
  const data = await getJson(`https://en.wikipedia.org/w/api.php?${params}`);
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined || page.pageprops?.disambiguation !== undefined) return { skip: "no page" };
  // Search hits must share the surname and first name (or initial) to avoid grabbing a random article.
  const parts = slugify(name).split("-");
  const titleParts = slugify(page.title).split("-");
  const firstOk = titleParts[0] === parts[0] || (parts[0].length === 1 && titleParts[0][0] === parts[0]);
  if (!titleOverride && (!titleParts.includes(parts.at(-1)) || !firstOk)) return { skip: `mismatch: ${page.title}` };
  if (!page.thumbnail || !page.pageimage) return { skip: `no image: ${page.title}` };

  const qid = page.pageprops?.wikibase_item;
  if (qid) {
    const wd = await getJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=${qid}&property=P31`);
    const isHuman = (wd.claims?.P31 ?? []).some((c) => c.mainsnak?.datavalue?.value?.id === "Q5");
    if (!isHuman) return { skip: `not a person: ${page.title}` };
  }

  const meta = await getJson(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: "query", format: "json", titles: `File:${page.pageimage}`, prop: "imageinfo", iiprop: "extmetadata|url", iiurlwidth: "400"
  })}`);
  const info = Object.values(meta.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!info) return { skip: `not on Commons (likely fair use): ${page.title}` };
  const strip = (v) => (v ?? "").replace(/<[^>]+>/g, "").trim();
  return {
    title: page.title,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    thumbUrl: info.thumburl ?? page.thumbnail.source,
    commonsUrl: info.descriptionurl,
    license: strip(info.extmetadata?.LicenseShortName?.value),
    artist: strip(info.extmetadata?.Artist?.value).slice(0, 200)
  };
}

await loadEnv();
await fs.mkdir(imageDir, { recursive: true });
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
const manifest = await readJson(manifestPath, {});
const overrides = await readJson(overridesPath, {});
const people = await loadPeople();
const existing = new Set((await fs.readdir(path.join(root, "archive-site/public/images/bios"))).map((f) => f.replace(/\.\w+$/, "")));
let added = 0;

for (const name of people) {
  const slug = slugify(name);
  if (overrides[slug] === null) { delete manifest[slug]; continue; }
  if (!force && (manifest[slug] || existing.has(slug))) continue;
  try {
    const hit = await lookup(name, overrides[slug]);
    if (hit.skip) { console.log(`- ${name}: ${hit.skip}`); continue; }
    const res = await fetch(hit.thumbUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`image ${res.status}`);
    await fs.writeFile(path.join(imageDir, `${slug}.jpg`), Buffer.from(await res.arrayBuffer()));
    const { thumbUrl, ...rest } = hit;
    manifest[slug] = { name, imagePath: `/images/bios/wiki/${slug}.jpg`, ...rest };
    added += 1;
    console.log(`+ ${name} -> ${hit.title} (${hit.license})`);
  } catch (error) {
    console.log(`! ${name}: ${error.message}`);
  }
  await sleep(1000);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await fs.writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`\n${added} added, ${Object.keys(sorted).length} total in manifest.`);
