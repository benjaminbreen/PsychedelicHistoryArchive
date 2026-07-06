#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const requireFromArchiveSite = createRequire(new URL("../archive-site/package.json", import.meta.url));

loadLocalEnvFiles();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const embeddingDimensions = Number.parseInt(process.env.OPENAI_EMBEDDING_DIMENSIONS || "1536", 10);
const isDryRun = process.argv.includes("--dry-run");
const limitArg = readArg("--limit");
const documentLimit = limitArg ? Number.parseInt(limitArg, 10) : undefined;

let supabaseClient;

const DOCUMENT_SELECT = `
  id,
  slug,
  title,
  short_title,
  subtitle,
  display_date,
  date_start,
  document_type,
  medium,
  language,
  region,
  publication_title,
  publisher,
  summary,
  abstract,
  citation,
  source_kind,
  translation_text,
  translation_language,
  content_language,
  updated_at,
  document_sections(id, position, heading, section_type, body, body_format, updated_at),
  pages(id, page_number, label, ocr_text, updated_at),
  document_tags(tags(name, tag_type, status)),
  document_people(role, people(name))
`;

async function main() {
  validateConfig();
  const documents = await loadDocuments();
  const chunks = documents.flatMap(buildSearchChunks);
  const existing = isDryRun ? new Map() : await loadExistingChunks(documents.map((document) => document.id));
  const chunkKeys = new Set(chunks.map((chunk) => chunk.stable_key));
  const staleKeys = [...existing.keys()].filter((key) => !chunkKeys.has(key));
  const changedChunks = chunks.filter((chunk) => {
    const prior = existing.get(chunk.stable_key);
    return !prior || prior.content_hash !== chunk.content_hash || prior.embedding_model !== embeddingModel;
  });

  console.log(`Loaded ${documents.length} published documents.`);
  console.log(`Built ${chunks.length} search chunks.`);
  console.log(`${changedChunks.length} chunks need embedding/upsert; ${staleKeys.length} stale chunks need deletion.`);

  if (isDryRun) {
    printChunkSample(chunks);
    return;
  }

  if (staleKeys.length) {
    await deleteStaleChunks(staleKeys);
  }

  for (const batch of chunkArray(changedChunks, 64)) {
    const embeddings = await embedTexts(batch.map((chunk) => chunk.chunk_text));
    const rows = batch.map((chunk, index) => ({
      ...chunk,
      embedding: vectorLiteral(embeddings[index]),
      embedding_model: embeddingModel,
      updated_at: new Date().toISOString(),
    }));
    await upsertChunks(rows);
    console.log(`Indexed ${rows.length} chunks.`);
  }

  console.log("Search index refresh complete.");
}

function validateConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  if (!isDryRun && !openaiApiKey) {
    console.error("Missing OPENAI_API_KEY. Use --dry-run to inspect chunks without embedding.");
    process.exit(1);
  }

  if (!Number.isFinite(embeddingDimensions) || embeddingDimensions <= 0) {
    console.error("OPENAI_EMBEDDING_DIMENSIONS must be a positive integer.");
    process.exit(1);
  }
}

function loadLocalEnvFiles() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.join(scriptDir, "..");
  const archiveSiteRoot = path.join(repoRoot, "archive-site");
  for (const filePath of [path.join(repoRoot, ".env.local"), path.join(archiveSiteRoot, ".env.local")]) {
    loadEnvFile(filePath);
  }
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const assignment = trimmed.replace(/^export\s+/, "");
    const equalsIndex = assignment.indexOf("=");
    if (equalsIndex <= 0) continue;

    const key = assignment.slice(0, equalsIndex).trim();
    if (process.env[key]) continue;

    process.env[key] = unquoteEnvValue(assignment.slice(equalsIndex + 1).trim());
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

async function loadDocuments() {
  let query = getSupabaseClient()
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("status", "published")
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (documentLimit && documentLimit > 0) {
    query = query.limit(documentLimit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`documents: ${error.message}`);
  return data ?? [];
}

async function loadExistingChunks(documentIds) {
  const existing = new Map();
  for (const ids of chunkArray(documentIds, 100)) {
    const { data, error } = await getSupabaseClient()
      .from("search_chunks")
      .select("stable_key, content_hash, embedding_model")
      .in("document_id", ids);
    if (error) throwSearchSchemaError("search_chunks lookup", error.message);
    for (const row of data ?? []) {
      existing.set(row.stable_key, row);
    }
  }
  return existing;
}

async function deleteStaleChunks(stableKeys) {
  for (const keys of chunkArray(stableKeys, 200)) {
    const { error } = await getSupabaseClient()
      .from("search_chunks")
      .delete()
      .in("stable_key", keys);
    if (error) throwSearchSchemaError("search_chunks delete", error.message);
  }
}

async function upsertChunks(rows) {
  for (const batch of chunkArray(rows, 100)) {
    const { error } = await getSupabaseClient()
      .from("search_chunks")
      .upsert(batch, { onConflict: "stable_key", ignoreDuplicates: false });
    if (error) throwSearchSchemaError("search_chunks upsert", error.message);
  }
}

function throwSearchSchemaError(context, message) {
  if (isSearchSchemaMissing(message)) {
    throw new Error(`${context}: search index schema is not installed. Apply scripts/supabase_schema.sql to Supabase, then rerun npm run search:index.`);
  }
  throw new Error(`${context}: ${message}`);
}

function isSearchSchemaMissing(message = "") {
  return message.includes("search_chunks") && (
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("Could not find the table")
  );
}

function getSupabaseClient() {
  if (!supabaseClient) {
    const { createClient } = requireFromArchiveSite("@supabase/supabase-js");
    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

export function buildSearchChunks(document) {
  const tags = relationNames(document.document_tags, "tags")
    .filter((tag) => !["draft", "archived"].includes(tag.status || "published"))
    .map((tag) => tag.name)
    .filter(Boolean);
  const people = relationNames(document.document_people, "people")
    .map((person) => person.name)
    .filter(Boolean);
  const title = [document.title, document.subtitle].filter(Boolean).join(": ");
  const metadataText = normalizeText([
    document.display_date,
    document.document_type,
    document.medium,
    document.language,
    document.region,
    document.publication_title,
    document.publisher,
    people.length ? `People: ${people.join(", ")}` : "",
    tags.length ? `Topics: ${tags.join(", ")}` : "",
  ].filter(Boolean).join("\n"));
  const chunks = [
    makeChunk({
      document,
      stableKey: `${document.id}:metadata`,
      kind: "metadata",
      title,
      metadataText,
      text: [
        title,
        metadataText,
        document.summary,
        document.abstract,
        document.citation,
      ].filter(Boolean).join("\n\n"),
      href: `/archive/${document.slug}`,
    }),
  ];

  for (const section of sortedByPosition(document.document_sections)) {
    const body = normalizeText(stripMarkdown(section.body || ""));
    if (!body) continue;
    splitText(body).forEach((text, index) => {
      chunks.push(makeChunk({
        document,
        stableKey: `${document.id}:section:${section.id}:${index}`,
        kind: section.section_type === "translation" ? "translation" : "section",
        title: section.heading ? `${title} - ${section.heading}` : title,
        metadataText,
        text,
        sectionId: section.id,
        href: `/archive/${document.slug}#${markdownHeadingId(section.heading || "Transcript")}`,
      }));
    });
  }

  const translation = normalizeText(stripMarkdown(document.translation_text || ""));
  if (translation) {
    splitText(translation).forEach((text, index) => {
      chunks.push(makeChunk({
        document,
        stableKey: `${document.id}:translation:${index}`,
        kind: "translation",
        title: `${title} - Translation`,
        metadataText,
        text,
        href: `/archive/${document.slug}?tab=translation`,
      }));
    });
  }

  for (const page of sortedPages(document.pages)) {
    const pageText = normalizeText(stripMarkdown(page.ocr_text || ""));
    if (!pageText) continue;
    splitText(pageText).forEach((text, index) => {
      chunks.push(makeChunk({
        document,
        stableKey: `${document.id}:page:${page.id}:${index}`,
        kind: "page",
        title: `${title} - Page ${page.label || page.page_number || ""}`.trim(),
        metadataText,
        text,
        pageId: page.id,
        pageLabel: page.label || String(page.page_number || ""),
        href: `/archive/${document.slug}?page=${encodeURIComponent(page.label || String(page.page_number || ""))}`,
      }));
    });
  }

  return chunks.filter((chunk) => chunk.chunk_text.length >= 20);
}

function makeChunk({ document, href, kind, metadataText, pageId, pageLabel, sectionId, stableKey, text, title }) {
  const chunkText = normalizeText(text);
  return {
    document_id: document.id,
    page_id: pageId || null,
    section_id: sectionId || null,
    stable_key: stableKey,
    chunk_kind: kind,
    source_slug: document.slug,
    title: normalizeText(title || document.title),
    metadata_text: metadataText || null,
    chunk_text: chunkText,
    page_label: pageLabel || null,
    line_start: null,
    line_end: null,
    href,
    content_hash: hashText([stableKey, kind, title, metadataText, chunkText].join("\n")),
  };
}

async function embedTexts(texts) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: embeddingModel,
      dimensions: embeddingDimensions,
      input: texts,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI embeddings request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const embeddings = payload.data
    ?.sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error("OpenAI embeddings response did not include one embedding per input.");
  }
  for (const embedding of embeddings) {
    if (!Array.isArray(embedding) || embedding.length !== embeddingDimensions) {
      throw new Error(`Expected ${embeddingDimensions}-dimension embeddings; received ${embedding?.length ?? "unknown"}.`);
    }
  }
  return embeddings;
}

function vectorLiteral(values) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

function splitText(value, maxWords = 650, overlapWords = 80) {
  const words = normalizeText(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [words.join(" ")].filter(Boolean);

  const chunks = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start = Math.max(end - overlapWords, start + 1);
  }
  return chunks;
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/{{\s*(?:figure|figure-row|figures|gallery|footnotes)[^}]*}}/gi, " ")
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_`>#]/g, " ");
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function markdownHeadingId(text) {
  const normalized = String(text || "")
    .replace(/[*_`]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `section-${normalized || "untitled"}`;
}

function relationNames(rows = [], key) {
  return rows.flatMap((row) => {
    const value = row?.[key];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
}

function sortedByPosition(rows = []) {
  return [...rows].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function sortedPages(rows = []) {
  return [...rows].sort((a, b) => (a.page_number ?? 0) - (b.page_number ?? 0));
}

function hashText(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function chunkArray(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function printChunkSample(chunks) {
  for (const chunk of chunks.slice(0, 8)) {
    console.log(`- ${chunk.chunk_kind} ${chunk.stable_key}: ${chunk.chunk_text.slice(0, 120)}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
