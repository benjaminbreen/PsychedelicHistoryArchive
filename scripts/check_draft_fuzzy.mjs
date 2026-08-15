#!/usr/bin/env node
// Second-opinion grounding check for transcripts whose raw OCR is too corrupt for the
// exact-window test in check_draft_fidelity.mjs — where accented vowels came through as
// digits, say, so "éveillé" reads "6veill6" and no exact window can ever match.
//
// For each flagged sentence it finds the best-matching window in the raw text by character
// similarity. High similarity means the sentence is really there and was repaired; low
// similarity means it came from somewhere else.
//
//   node scripts/check_draft_fuzzy.mjs <slug> [--threshold 0.62] [--show 12]
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith("archive-site") ? path.resolve(process.cwd(), "..") : process.cwd();
const draftDir = path.join(root, "data", "draft-sources");

const argv = process.argv.slice(2);
const slug = argv.find((a) => !a.startsWith("--"));
const threshold = Number(readFlag("--threshold") ?? 0.62);
const show = Number(readFlag("--show") ?? 12);
if (!slug) {
  console.error("Usage: node scripts/check_draft_fuzzy.mjs <slug> [--threshold 0.62] [--show 12]");
  process.exit(1);
}

const draft = JSON.parse(fs.readFileSync(path.join(draftDir, "sources", `${slug}.json`), "utf8"));
const raw = fs.readFileSync(path.join(draftDir, draft.draft.textSource.rawFile), "utf8");

const fold = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ſ/g, "s")
    // OCR digit-for-letter substitutions common in accented French and Spanish scans
    .replace(/6/g, "e").replace(/1/g, "l").replace(/0/g, "o").replace(/5/g, "s").replace(/8/g, "s")
    .replace(/[^a-z]+/g, " ")
    .trim();

const rawFolded = fold(raw);
const sentences = (draft.transcript ?? "")
  .split("\n")
  .filter((line) => !line.trim().startsWith("#"))
  .join(" ")
  .replace(/_[^_]{0,400}_/g, " ")
  .replace(/\[[^\]]{0,200}\]/g, " ")
  .split(/(?<=[.!?])\s+/)
  .map((s) => s.trim())
  .filter((s) => fold(s).split(" ").filter(Boolean).length >= 8);

const results = sentences.map((sentence) => ({ sentence, score: bestSimilarity(fold(sentence), rawFolded) }));
results.sort((a, b) => a.score - b.score);

const weak = results.filter((r) => r.score < threshold);
const mean = results.reduce((sum, r) => sum + r.score, 0) / (results.length || 1);

console.log(`${slug}: ${results.length} sentences, mean best-window similarity ${(mean * 100).toFixed(1)}%`);
console.log(`${results.length - weak.length} of ${results.length} above ${(threshold * 100).toFixed(0)}%\n`);
for (const row of weak.slice(0, show)) {
  console.log(`  ${(row.score * 100).toFixed(0).padStart(3)}%  ${row.sentence.slice(0, 150)}${row.sentence.length > 150 ? "…" : ""}`);
}
if (weak.length > show) console.log(`  …and ${weak.length - show} more below threshold`);

function bestSimilarity(needle, haystack) {
  if (!needle) return 1;
  // Anchor on the rarest 4-gram of the sentence, then score a window around each hit.
  const words = needle.split(" ");
  const anchors = [];
  for (let i = 0; i + 4 <= words.length; i += 1) anchors.push(words.slice(i, i + 4).join(" "));
  const candidates = new Set();
  for (const anchor of anchors) {
    let from = 0;
    for (let n = 0; n < 40; n += 1) {
      const at = haystack.indexOf(anchor, from);
      if (at === -1) break;
      candidates.add(Math.max(0, at - needle.length));
      from = at + 1;
    }
    if (candidates.size > 200) break;
  }
  if (!candidates.size) {
    // No shared 4-gram anywhere: sample coarsely so the score is not silently 0 by accident.
    for (let at = 0; at < haystack.length; at += Math.max(200, Math.floor(needle.length / 2))) candidates.add(at);
  }
  let best = 0;
  for (const start of candidates) {
    const window = haystack.slice(start, start + Math.floor(needle.length * 2.2));
    best = Math.max(best, diceSimilarity(needle, window));
    if (best > 0.97) break;
  }
  return best;
}

function diceSimilarity(a, b) {
  const grams = (text) => {
    const set = new Map();
    for (let i = 0; i + 3 <= text.length; i += 1) {
      const g = text.slice(i, i + 3);
      set.set(g, (set.get(g) ?? 0) + 1);
    }
    return set;
  };
  const ga = grams(a);
  const gb = grams(b);
  let shared = 0;
  for (const [gram, count] of ga) shared += Math.min(count, gb.get(gram) ?? 0);
  const total = [...ga.values()].reduce((s, n) => s + n, 0);
  return total ? shared / total : 0;
}

function readFlag(name) {
  const at = argv.indexOf(name);
  return at === -1 ? undefined : argv[at + 1];
}
