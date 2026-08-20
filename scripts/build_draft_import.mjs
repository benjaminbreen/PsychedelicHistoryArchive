#!/usr/bin/env node
// Turns data/draft-sources into an import directory the existing uploader understands:
//
//   node scripts/build_draft_import.mjs
//   node scripts/upload_squarespace_to_supabase.mjs --import-dir data/draft-import
//
// Ids are derived from the slug, so re-running updates the same rows rather than
// duplicating them.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith("archive-site") ? path.resolve(process.cwd(), "..") : process.cwd();
const draftDir = path.join(root, "data", "draft-sources");
const sourcesDir = path.join(draftDir, "sources");
const imagesDir = path.join(draftDir, "images");
const outDir = path.join(root, "data", "draft-import");

const TAG_ACRONYMS = new Map(Object.entries({
  airfa: "AIRFA", rfra: "RFRA", mkultra: "MKULTRA", cia: "CIA", fbi: "FBI", dea: "DEA",
  fda: "FDA", nida: "NIDA", nimh: "NIMH", lsd: "LSD", dmt: "DMT", mdma: "MDMA",
  ea: "EA", us: "US", usa: "USA", gpo: "GPO", phs: "PHS", udv: "UDV", ocr: "OCR",
}));

const onlySlugs = new Set(process.argv.slice(2).filter((a) => !a.startsWith("--")));
const publish = process.argv.includes("--publish");

const documents = [];
const documentSections = [];
const people = new Map();
const documentPeople = [];
const tags = new Map();
const documentTags = [];
const assets = [];
const files = [];
const externalSources = [];
const skipped = [];

for (const file of fs.readdirSync(sourcesDir).filter((f) => f.endsWith(".json")).sort()) {
  const draft = JSON.parse(fs.readFileSync(path.join(sourcesDir, file), "utf8"));
  if (onlySlugs.size && !onlySlugs.has(draft.slug)) continue;
  if (draft.draft?.reviewStatus === "rejected") {
    skipped.push(`${draft.slug} (rejected in review)`);
    continue;
  }

  const documentId = uuidFrom(`document:${draft.slug}`);
  const transcript = typeof draft.transcript === "string" ? draft.transcript.trim() : "";
  const hosted = draft.accessType === "hosted" && transcript.length > 0;

  // --- cover image -------------------------------------------------------
  const credit = readJsonIfPresent(path.join(imagesDir, draft.slug, "credit.json"));
  const coverFile = path.join(imagesDir, draft.slug, "cover.jpg");
  let coverPath = null;
  if (credit && fs.existsSync(coverFile)) {
    const localPath = path.join("images", draft.slug, "cover.jpg");
    coverPath = `documents/${documentId}/${localPath.split(path.sep).join("/")}`;
    const target = path.join(outDir, localPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(coverFile, target);
    const bytes = fs.readFileSync(coverFile);
    const checksum = crypto.createHash("sha256").update(bytes).digest("hex");
    const assetId = uuidFrom(`asset:${draft.slug}:cover`);
    assets.push({
      id: assetId,
      document_id: documentId,
      document_slug: draft.slug,
      source_url: credit.fileUrl || credit.sourceUrl || "",
      local_path: localPath.split(path.sep).join("/"),
      storage_path: coverPath,
      kind: "cover_image",
      mime_type: "image/jpeg",
      downloaded: true,
      sha256: checksum,
    });
    files.push({
      id: assetId,
      document_id: documentId,
      page_id: null,
      kind: "cover_image",
      storage_path: coverPath,
      mime_type: "image/jpeg",
      byte_size: bytes.length,
      width: null,
      height: null,
      checksum,
    });
  }

  // --- document ----------------------------------------------------------
  documents.push({
    id: documentId,
    slug: draft.slug,
    title: draft.title,
    short_title: draft.shortTitle || null,
    subtitle: draft.subtitle || null,
    display_date: draft.displayDate,
    date_start: draft.year,
    date_end: draft.year,
    document_type: draft.type,
    medium: draft.medium,
    language: draft.language,
    region: draft.region,
    publication_place: draft.publicationPlace || null,
    publisher: draft.publisher || null,
    summary: draft.summary,
    abstract: draft.summary,
    editorial_note: buildEditorialNote(draft),
    citation: draft.citation,
    rights_statement: draft.rights,
    source_url: draft.sourceUrl,
    external_access_url: draft.draft?.textSource?.url || draft.sourceUrl,
    access_type: draft.accessType,
    hosting_status: hosted ? "transcript_only" : draft.accessType === "external" ? "external_link" : "metadata_only",
    cover_image_path: coverPath,
    thumbnail_path: coverPath,
    is_featured: false,
    // `draft.publish: false` keeps a record in the CMS but off the public site — used for
    // sources superseded by something better already in the archive.
    status: publish && draft.draft?.publish !== false ? "published" : "draft",
    published_at: null,
    content_language: draft.contentLanguage || null,
    translation_language: draft.translationLanguage || null,
    translation_text: draft.translationText || null,
    translation_provider: draft.translationProvider || null,
    translation_note: draft.translationNote || null,
    reader_mode: hosted ? (draft.translationText ? "translation" : "transcript") : "overview",
  });

  // --- sections ----------------------------------------------------------
  let position = 10;
  const sourceNote = buildSourceNote(draft, credit);
  if (sourceNote) {
    documentSections.push(section(documentId, draft.slug, "source_note", "Source note", sourceNote, position));
    position += 10;
  }
  if (transcript) {
    documentSections.push(section(documentId, draft.slug, "transcript", "Transcript", transcript, position));
    position += 10;
  } else if (draft.excerpt) {
    documentSections.push(section(documentId, draft.slug, "note", "Excerpt", `> ${draft.excerpt.trim()}`, position));
    position += 10;
  }

  if (!hosted) {
    externalSources.push({
      id: uuidFrom(`external:${draft.slug}`),
      document_id: documentId,
      repository_name: hostLabel(draft.sourceUrl),
      institution_name: "",
      url: draft.sourceUrl,
      access_label: "Full text at the publisher or host",
      stable_identifier: draft.sourceUrl,
      rights_note: draft.rights,
      is_primary: true,
      last_checked_at: null,
    });
  }

  // --- people ------------------------------------------------------------
  for (const creator of creatorsOf(draft)) {
    const slug = slugify(creator.name);
    if (!slug) continue;
    const personId = uuidFrom(`person:${slug}`);
    if (!people.has(slug)) {
      people.set(slug, {
        id: personId,
        slug,
        name: creator.name,
        sort_name: sortName(creator.name),
        birth_year: creator.birthYear ?? null,
        death_year: creator.deathYear ?? null,
        bio: creator.bio || "",
      });
    }
    documentPeople.push({ document_id: documentId, person_id: personId, role: creator.role });
  }

  // --- tags --------------------------------------------------------------
  const tagRows = [
    ...(draft.substances ?? []).map((name) => ({ name, type: "substance" })),
    ...(draft.tags ?? []).map((name) => ({ name: tagLabel(name), type: "topic" })),
    { name: draft.era, type: "era" },
    ...splitRegions(draft.region).map((name) => ({ name, type: "region" })),
  ].filter((tag) => tag.name);

  for (const tag of tagRows) {
    const slug = slugify(tag.name);
    if (!slug) continue;
    const tagId = uuidFrom(`tag:${slug}`);
    if (!tags.has(slug)) tags.set(slug, { id: tagId, slug, name: tag.name, description: "", tag_type: tag.type });
    documentTags.push({ document_id: documentId, tag_id: tags.get(slug).id });
  }
}

fs.mkdirSync(outDir, { recursive: true });
write("documents", documents);
write("document_sections", documentSections);
write("people", [...people.values()]);
write("document_people", dedupe(documentPeople, (r) => `${r.document_id}:${r.person_id}:${r.role}`));
write("tags", [...tags.values()]);
write("document_tags", dedupe(documentTags, (r) => `${r.document_id}:${r.tag_id}`));
write("assets", assets);
write("files", files);
write("external_sources", externalSources);

console.log(`\n${documents.length} documents -> ${path.relative(root, outDir)}`);
console.log(`  ${documentSections.length} sections, ${people.size} people, ${tags.size} tags, ${assets.length} cover images`);
console.log(`  status: ${publish ? "published" : "draft"} (pass --publish to publish)`);
const missingCover = documents.filter((d) => !d.cover_image_path);
if (missingCover.length) console.log(`  ${missingCover.length} without a cover image: ${missingCover.map((d) => d.slug).join(", ")}`);
if (skipped.length) console.log(`  skipped: ${skipped.join(", ")}`);

// ---------------------------------------------------------------------------

function section(documentId, slug, type, heading, body, position) {
  return {
    id: uuidFrom(`section:${slug}:${type}:${position}`),
    document_id: documentId,
    position,
    heading,
    section_type: type,
    body,
    body_format: "markdown",
  };
}

/**
 * One or two brisk sentences of provenance. The detail — scope, per-word doubts, correction
 * history — stays in data/draft-sources and the admin view rather than on the reading page.
 */
function buildSourceNote(draft, credit) {
  const source = draft.draft?.textSource ?? {};
  const quality = draft.draft?.textQuality ?? {};
  const parts = [];

  if (draft.accessType === "hosted" && source.url) {
    parts.push(`Transcribed for the archive from ${hostLabel(source.url)}.`);
    // A reader landing mid-document should be told it is an excerpt, but briefly. Scope notes
    // written for the admin view are often long; those are left out rather than truncated,
    // since cutting them mid-abbreviation ("108 Stat.") reads worse than omitting them.
    const scope = (source.scope || "").trim();
    if (scope && scope.length <= 190) parts.push(scope.endsWith(".") ? scope : `${scope}.`);
  } else if (draft.sourceUrl) {
    parts.push(`The text of this source stays with its publisher; this record describes and links to it.`);
  }

  const doubts = quality.uncertainReadings?.length ?? 0;
  if (doubts) {
    parts.push(doubts === 1
      ? "One reading is doubtful in the scan and is marked in the text."
      : `${doubts} readings are doubtful in the scan and are marked in the text.`);
  }

  const note = parts.length ? `_${parts.join(" ")}_` : "";
  // Attribution is a licence condition for CC-BY images; public-domain ones need no line here.
  const attribution = credit?.credit && /^cc\s*by/i.test(credit.licence ?? "")
    ? `_Image: ${credit.credit}, ${credit.licence}._`
    : "";
  return [note, attribution].filter(Boolean).join("\n\n");
}

function buildEditorialNote(draft) {
  const quality = draft.draft?.textQuality ?? {};
  const bits = [];
  if (quality.ocrPass && quality.ocrPass !== "none") bits.push(`Text pass: ${quality.ocrPass}.`);
  if (quality.confidence) bits.push(`Transcription confidence: ${quality.confidence}.`);
  if (quality.notes) bits.push(quality.notes);
  return bits.join(" ") || null;
}

function creatorsOf(draft) {
  const raw = draft.creators?.length
    ? draft.creators.map((creator) => ({ ...creator, role: normalizeRole(creator.role) }))
    : splitAuthorString(draft.author);

  return raw
    .map((creator) => ({ ...creator, name: cleanPersonName(creator.name) }))
    .filter((creator) => creator.name.length > 2);
}

function splitAuthorString(author = "") {
  const value = author.trim();
  if (!value || /^(various|anonymous|unknown)$/i.test(value)) return [];
  // An institutional author is one name, however many commas it contains.
  if (isInstitution(value)) return [{ name: value, role: "author" }];
  return value
    .split(/,| and | & /)
    .map((name) => name.trim())
    .filter((name) => name.length > 2 && !/^(et al\.?|jr\.?|sr\.?)$/i.test(name))
    .map((name) => ({ name, role: "author" }));
}

function isInstitution(name) {
  return /\b(congress|committee|subcommittee|bureau|administration|institute|office|department|division|agency|commission|corporation|company|society|senate|house|court|university|press|expedition|merck|sandoz)\b/i.test(name);
}

/** Honorifics belong to the role, not the name: "Justice Antonin Scalia" files under Scalia. */
function cleanPersonName(name = "") {
  return name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/,\s*(administrative law judge|circuit judge|chief justice|associate justice|justice|judge|m\.?d\.?|ph\.?d\.?)\.?$/i, "")
    .replace(/^(the\s+)?(hon\.|honorable|chief justice|associate justice|justice|circuit judge|district judge|administrative law judge|judge|dr\.|prof\.|professor|rev\.|sir|mr\.|mrs\.|ms\.)\s+/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function tagLabel(value) {
  return String(value)
    .split("-")
    .map((word) => TAG_ACRONYMS.get(word.toLowerCase()) ?? (word.toLowerCase() === "v" ? "v." : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function splitRegions(region = "") {
  // Split on semicolons only: "Washington, D.C." and "United States (Oregon)" are single places.
  return region
    .split(";")
    .map((name) => name.trim())
    .filter(Boolean);
}

function normalizeRole(role) {
  const value = (role || "author").toLowerCase();
  return ["author", "translator", "editor", "interviewer", "speaker", "recordist", "photographer"].includes(value) ? value : "author";
}

function hostLabel(url = "") {
  if (!url) return "the source";
  if (url.includes("archive.org")) return "the Internet Archive scan";
  if (url.includes("gutenberg.org")) return "the Project Gutenberg text";
  if (url.includes("wikisource")) return "Wikisource";
  if (url.includes("case.law") || url.includes("courtlistener")) return "the Caselaw Access Project";
  if (url.includes("cia.gov")) return "the CIA Reading Room";
  if (url.includes("govinfo.gov")) return "govinfo.gov";
  if (url.includes("dtic.mil")) return "DTIC";
  if (url.includes("persee.fr")) return "Persée";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "the source";
  }
}

function readJsonIfPresent(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sortName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts.pop();
  return `${last}, ${parts.join(" ")}`;
}

function dedupe(rows, key) {
  const seen = new Map();
  for (const row of rows) seen.set(key(row), row);
  return [...seen.values()];
}

function write(name, rows) {
  fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

function uuidFrom(value) {
  const hash = crypto.createHash("sha1").update(value).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
