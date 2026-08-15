#!/usr/bin/env node
// Grounds every draft transcript in the raw text that was actually fetched.
// A sentence counts as grounded if some 7-word window of it appears in the raw file
// after aggressive normalisation. Ungrounded sentences are either heavy OCR repair
// (fine, but worth an eye) or invention (not fine).
//
// Usage: node scripts/check_draft_fidelity.mjs [slug ...]
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith("archive-site") ? path.resolve(process.cwd(), "..") : process.cwd();
const draftDir = path.join(root, "data", "draft-sources");
const sourcesDir = path.join(draftDir, "sources");
const only = new Set(process.argv.slice(2));

const WINDOW = 7;

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[ſ]/g, "s")
    .replace(/[“”„«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const files = fs.readdirSync(sourcesDir).filter((f) => f.endsWith(".json")).sort();
const report = [];

for (const file of files) {
  const slug = path.basename(file, ".json");
  if (only.size && !only.has(slug)) continue;
  const draft = JSON.parse(fs.readFileSync(path.join(sourcesDir, file), "utf8"));
  const transcript = typeof draft.transcript === "string" ? draft.transcript : "";
  const rawFile = draft.draft?.textSource?.rawFile;
  if (!transcript.trim()) continue;
  if (!rawFile || !fs.existsSync(path.join(draftDir, rawFile))) {
    report.push({ slug, grounded: null, note: "no raw file to check against" });
    continue;
  }

  const rawNorm = normalize(fs.readFileSync(path.join(draftDir, rawFile), "utf8"));
  // Also allow a translation to ground against the transcript itself (translations are ours).
  const sentences = transcript
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join(" ")
    // drop italicised editorial interpolations, which are ours by definition
    .replace(/_[^_]{0,400}_/g, " ")
    .replace(/\[[^\]]{0,200}\]/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => normalize(s).split(" ").filter(Boolean).length >= WINDOW + 1);

  let grounded = 0;
  const misses = [];
  for (const sentence of sentences) {
    const words = normalize(sentence).split(" ").filter(Boolean);
    let hit = false;
    for (let i = 0; i + WINDOW <= words.length; i += 1) {
      if (rawNorm.includes(` ${words.slice(i, i + WINDOW).join(" ")} `) || rawNorm.startsWith(words.slice(i, i + WINDOW).join(" "))) {
        hit = true;
        break;
      }
    }
    if (hit) grounded += 1;
    else misses.push(sentence.length > 160 ? `${sentence.slice(0, 160)}…` : sentence);
  }

  report.push({
    slug,
    sentences: sentences.length,
    grounded: sentences.length ? grounded / sentences.length : 1,
    misses,
  });
}

report.sort((a, b) => (a.grounded ?? -1) - (b.grounded ?? -1));
let bad = 0;
for (const row of report) {
  if (row.grounded === null) {
    console.log(`?  ${row.slug} — ${row.note}`);
    continue;
  }
  const pct = (row.grounded * 100).toFixed(1);
  const mark = row.grounded >= 0.95 ? "✓" : row.grounded >= 0.8 ? "!" : "✗";
  if (row.grounded < 0.8) bad += 1;
  console.log(`${mark}  ${row.slug} — ${pct}% of ${row.sentences} sentences grounded in raw text`);
  if (row.grounded < 0.98) {
    for (const miss of row.misses.slice(0, 8)) console.log(`      · ${miss}`);
    if (row.misses.length > 8) console.log(`      · …and ${row.misses.length - 8} more`);
  }
}
console.log(`\n${report.length} transcripts checked, ${bad} below 80%`);
