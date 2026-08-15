#!/usr/bin/env node
// Checks data/draft-sources/sources/*.json against the schema in that folder's README.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith("archive-site") ? path.resolve(process.cwd(), "..") : process.cwd();
const dir = path.join(root, "data", "draft-sources", "sources");

const TYPES = new Set([
  "Book", "Academic Article", "Ancient Text", "Archaeological Site", "Architectural Site", "Essay",
  "Letter", "Iconography", "Material Artifact", "Patient Report", "Medical Report", "Audio/Video",
  "Film", "Field Notes", "Manuscript", "Newspaper Article", "Source", "Testimony"
]);
const MEDIA = new Set(["Text", "Image", "Audio/Video", "Personal History", "Biography"]);
const ERAS = new Set(["Pre-1800", "1800-1950", "1950-1970", "1970-2000", "2000-Present"]);
const ACCESS = new Set(["hosted", "external", "metadata_only"]);

// Substances that cannot carry a draft on their own.
const OUT_OF_SCOPE = [/^cannabis/i, /^hashish/i, /^hemp/i, /^laudanum/i, /^opium/i, /^morphine/i,
  /^coca$/i, /^cocaine/i, /^alcohol/i, /^tobacco/i];

const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : [];
const slugs = new Map();
let errors = 0;
let warnings = 0;

for (const file of files) {
  const full = path.join(dir, file);
  const problems = [];
  const warns = [];
  let d;
  try {
    d = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    console.log(`✗ ${file}: unparseable JSON — ${err.message}`);
    errors += 1;
    continue;
  }

  const req = ["slug", "title", "author", "year", "displayDate", "type", "medium", "era", "region",
    "language", "substances", "summary", "citation", "rights", "sourceUrl", "accessType", "draft"];
  for (const key of req) {
    const v = d[key];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) problems.push(`missing ${key}`);
  }
  if (d.slug && path.basename(file, ".json") !== d.slug) problems.push(`filename does not match slug "${d.slug}"`);
  if (d.slug && slugs.has(d.slug)) problems.push(`duplicate slug, also in ${slugs.get(d.slug)}`);
  if (d.slug) slugs.set(d.slug, file);
  if (d.type && !TYPES.has(d.type)) problems.push(`type "${d.type}" not in SourceType`);
  if (d.medium && !MEDIA.has(d.medium)) problems.push(`medium "${d.medium}" invalid`);
  if (d.era && !ERAS.has(d.era)) problems.push(`era "${d.era}" invalid`);
  if (d.accessType && !ACCESS.has(d.accessType)) problems.push(`accessType "${d.accessType}" invalid`);
  if (typeof d.year !== "number") problems.push("year must be a number");
  if (d.year && d.era) {
    const expected = d.year < 1800 ? "Pre-1800" : d.year < 1950 ? "1800-1950" : d.year < 1970 ? "1950-1970" : d.year < 2000 ? "1970-2000" : "2000-Present";
    if (expected !== d.era) warns.push(`era ${d.era} does not match year ${d.year} (expected ${expected})`);
  }

  const subs = Array.isArray(d.substances) ? d.substances : [];
  if (subs.length && subs.every((s) => OUT_OF_SCOPE.some((re) => re.test(String(s).trim())))) {
    problems.push(`out of scope: substances are only ${subs.join(", ")}`);
  }

  const draft = d.draft || {};
  if (!draft.rationale) problems.push("draft.rationale missing");
  if (!draft.textSource?.url) problems.push("draft.textSource.url missing");
  if (!draft.textQuality?.confidence) problems.push("draft.textQuality.confidence missing");

  const transcript = typeof d.transcript === "string" ? d.transcript : "";
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  if (d.accessType === "hosted") {
    if (words < 250) problems.push(`hosted draft has only ${words} words of transcript`);
    if (draft.textQuality?.ocrPass === "none") warns.push("hosted transcript has had no OCR pass");
    if (draft.textSource?.rawFile) {
      const raw = path.join(root, "data", "draft-sources", draft.textSource.rawFile);
      if (!fs.existsSync(raw)) warns.push(`rawFile not found: ${draft.textSource.rawFile}`);
    } else {
      warns.push("no rawFile recorded");
    }
  }
  if (words && d.wordCount && Math.abs(words - d.wordCount) > Math.max(60, words * 0.15)) {
    warns.push(`wordCount ${d.wordCount} but transcript has ${words}`);
  }
  if (transcript.includes("[...]") && !transcript.includes("_")) warns.push("bare ellipsis marker without editorial note");

  if (problems.length) {
    errors += 1;
    console.log(`✗ ${file}`);
    for (const p of problems) console.log(`    ${p}`);
    for (const w of warns) console.log(`    (warn) ${w}`);
  } else if (warns.length) {
    warnings += 1;
    console.log(`! ${file}`);
    for (const w of warns) console.log(`    ${w}`);
  }
}

const ok = files.length - errors - warnings;
console.log(`\n${files.length} drafts — ${ok} clean, ${warnings} with warnings, ${errors} with errors`);
process.exit(errors ? 1 : 0);
