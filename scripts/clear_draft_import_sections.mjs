#!/usr/bin/env node
// Sections are rebuilt from data/draft-sources on every import, and a record that gains a
// transcript changes which section sits at which position. document_sections is unique on
// (document_id, position), so the old rows have to go before the new ones land. Scoped to
// the documents in the given import directory and nothing else.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const importDir = process.argv[process.argv.indexOf("--import-dir") + 1] || "data/draft-import";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const ids = JSON.parse(fs.readFileSync(path.join(importDir, "documents.json"), "utf8")).map((d) => d.id);
const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" };

let cleared = 0;
for (let i = 0; i < ids.length; i += 40) {
  const chunk = ids.slice(i, i + 40);
  const query = `document_id=in.(${chunk.join(",")})`;
  const response = await fetch(`${url}/rest/v1/document_sections?${query}`, { method: "DELETE", headers });
  if (!response.ok) throw new Error(`delete sections: ${response.status} ${await response.text()}`);
  cleared += chunk.length;
}
console.log(`Cleared existing document_sections for ${cleared} documents`);
