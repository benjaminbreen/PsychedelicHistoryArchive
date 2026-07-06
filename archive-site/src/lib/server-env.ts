import fs from "node:fs";
import path from "node:path";

let loadedLocalEnv = false;

export function getServerEnv(name: string) {
  const existing = process.env[name];
  if (existing) return existing;

  loadLocalEnvFiles();
  return process.env[name];
}

function loadLocalEnvFiles() {
  if (loadedLocalEnv || process.env.NODE_ENV === "production" || process.env.VERCEL) return;
  loadedLocalEnv = true;

  const cwd = process.cwd();
  for (const filePath of [path.join(cwd, ".env.local"), path.join(cwd, "..", ".env.local")]) {
    loadEnvFile(filePath);
  }
}

function loadEnvFile(filePath: string) {
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

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
