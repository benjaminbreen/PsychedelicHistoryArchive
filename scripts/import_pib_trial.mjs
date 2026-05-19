#!/usr/bin/env node
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const sourceDir = path.join(root, "data", "pib");
const importDir = path.join(root, "data", "pib-import");
const thumbnailDir = path.join(importDir, "thumbnails");
const collectionSlug = "psychedelic-information-bulletin";
const collectionId = uuidFromString(`collection:${collectionSlug}`);
const publishedAt = "2026-05-15T00:00:00.000Z";
const execFileAsync = promisify(execFile);

async function main() {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const pdfs = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => entry.name)
    .sort((a, b) => issueNumberFromFilename(a) - issueNumberFromFilename(b));

  if (!pdfs.length) {
    throw new Error(`No PDFs found in ${sourceDir}`);
  }

  await fs.mkdir(importDir, { recursive: true });
  await fs.rm(thumbnailDir, { force: true, recursive: true });
  await fs.mkdir(thumbnailDir, { recursive: true });
  await ensurePdfThumbnailTool();

  const firstIssueNumber = issueNumberFromFilename(pdfs[0]);
  const collectionCoverPath = `documents/pic-bulletin-${firstIssueNumber}/thumbnail/page-1.jpg`;

  const collections = [
    {
      id: collectionId,
      slug: collectionSlug,
      title: "Psychedelic Information Bulletin",
      subtitle: "PIC Bulletin nos. 32-34",
      summary:
        "Three late issues of the Psychedelic Information Bulletin / PIC Bulletin, a Boston-based periodical associated with Lisa Bieberman and the Psychedelic Information Center. The issues collect research summaries, drug-policy commentary, movement news, and practical notes from the turn of the 1970s.",
      body:
        "Overview: This collection comes from Lisa Bieberman's personal archive and preserves the issue-level PIB/PIC Bulletin files now represented here, with searchable records and OCR added for archive use.\nProvenance: Lisa Bieberman Collection.\nDigitization: Digitized by Paul Gillis-Smith.",
      cover_image_path: collectionCoverPath,
      status: "published"
    }
  ];

  const documents = [];
  const files = [];
  const assets = [];
  const collectionDocuments = [];

  for (const filename of pdfs) {
    const issueNumber = issueNumberFromFilename(filename);
    const year = yearFromFilename(filename);
    const slug = `pic-bulletin-${issueNumber}`;
    const documentId = uuidFromString(`document:${slug}`);
    const fileId = uuidFromString(`file:${slug}:original-pdf`);
    const storagePath = `documents/${slug}/original/source.pdf`;
    const thumbnailStoragePath = `documents/${slug}/thumbnail/page-1.jpg`;
    const thumbnailFilename = `${slug}-page-1.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    const localPath = path.relative(importDir, path.join(sourceDir, filename));
    const pdfPath = path.join(sourceDir, filename);
    const stat = await fs.stat(pdfPath);

    await generateFirstPageThumbnail(pdfPath, thumbnailPath);

    documents.push({
      id: documentId,
      slug,
      title: `PIC Bulletin ${issueNumber}`,
      short_title: `No. ${issueNumber}`,
      source_kind: "collection_item",
      parent_collection_id: collectionId,
      sequence_label: `No. ${issueNumber}`,
      sequence_number: issueNumber,
      issue_date: year ? String(year) : null,
      display_date: year ? String(year) : "Date pending",
      date_start: year,
      document_type: "Source",
      medium: "Text",
      language: "English",
      region: "United States",
      publication_title: "Psychedelic Information Bulletin",
      publisher: "Psychedelic Information Center",
      summary: `Issue ${issueNumber} of the Psychedelic Information Bulletin / PIC Bulletin.`,
      citation: `Psychedelic Information Center. "PIC Bulletin ${issueNumber}." ${year ?? "n.d."}.`,
      rights_statement: "Rights status pending review. Contact the archive before republication.",
      source_url: "#",
      access_type: "hosted",
      hosting_status: "pdf",
      reader_mode: "pdf",
      cover_image_path: thumbnailStoragePath,
      thumbnail_path: thumbnailStoragePath,
      is_featured: false,
      status: "published",
      published_at: publishedAt
    });

    files.push({
      id: fileId,
      document_id: documentId,
      page_id: null,
      kind: "original_pdf",
      storage_path: storagePath,
      mime_type: "application/pdf",
      byte_size: stat.size
    });

    assets.push({
      local_path: localPath,
      storage_path: storagePath,
      mime_type: "application/pdf"
    });

    assets.push({
      local_path: path.relative(importDir, thumbnailPath),
      storage_path: thumbnailStoragePath,
      mime_type: "image/jpeg"
    });

    collectionDocuments.push({
      collection_id: collectionId,
      document_id: documentId,
      position: issueNumber,
      sequence_label: `No. ${issueNumber}`,
      sequence_number: issueNumber,
      issue_date: year ? String(year) : null,
      editorial_caption: `PIC Bulletin ${issueNumber}`
    });
  }

  const emptyTables = {
    pages: [],
    page_lines: [],
    external_sources: [],
    people: [],
    document_people: [],
    document_sections: [],
    document_figures: [],
    tags: [],
    document_tags: []
  };

  await writeJson("collections", collections);
  await writeJson("collection_documents", collectionDocuments);
  await writeJson("documents", documents);
  await writeJson("files", files);
  await writeJson("assets", assets);

  for (const [name, rows] of Object.entries(emptyTables)) {
    await writeJson(name, rows);
  }

  await fs.writeFile(
    path.join(importDir, "README.md"),
    [
      "# PIB Import",
      "",
      "Generated by `node scripts/import_pib_trial.mjs` from `data/pib/*.pdf`.",
      "",
      `Collection slug: \`${collectionSlug}\``,
      "",
      "Import with:",
      "",
      "```bash",
      "SUPABASE_URL=\"https://yqcvybdabpnxyapnrjlp.supabase.co\" \\",
      "SUPABASE_SERVICE_ROLE_KEY=\"your_secret_key\" \\",
      "SUPABASE_STORAGE_BUCKET=\"archive-assets\" \\",
      "node scripts/upload_squarespace_to_supabase.mjs --import-dir data/pib-import",
      "```",
      ""
    ].join("\n"),
    "utf8"
  );

  console.log(`Generated PIB trial import with ${documents.length} issue records in ${path.relative(root, importDir)}`);
}

async function ensurePdfThumbnailTool() {
  try {
    await execFileAsync("pdftoppm", ["-v"]);
  } catch (error) {
    if (error?.code === 99) return;
    throw new Error("Generating PIB thumbnails requires `pdftoppm` from Poppler.");
  }
}

async function generateFirstPageThumbnail(pdfPath, thumbnailPath) {
  const outputPrefix = thumbnailPath.replace(/\.jpg$/i, "");
  await execFileAsync("pdftoppm", [
    "-f",
    "1",
    "-l",
    "1",
    "-singlefile",
    "-jpeg",
    "-r",
    "180",
    pdfPath,
    outputPrefix
  ]);
}

async function writeJson(name, value) {
  await fs.writeFile(path.join(importDir, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function issueNumberFromFilename(filename) {
  const match = filename.match(/\bBulletin\s+(\d+)\b/i);
  if (!match) throw new Error(`Could not parse issue number from ${filename}`);
  return Number(match[1]);
}

function yearFromFilename(filename) {
  const match = filename.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function uuidFromString(value) {
  const hash = crypto.createHash("sha1").update(value).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
