#!/usr/bin/env node
// Builds a draft transcript by slicing line ranges out of the raw fetched text, so the
// text goes from disk to disk without being retyped. Mechanical cleanup only: nothing
// here understands the source, and a correction pass still has to read it.
//
//   node scripts/draft_transcript_from_raw.mjs --slug <slug> --ranges 120-480,512-690
//   node scripts/draft_transcript_from_raw.mjs --slug <slug> --ranges 120-480 --preview
//   node scripts/draft_transcript_from_raw.mjs --raw raw/foo.txt --grep "peyote"
//
// --ranges are 1-indexed inclusive line numbers of the raw file (see --number).
// --heading "12=### Testimony of Cleaver Warden" inserts a markdown heading before a line.
// --note "480=Chapters III-V, on unrelated botany, omitted." inserts an italic editorial
//   note after a range.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd().endsWith("archive-site") ? path.resolve(process.cwd(), "..") : process.cwd();
const draftDir = path.join(root, "data", "draft-sources");

const args = parseArgs(process.argv.slice(2));
const slug = args.slug;
const draftPath = slug ? path.join(draftDir, "sources", `${slug}.json`) : null;
const draft = draftPath && fs.existsSync(draftPath) ? JSON.parse(fs.readFileSync(draftPath, "utf8")) : null;

const rawRel = args.raw || draft?.draft?.textSource?.rawFile;
if (!rawRel) fail("Need --raw <path relative to data/draft-sources> or a --slug whose draft records one.");
const rawPath = path.join(draftDir, rawRel);
if (!fs.existsSync(rawPath)) fail(`Raw file not found: ${rawPath}`);
const rawLines = fs.readFileSync(rawPath, "utf8").split("\n");

if (args.number || args.grep) {
  const needle = args.grep ? String(args.grep).toLowerCase() : null;
  const context = Number(args.context ?? 0);
  const shown = new Set();
  rawLines.forEach((line, i) => {
    if (!needle || line.toLowerCase().includes(needle)) {
      for (let j = Math.max(0, i - context); j <= Math.min(rawLines.length - 1, i + context); j += 1) shown.add(j);
    }
  });
  const indices = needle ? [...shown].sort((a, b) => a - b) : rawLines.map((_, i) => i);
  let last = -2;
  for (const i of indices) {
    if (i !== last + 1) console.log("   ---");
    console.log(`${String(i + 1).padStart(6)}  ${rawLines[i]}`);
    last = i;
  }
  process.exit(0);
}

if (!args.ranges) fail("Need --ranges 120-480[,512-690], or use --number / --grep to find them.");

const headings = parsePositional(args.heading);
const notes = parsePositional(args.note);

const chunks = [];
for (const range of String(args.ranges).split(",")) {
  const [startRaw, endRaw] = range.split("-");
  const start = Number(startRaw);
  const end = Number(endRaw ?? startRaw);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) fail(`Bad range "${range}"`);
  const slice = rawLines.slice(start - 1, end);
  const parts = [];
  for (let i = 0; i < slice.length; i += 1) {
    const lineNumber = start + i;
    if (headings.has(lineNumber)) parts.push(`\n\n${headings.get(lineNumber)}\n\n`);
    parts.push(slice[i]);
    parts.push("\n");
  }
  let text = parts.join("");
  text = clean(text);
  if (notes.has(end)) text += `\n\n_[${notes.get(end)}]_\n`;
  chunks.push(text.trim());
}

const transcript = chunks.join("\n\n");
const words = transcript.trim().split(/\s+/).filter(Boolean).length;

if (args.preview || !draft) {
  console.log(transcript.slice(0, Number(args.previewChars ?? 4000)));
  console.log(`\n---\n${words} words${draft ? "" : " (no draft written: pass --slug of an existing draft JSON)"}`);
  process.exit(0);
}

draft.transcript = transcript;
draft.wordCount = words;
fs.writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
console.log(`${slug}: wrote ${words} words of transcript from ${rawRel} lines ${args.ranges}`);

function clean(text) {
  return text
    // page furniture: a line that is only a number, or a running head in caps with a number
    .replace(/^\s*\d{1,4}\s*$/gm, "")
    .replace(/^\s*[A-Z][A-Z .,'-]{6,}\s+\d{1,4}\s*$/gm, "")
    .replace(/^\s*\d{1,4}\s+[A-Z][A-Z .,'-]{6,}\s*$/gm, "")
    // Hyphenation across a line break (tolerating a trailing OCR space before the newline).
    // Always rejoin without the hyphen. A dictionary test — keep the hyphen when both halves
    // are words — sounds better and is much worse: across these scans it would keep a spurious
    // hyphen in 300+ ordinary broken words (avail-able, how-ever, Govern-ment) to rescue about
    // one real compound. Fix the rare broken compound by hand instead.
    .replace(/(\w)-[ \t]*\n(\w)/g, "$1$2")
    // some scans render the line-break hyphen as a stray not-sign (soft-hyphen OCR artifact)
    .replace(/(\w)¬ ?\n(\w)/g, "$1$2")
    // single newline inside a paragraph becomes a space; blank lines stay
    .replace(/([^\n])\n(?![\n\s])/g, "$1 ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    // common OCR substitutions that are safe without context
    .replace(/\btbe\b/g, "the")
    .replace(/\bTbe\b/g, "The")
    .replace(/\btbat\b/g, "that")
    .replace(/\bwitb\b/g, "with")
    .replace(/ſ/g, "s")
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function parsePositional(value) {
  const map = new Map();
  for (const entry of [].concat(value ?? [])) {
    const index = String(entry).indexOf("=");
    if (index < 1) fail(`Expected <line>=<text>, got "${entry}"`);
    map.set(Number(String(entry).slice(0, index)), String(entry).slice(index + 1));
  }
  return map;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = out[key] === undefined ? next : [].concat(out[key], next);
      i += 1;
    }
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
