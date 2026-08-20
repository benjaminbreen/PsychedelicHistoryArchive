#!/usr/bin/env node
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const args = parseArgs(process.argv.slice(2));
const importDir = path.resolve(process.cwd(), args["--import-dir"] || "data/squarespace-import");
const onlySlug = args["--only-slug"];
const maxPages = args["--max-pages"] ? Number(args["--max-pages"]) : undefined;
const force = Boolean(args["--force"]);
const thumbnailScale = Number(args["--scale"] || 420);

async function main() {
  if (maxPages !== undefined && (!Number.isInteger(maxPages) || maxPages < 1)) {
    throw new Error("--max-pages must be a positive integer.");
  }

  await ensurePdfTools();

  const documents = await readJson("documents");
  const files = await readJson("files");
  const pages = await readJson("pages");
  const assets = await readJson("assets");
  const documentsById = new Map(documents.map((document) => [document.id, document]));
  const assetsByStoragePath = new Map(assets.filter((asset) => asset.storage_path).map((asset) => [asset.storage_path, asset]));

  let generatedPageCount = 0;
  for (const file of files.filter((row) => isPdfFile(row))) {
    const document = documentsById.get(file.document_id);
    if (!document) continue;
    if (onlySlug && document.slug !== onlySlug) continue;

    const pdfAsset = assetsByStoragePath.get(file.storage_path);
    const pdfLocalPath = pdfAsset?.local_path ? path.join(importDir, pdfAsset.local_path) : undefined;
    if (!pdfLocalPath || !(await exists(pdfLocalPath))) {
      console.warn(`Skipped ${document.slug}: no local PDF asset for ${file.storage_path}`);
      continue;
    }

    const pageCount = await getPdfPageCount(pdfLocalPath);
    const finalPage = Math.min(pageCount, maxPages ?? pageCount);
    const localThumbnailDir = path.join(importDir, "pdf-thumbnails", document.slug);
    await fs.mkdir(localThumbnailDir, { recursive: true });

    for (let pageNumber = 1; pageNumber <= finalPage; pageNumber += 1) {
      const filename = `page-${String(pageNumber).padStart(3, "0")}.jpg`;
      const localPath = path.join(localThumbnailDir, filename);
      const relativeLocalPath = toPosixPath(path.relative(importDir, localPath));
      const storagePath = `documents/${document.id}/pdf-thumbnails/${document.slug}/${filename}`;

      if (force || !(await exists(localPath))) {
        await generateThumbnail(pdfLocalPath, localPath, pageNumber);
      }

      const bytes = await fs.readFile(localPath);
      const dimensions = await getImageDimensions(localPath);
      upsertAsset(assets, {
        id: deterministicUuid(`${document.id}:pdf-thumbnail:${pageNumber}:asset`),
        document_id: document.id,
        document_slug: document.slug,
        source_url: `Generated from original PDF page ${pageNumber}`,
        local_path: relativeLocalPath,
        storage_path: storagePath,
        kind: "pdf_page_thumbnail",
        mime_type: "image/jpeg",
        downloaded: true,
        sha256: sha256(bytes),
        byte_size: bytes.length,
        width: dimensions.width,
        height: dimensions.height
      });

      upsertPageThumbnail(pages, {
        id: deterministicUuid(`${document.id}:pdf-page:${pageNumber}`),
        document_id: document.id,
        page_number: pageNumber,
        label: `Page ${pageNumber}`,
        readable_image_path: "",
        thumbnail_image_path: storagePath,
        ocr_text: "",
        ocr_confidence: null,
        transcription_status: "pdf_thumbnail"
      });

      generatedPageCount += 1;
    }
  }

  pages.sort((a, b) => {
    const docCompare = String(a.document_id || "").localeCompare(String(b.document_id || ""));
    if (docCompare) return docCompare;
    return (a.page_number ?? 0) - (b.page_number ?? 0);
  });

  await writeJson("pages", pages);
  await writeJson("assets", assets);
  await writeCsvMirrorIfPresent("pages", pages);
  await writeCsvMirrorIfPresent("assets", assets);

  console.log(`Generated or verified ${generatedPageCount} PDF page thumbnails in ${path.relative(process.cwd(), importDir) || "."}`);
}

function isPdfFile(file) {
  return file.kind === "original_pdf" || file.kind === "pdf" || file.mime_type === "application/pdf";
}

async function ensurePdfTools() {
  try {
    await execFileAsync("pdftoppm", ["-v"]);
  } catch (error) {
    if (error?.code !== 99) throw new Error("Generating PDF thumbnails requires `pdftoppm` from Poppler.");
  }

  try {
    await execFileAsync("pdfinfo", ["-v"]);
  } catch (error) {
    if (error?.code !== 99) throw new Error("Generating PDF thumbnails requires `pdfinfo` from Poppler.");
  }
}

async function getPdfPageCount(pdfPath) {
  const { stdout } = await execFileAsync("pdfinfo", [pdfPath]);
  const match = stdout.match(/^Pages:\s+(\d+)/m);
  if (!match) throw new Error(`Could not determine page count for ${pdfPath}`);
  return Number(match[1]);
}

async function generateThumbnail(pdfPath, thumbnailPath, pageNumber) {
  const outputPrefix = thumbnailPath.replace(/\.jpg$/i, "");
  await execFileAsync("pdftoppm", [
    "-f",
    String(pageNumber),
    "-l",
    String(pageNumber),
    "-singlefile",
    "-jpeg",
    "-jpegopt",
    "quality=82,progressive=y,optimize=y",
    "-scale-to",
    String(thumbnailScale),
    pdfPath,
    outputPrefix
  ]);
}

async function getImageDimensions(imagePath) {
  try {
    const { stdout } = await execFileAsync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", imagePath]);
    return {
      width: Number(stdout.match(/pixelWidth:\s+(\d+)/)?.[1]) || null,
      height: Number(stdout.match(/pixelHeight:\s+(\d+)/)?.[1]) || null
    };
  } catch {
    return { width: null, height: null };
  }
}

function upsertAsset(assets, nextAsset) {
  const index = assets.findIndex((asset) => asset.storage_path === nextAsset.storage_path || (nextAsset.id && asset.id === nextAsset.id));
  if (index === -1) {
    assets.push(nextAsset);
    return;
  }
  assets[index] = { ...assets[index], ...nextAsset };
}

function upsertPageThumbnail(pages, nextPage) {
  const index = pages.findIndex((page) => page.document_id === nextPage.document_id && Number(page.page_number) === nextPage.page_number);
  if (index === -1) {
    pages.push(nextPage);
    return;
  }

  pages[index] = {
    ...pages[index],
    thumbnail_image_path: nextPage.thumbnail_image_path,
    readable_image_path: pages[index].readable_image_path || "",
    label: pages[index].label || nextPage.label,
    ocr_text: pages[index].ocr_text ?? "",
    ocr_confidence: pages[index].ocr_confidence ?? null,
    transcription_status: pages[index].transcription_status || nextPage.transcription_status
  };
}

async function readJson(name) {
  const filePath = path.join(importDir, `${name}.json`);
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeJson(name, value) {
  await fs.writeFile(path.join(importDir, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeCsvMirrorIfPresent(name, rows) {
  const csvPath = path.join(importDir, `${name}.csv`);
  if (!(await exists(csvPath))) return;
  const existing = await fs.readFile(csvPath, "utf8");
  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const headerLine = existing.split(/\r?\n/, 1)[0];
  const existingColumns = headerLine.split(",");
  const extraColumns = unique(rows.flatMap((row) => Object.keys(row))).filter((column) => !existingColumns.includes(column));
  const columns = [...existingColumns, ...extraColumns];
  const body = rows.map((row) => columns.map((column) => csvValue(row[column])).join(",")).join(newline);
  await fs.writeFile(csvPath, `${columns.join(",")}${newline}${body}${newline}`, "utf8");
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "True" : "False";
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[arg] = true;
    } else {
      parsed[arg] = next;
      index += 1;
    }
  }
  return parsed;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function deterministicUuid(value) {
  const hash = crypto.createHash("sha1").update(value).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function unique(values) {
  return [...new Set(values)];
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
