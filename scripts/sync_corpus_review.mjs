// Seed the private shared queue from local scan files. Does not publish sources.
// New decisions are deliberately not imported here, so reruns cannot overwrite
// reviews made by collaborators. Existing sent nominations are linked by ID.
import fs from "node:fs";
import path from "node:path";
import { createClient } from "../archive-site/node_modules/@supabase/supabase-js/dist/index.mjs";

const root = path.resolve(import.meta.dirname, "..");
process.loadEnvFile(path.join(root, "archive-site/.env.local"));
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const scan = path.join(root, "data/corpus-scan");
const jsonl = file => fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)) : [];
async function upsert(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await client.from(table).upsert(rows.slice(i, i + 100), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}
for (const batch of fs.readdirSync(path.join(scan, "candidates"))) {
  const directory = path.join(scan, "candidates", batch);
  if (!fs.existsSync(path.join(directory, "candidates.jsonl"))) continue;
  const candidates = jsonl(path.join(directory, "candidates.jsonl"));
  const summary = { ...JSON.parse(fs.readFileSync(path.join(directory, "batch.json"), "utf8")), batch, n: candidates.length };
  await upsert("corpus_candidate_batches", [{ batch, summary }], "batch");
  await upsert("corpus_candidates", candidates.map(payload => ({ candidate_id: payload.candidate_id, batch, rank: payload.rank, payload })), "batch,candidate_id");
  console.log(`Synced ${batch}: ${candidates.length} candidates`);
}
// Import local decision history once, before opening the deployed queue.
const { count, error } = await client.from("corpus_candidate_decisions").select("id", { count: "exact", head: true });
if (error) throw new Error(error.message);
if (count === 0) {
  const decisions = jsonl(path.join(scan, "decisions.jsonl"));
  for (const payload of decisions) {
    const { error } = await client.from("corpus_candidate_decisions").insert({ candidate_id: payload.candidate_id, batch: payload.batch, payload });
    if (error) throw new Error(error.message);
  }
  console.log(`Imported ${decisions.length} existing review decisions`);
}
const sent = jsonl(path.join(scan, "workspace.jsonl"));
for (const row of sent) {
  const { data, error } = await client.from("documents").select("id").eq("id", row.document_id).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) await upsert("corpus_workspace_nominations", [row], "candidate_id");
}
console.log("Shared review queue ready; no sources published.");
