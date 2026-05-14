#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = parseArgs(process.argv.slice(2));
const manifestPath = requiredArg(args, "--manifest");
const outDir = path.resolve(process.cwd(), args["--out"] || "data/original-source-import");
const geminiModel = args["--model"] || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey && !args["--skip-ocr"]) {
  console.error("Missing GEMINI_API_KEY. Pass --skip-ocr to stage images without transcription.");
  process.exit(1);
}

const OCR_PROMPT = `
You are transcribing a historical primary-source page for a scholarly archive.
Return JSON only. Do not include markdown.
Preserve spelling, punctuation, hyphenation, abbreviations, capitalization, and line breaks.
For every visible text line, return one line object in reading order.
Use normalized bounding boxes from 0 to 1 relative to the page image.
If text is uncertain, transcribe the best reading and lower the confidence.

Schema:
{
  "page_label": "string",
  "language": "BCP-47 or common language name",
  "ocr_text": "full text with line breaks",
  "lines": [
    {
      "line_index": 1,
      "text": "string",
      "normalized_text": "string",
      "bbox": { "x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0 },
      "confidence": 0.0,
      "paragraph_index": 0
    }
  ]
}
`;

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.resolve(process.cwd(), manifestPath), "utf8"));
  const pages = [];
  const pageLines = [];
  const assets = [];

  for (const source of manifest.sources ?? []) {
    for (const page of source.pages ?? []) {
      const pageNumber = page.page_number;
      const label = page.label || String(pageNumber);
      const pageId = deterministicUuid(`${source.document_id}:page:${pageNumber}`);
      const extension = extensionFor(page.image_url || page.local_path);
      const relativeLocalPath = path.join("original-sources", source.slug, `page-${String(pageNumber).padStart(4, "0")}${extension}`);
      const localPath = path.join(outDir, relativeLocalPath);
      const storagePath = `documents/${source.document_id}/original-sources/${source.slug}/page-${String(pageNumber).padStart(4, "0")}${extension}`;

      await fs.mkdir(path.dirname(localPath), { recursive: true });
      const imageBytes = await readPageImage(page, localPath);
      const mimeType = page.mime_type || mimeForExtension(extension);

      let ocr = emptyOcr(label, source.language);
      if (!args["--skip-ocr"]) {
        ocr = await transcribeWithGemini({
          bytes: imageBytes,
          mimeType,
          pageLabel: label,
          language: source.language,
          imageWidth: page.width,
          imageHeight: page.height
        });
      }

      pages.push({
        id: pageId,
        document_id: source.document_id,
        page_number: pageNumber,
        label,
        readable_image_path: storagePath,
        thumbnail_image_path: storagePath,
        image_width: page.width || null,
        image_height: page.height || null,
        language: ocr.language || source.language || null,
        ocr_text: ocr.ocr_text || linesToText(ocr.lines),
        ocr_confidence: averageConfidence(ocr.lines),
        transcription_status: args["--skip-ocr"] ? "image_staged" : "machine_transcribed"
      });

      for (const line of ocr.lines ?? []) {
        pageLines.push({
          id: deterministicUuid(`${pageId}:line:${line.line_index}`),
          page_id: pageId,
          line_index: line.line_index,
          text: line.text,
          normalized_text: line.normalized_text || normalizeText(line.text),
          bbox: line.bbox || null,
          confidence: line.confidence ?? null,
          language: ocr.language || source.language || null,
          paragraph_index: line.paragraph_index ?? null
        });
      }

      assets.push({
        id: deterministicUuid(`${pageId}:asset`),
        document_id: source.document_id,
        slug: source.slug,
        original_url: page.image_url || null,
        local_path: relativeLocalPath,
        storage_path: storagePath,
        kind: "page_image",
        mime_type: mimeType,
        needs_upload: true,
        checksum: sha256(imageBytes),
        byte_size: imageBytes.length,
        width: page.width || null,
        height: page.height || null
      });
    }
  }

  await fs.mkdir(outDir, { recursive: true });
  await writeJson(path.join(outDir, "pages.json"), pages);
  await writeJson(path.join(outDir, "page_lines.json"), pageLines);
  await writeJson(path.join(outDir, "assets.json"), assets);

  console.log(`Wrote ${pages.length} pages, ${pageLines.length} lines, and ${assets.length} assets to ${outDir}`);
}

async function readPageImage(page, localPath) {
  if (page.local_path) {
    const bytes = await fs.readFile(path.resolve(process.cwd(), page.local_path));
    await fs.writeFile(localPath, bytes);
    return bytes;
  }

  if (!page.image_url) throw new Error(`Page ${page.page_number} has no image_url or local_path.`);
  const response = await fetch(page.image_url);
  if (!response.ok) throw new Error(`${page.image_url}: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(localPath, bytes);
  return bytes;
}

async function transcribeWithGemini({ bytes, mimeType, pageLabel, language, imageWidth, imageHeight }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${geminiApiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0,
        response_mime_type: "application/json"
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: `${OCR_PROMPT}\nPage label: ${pageLabel}\nExpected language: ${language || "unknown"}` },
            {
              inline_data: {
                mime_type: mimeType,
                data: bytes.toString("base64")
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini OCR failed for page ${pageLabel}: ${response.status} ${body}`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n");
  if (!text) throw new Error(`Gemini OCR returned no text for page ${pageLabel}.`);
  return normalizeOcr(JSON.parse(text), pageLabel, language, { imageWidth, imageHeight });
}

function normalizeOcr(ocr, pageLabel, language, pageDimensions = {}) {
  const lines = Array.isArray(ocr.lines) ? ocr.lines : [];
  return {
    page_label: ocr.page_label || pageLabel,
    language: ocr.language || language || null,
    ocr_text: ocr.ocr_text || linesToText(lines),
    lines: lines
      .filter((line) => line?.text)
      .map((line, index) => ({
        line_index: Number(line.line_index) || index + 1,
        text: String(line.text),
        normalized_text: line.normalized_text ? String(line.normalized_text) : normalizeText(String(line.text)),
        bbox: normalizeBox(line.bbox, pageDimensions),
        confidence: Number.isFinite(Number(line.confidence)) ? Number(line.confidence) : null,
        paragraph_index: Number.isFinite(Number(line.paragraph_index)) ? Number(line.paragraph_index) : null
      }))
  };
}

function emptyOcr(pageLabel, language) {
  return { page_label: pageLabel, language: language || null, ocr_text: "", lines: [] };
}

function validBox(box) {
  return box &&
    ["x", "y", "width", "height"].every((key) => Number.isFinite(Number(box[key])));
}

function normalizeBox(box, { imageWidth, imageHeight } = {}) {
  if (!validBox(box)) return null;

  const normalized = {
    x: Number(box.x),
    y: Number(box.y),
    width: Number(box.width),
    height: Number(box.height)
  };

  if (Object.values(normalized).every((value) => value >= 0 && value <= 1)) {
    return normalized;
  }

  const usesThousandGrid =
    normalized.x >= 0 &&
    normalized.y >= 0 &&
    normalized.x + normalized.width <= 1000 &&
    normalized.y + normalized.height <= 1000;

  if (usesThousandGrid) {
    return {
      x: clampUnit(normalized.x / 1000),
      y: clampUnit(normalized.y / 1000),
      width: clampUnit(normalized.width / 1000),
      height: clampUnit(normalized.height / 1000)
    };
  }

  if (imageWidth > 0 && imageHeight > 0) {
    return {
      x: clampUnit(normalized.x / imageWidth),
      y: clampUnit(normalized.y / imageHeight),
      width: clampUnit(normalized.width / imageWidth),
      height: clampUnit(normalized.height / imageHeight)
    };
  }

  return null;
}

function clampUnit(value) {
  return Math.min(Math.max(value, 0), 1);
}

function linesToText(lines = []) {
  return lines.map((line) => line.text).filter(Boolean).join("\n");
}

function averageConfidence(lines = []) {
  const values = lines.map((line) => line.confidence).filter((value) => typeof value === "number");
  if (!values.length) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(4));
}

function normalizeText(text) {
  return text.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function deterministicUuid(input) {
  const hash = crypto.createHash("sha1").update(input).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `${(parseInt(hash.slice(16, 18), 16) & 0x3f | 0x80).toString(16)}${hash.slice(18, 20)}`,
    hash.slice(20, 32)
  ].join("-");
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function extensionFor(value = "") {
  const extension = path.extname(new URL(value, "file:///placeholder").pathname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(extension) ? extension : ".jpg";
}

function mimeForExtension(extension) {
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[arg] = true;
    } else {
      result[arg] = next;
      index += 1;
    }
  }
  return result;
}

function requiredArg(args, key) {
  const value = args[key];
  if (!value || value === true) {
    console.error(`Missing ${key}`);
    process.exit(1);
  }
  return value;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
