#!/usr/bin/env node
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const require = createRequire(new URL("../archive-site/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

loadEnv(".env.local");
loadEnv("archive-site/.env.local");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const CORE_TOPIC_NAMES = [
  "Ayahuasca",
  "Kava",
  "Psilocybin",
  "Nitrous Oxide",
  "Mescaline",
  "Mysticism",
  "Ethnobotany",
  "Cannabis",
  "Pharmacology",
  "Chemistry",
  "Clinical",
  "Indigenous Knowledge",
  "Anthropology",
  "Consciousness",
  "Psychology",
  "Addiction",
  "LSD",
  "DMT",
  "Anesthesia",
  "Therapy",
  "Counterculture",
  "Law",
  "Military",
  "Intelligence",
  "Government Research",
  "MKULTRA",
  "Literature",
  "Psychoanalysis",
  "PTSD",
  "Oral History"
];
const CORE_TOPIC_SLUGS = new Set(CORE_TOPIC_NAMES.map(slugify));

let { data: tags, error: tagsError } = await supabase
  .from("tags")
  .select("id, slug, name, description, tag_type, status")
  .order("name", { ascending: true });

if (tagsError && tagsError.message.includes("tags.status")) {
  const legacyResult = await supabase
    .from("tags")
    .select("id, slug, name, description, tag_type")
    .order("name", { ascending: true });
  tags = legacyResult.data?.map((tag) => ({ ...tag, status: "published" })) ?? null;
  tagsError = legacyResult.error;
}

if (tagsError) throw new Error(tagsError.message);

const { data: documentTags, error: documentTagsError } = await supabase
  .from("document_tags")
  .select("tag_id, document_id, documents(id, title, date_start, status)");

if (documentTagsError) throw new Error(documentTagsError.message);

let topicCount = 0;
let membershipCount = 0;
let demotedTopicCount = await demoteNonCoreTopics();

for (const tag of tags ?? []) {
  if (!tag?.name || tag.status === "archived") continue;

  const slug = tag.slug || slugify(tag.name);
  if (!CORE_TOPIC_SLUGS.has(slug)) continue;

  const topicPayload = {
    slug,
    name: tag.name,
    dek: tag.description || defaultDek(tag.name),
    icon: iconForSlug(slug),
    status: tag.status === "draft" ? "draft" : "published",
    updated_at: new Date().toISOString()
  };

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .upsert(topicPayload, { onConflict: "slug", ignoreDuplicates: false })
    .select("id")
    .single();

  if (topicError) throw new Error(topicError.message);
  topicCount += 1;

  const linkedDocuments = (documentTags ?? [])
    .filter((link) => link.tag_id === tag.id)
    .map((link) => ({
      documentId: link.document_id,
      document: firstRelated(link.documents)
    }))
    .filter((link) => link.documentId && link.document?.status === "published")
    .sort((a, b) => (a.document?.date_start ?? 0) - (b.document?.date_start ?? 0) || String(a.document?.title ?? "").localeCompare(String(b.document?.title ?? "")));

  if (!linkedDocuments.length) continue;

  const memberships = linkedDocuments.map((link, index) => ({
    topic_id: topic.id,
    document_id: link.documentId,
    position: index + 1,
    is_featured: index < 3,
    relationship_label: null,
    editorial_note: null,
    updated_at: new Date().toISOString()
  }));

  const { error: membershipError } = await supabase
    .from("topic_documents")
    .upsert(memberships, { onConflict: "topic_id,document_id", ignoreDuplicates: false });

  if (membershipError) throw new Error(membershipError.message);
  membershipCount += memberships.length;
}

console.log(`Seeded ${topicCount} core topics and ${membershipCount} topic-document memberships.`);
console.log(`Demoted ${demotedTopicCount} non-core topics to draft.`);

async function demoteNonCoreTopics() {
  const { data: topics, error } = await supabase
    .from("topics")
    .select("id, slug, status");
  if (error) throw new Error(error.message);

  let count = 0;
  for (const topic of topics ?? []) {
    if (!topic?.slug || CORE_TOPIC_SLUGS.has(topic.slug) || topic.status !== "published") continue;
    const { error: updateError } = await supabase
      .from("topics")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", topic.id);
    if (updateError) throw new Error(updateError.message);
    count += 1;
  }

  return count;
}

function loadEnv(relativePath) {
  const filePath = path.resolve(process.cwd(), relativePath);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) continue;
    process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
  }
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultDek(name) {
  return `Primary sources, people, eras, and collections connected to ${name.toLowerCase()} in The Psychedelic History Archive.`;
}

function iconForSlug(slug) {
  if (/(ayahuasca|botany|plant|kava|virola|piper|caapi|ethno)/.test(slug)) return "ethnobotany";
  if (/(dmt|harmala|harmaline|kavalactone|chem|pharma)/.test(slug)) return "pharmacology";
  if (/(indigenous|tukano|yaje|ritual|shaman)/.test(slug)) return "indigenous-knowledge";
  if (/(psychoanalysis|psychology|psychiatry|therapy|ptsd)/.test(slug)) return "therapy";
  if (/(religion|mystic|spiritual)/.test(slug)) return "religious-experience";
  if (/(military|mkultra|government|intelligence)/.test(slug)) return "intelligence";
  if (/(law|trial|prohibition|policy)/.test(slug)) return "law";
  if (/(art|visual|vision)/.test(slug)) return "visual-culture";
  if (/(oral|interview|recording)/.test(slug)) return "oral-history";
  return "networks";
}

function firstRelated(value) {
  return Array.isArray(value) ? value[0] : value;
}
