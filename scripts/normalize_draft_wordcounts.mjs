#!/usr/bin/env node
// Recomputes wordCount from the transcript. Correction agents report their own counts and
// sometimes get them wrong; the file is the authority.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd().endsWith("archive-site") ? path.resolve(process.cwd(), "..") : process.cwd();
const dir = path.join(root, "data", "draft-sources", "sources");
let changed = 0;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const full = path.join(dir, file);
  const draft = JSON.parse(fs.readFileSync(full, "utf8"));
  const text = typeof draft.transcript === "string" ? draft.transcript.trim() : "";
  const words = text ? text.split(/\s+/).length : 0;
  if (draft.wordCount !== words) {
    console.log(`${file}: ${draft.wordCount ?? "unset"} -> ${words}`);
    draft.wordCount = words;
    fs.writeFileSync(full, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
    changed += 1;
  }
}
console.log(`${changed} word counts corrected`);
