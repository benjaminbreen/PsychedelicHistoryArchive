#!/usr/bin/env node
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const importDir = path.join(root, "data", "latin-america-import");
const maxHostedPdfBytes = 49 * 1024 * 1024;
const transcriptPageChunkSize = 50;
const compressOversizePdfs = process.env.COMPRESS_OVERSIZE_PDFS === "1";

const expertContextPlaceholder = `_This historical-context essay is open for contribution._

Are you a scholar, archivist, community knowledge holder, or subject expert with relevant expertise in this source? Please use the [source issue form](#source-issue-report) at the bottom of this page to propose a short context essay or suggest a contributor. Choose "Other concern" and include "Historical context essay" in the location field.`;

const sourceConfigs = [
  {
    slug: "project-mkultra-behavioral-modification-hearing",
    title: "Project MKULTRA, the CIA's Program of Research in Behavioral Modification",
    subtitle: "1977 Senate joint hearing on LSD, behavioral research, and CIA records",
    displayDate: "August 3, 1977",
    dateStart: 1977,
    dateEnd: 1977,
    documentType: "Testimony",
    region: "United States; Washington, D.C.",
    publicationPlace: "Washington, D.C.",
    publicationTitle: "U.S. Government Printing Office",
    publisher: "U.S. Government Printing Office",
    sourceUrl: "https://archive.org/details/cia-readingroom-document-00163357",
    pdfUrl: "https://archive.org/download/cia-readingroom-document-00163357/00163357.pdf",
    downloadedPdfFilename: "00163357-cia-reading-room.pdf",
    hostedPdfFilename: "project-mkultra-behavioral-modification-hearing.pdf",
    repositoryName: "Internet Archive",
    institutionName: "CIA Reading Room mirror",
    accessLabel: "CIA Reading Room PDF mirror",
    summary: "A joint Senate hearing on Project MKULTRA after CIA director Stansfield Turner informed Congress that financial records had surfaced for previously destroyed behavioral-research files. The hearing and appendices document LSD-related projects, agency recordkeeping, and congressional oversight of CIA human-subjects research.",
    citation: "United States Senate Select Committee on Intelligence and Subcommittee on Health and Scientific Research of the Committee on Human Resources. Project MKULTRA, the CIA's Program of Research in Behavioral Modification: Joint Hearing, Ninety-Fifth Congress, First Session, August 3, 1977. Washington, D.C.: U.S. Government Printing Office, 1977.",
    editorialNote: "Staged in July 2026 from the CIA Reading Room mirror on Internet Archive. Full PDF and OCR are included; OCR is machine generated and should be checked against the PDF before formal quotation.",
    sourceNote: `_This 1977 joint Senate hearing is one of the most compact public entrances into MKULTRA after CIA director Stansfield Turner notified Congress of newly found financial records. It includes testimony, agency correspondence, and appendices on LSD and related behavioral-research projects._`,
    people: [
      { slug: "edward-m-kennedy", role: "chair" },
      { slug: "daniel-k-inouye", role: "chair" }
    ],
    tags: [
      "1970-2000",
      "united-states",
      "mkultra",
      "cia",
      "lsd",
      "government-research",
      "intelligence",
      "clinical",
      "human-experiments",
      "research-ethics",
      "congressional-investigation",
      "declassified-files"
    ]
  },
  {
    slug: "church-committee-foreign-military-intelligence-book-one",
    title: "Foreign and Military Intelligence: Church Committee Final Report, Book I",
    subtitle: "Full Senate report including the chapter on chemical and biological agents",
    displayDate: "1976",
    dateStart: 1976,
    dateEnd: 1976,
    documentType: "Source",
    region: "United States; Washington, D.C.",
    publicationPlace: "Washington, D.C.",
    publicationTitle: "U.S. Government Printing Office",
    publisher: "U.S. Government Printing Office",
    sourceUrl: "https://archive.org/details/finalreportofsel01unit",
    pdfUrl: "https://archive.org/download/finalreportofsel01unit/finalreportofsel01unit.pdf",
    downloadedPdfFilename: "finalreportofsel01unit.pdf",
    hostedPdfFilename: "church-committee-final-report-book-one.pdf",
    repositoryName: "Internet Archive",
    institutionName: "Boston Public Library government documents scan",
    accessLabel: "Full text PDF",
    summary: "Book I of the Church Committee final report, Foreign and Military Intelligence, includes the committee's findings on CIA testing and use of chemical and biological agents. The full volume places MKULTRA and LSD-related experimentation within broader findings on covert action, intelligence oversight, and congressional accountability.",
    citation: "United States Senate Select Committee to Study Governmental Operations with Respect to Intelligence Activities. Final Report of the Select Committee to Study Governmental Operations with Respect to Intelligence Activities, United States Senate, Book I: Foreign and Military Intelligence. 94th Cong., 2d sess., S. Rept. 94-755. Washington, D.C.: U.S. Government Printing Office, 1976.",
    editorialNote: "Staged in July 2026 from the public-domain Internet Archive/Boston Public Library government-documents scan. The archive hosts OCR text and page thumbnails; consult the Internet Archive record for the full PDF scan.",
    sourceNote: `_Book I of the Church Committee final report situates CIA drug testing inside the broader machinery of foreign and military intelligence. The full volume is included here because its chapter on chemical and biological agents depends on the committee's larger account of covert action, oversight, and secrecy._`,
    people: [
      { slug: "frank-church", role: "chair" }
    ],
    tags: [
      "1970-2000",
      "united-states",
      "mkultra",
      "cia",
      "lsd",
      "government-research",
      "intelligence",
      "law",
      "clinical",
      "human-experiments",
      "research-ethics",
      "congressional-investigation",
      "cold-war"
    ]
  },
  {
    slug: "rockefeller-commission-cia-drug-experiments",
    title: "Report to the President by the Commission on CIA Activities within the United States",
    subtitle: "Rockefeller Commission findings on CIA drug testing and domestic activities",
    displayDate: "June 1975",
    dateStart: 1975,
    dateEnd: 1975,
    documentType: "Source",
    region: "United States; Washington, D.C.",
    publicationPlace: "Washington, D.C.",
    publicationTitle: "Commission on CIA Activities within the United States",
    publisher: "Commission on CIA Activities within the United States",
    sourceUrl: "https://archive.org/details/reporttopresiden01unit",
    pdfUrl: "https://archive.org/download/reporttopresiden01unit/reporttopresiden01unit.pdf",
    downloadedPdfFilename: "reporttopresiden01unit.pdf",
    hostedPdfFilename: "rockefeller-commission-cia-drug-experiments.pdf",
    repositoryName: "Internet Archive",
    institutionName: "Boston Public Library government documents scan",
    accessLabel: "Full text PDF",
    summary: "The Rockefeller Commission's 1975 report was the first major presidential inquiry to put CIA drug experiments, including LSD-related episodes and the death of Frank Olson, into an official public account. It became a bridge between the commission investigation, the Church Committee, and the later Senate MKULTRA hearing.",
    citation: "United States President's Commission on CIA Activities within the United States. Report to the President by the Commission on CIA Activities within the United States. Washington, D.C., June 1975.",
    editorialNote: "Staged in July 2026 from a public-access Internet Archive scan of the federal commission report. The underlying commission report is a U.S. government work; any commercial reprint packaging in a scan should not be treated as part of the cited federal report.",
    sourceNote: `_The Rockefeller Commission report was the first major presidential inquiry to put CIA drug experiments, including LSD-related episodes, into an official public narrative. Its findings became a bridge between the 1975 commission investigation and the later Church Committee and 1977 Senate MKULTRA hearings._`,
    people: [
      { slug: "nelson-a-rockefeller", role: "commission chair" }
    ],
    tags: [
      "1970-2000",
      "united-states",
      "mkultra",
      "cia",
      "lsd",
      "government-research",
      "intelligence",
      "law",
      "clinical",
      "human-experiments",
      "research-ethics",
      "cold-war"
    ]
  }
];

const people = [
  {
    id: deterministicUuid("person:edward-m-kennedy"),
    slug: "edward-m-kennedy",
    name: "Edward M. Kennedy",
    sort_name: "Kennedy, Edward M.",
    birth_year: 1932,
    death_year: 2009,
    bio: "U.S. senator from Massachusetts whose health subcommittee helped investigate CIA drug testing and human-subjects research in the 1970s."
  },
  {
    id: deterministicUuid("person:daniel-k-inouye"),
    slug: "daniel-k-inouye",
    name: "Daniel K. Inouye",
    sort_name: "Inouye, Daniel K.",
    birth_year: 1924,
    death_year: 2012,
    bio: "U.S. senator from Hawaii and chair of the Senate Select Committee on Intelligence during the 1977 MKULTRA hearing."
  },
  {
    id: deterministicUuid("person:frank-church"),
    slug: "frank-church",
    name: "Frank Church",
    sort_name: "Church, Frank",
    birth_year: 1924,
    death_year: 1984,
    bio: "U.S. senator from Idaho who chaired the Senate Select Committee to Study Governmental Operations with Respect to Intelligence Activities, commonly known as the Church Committee."
  },
  {
    id: deterministicUuid("person:nelson-a-rockefeller"),
    slug: "nelson-a-rockefeller",
    name: "Nelson A. Rockefeller",
    sort_name: "Rockefeller, Nelson A.",
    birth_year: 1908,
    death_year: 1979,
    bio: "Vice president of the United States and chair of the 1975 Commission on CIA Activities within the United States."
  }
];

const tags = [
  tag("1970-2000", "1970-2000", "era"),
  tag("united-states", "United States", "region"),
  tag("washington-dc", "Washington, D.C.", "region"),
  tag("mkultra", "MKULTRA", "topic"),
  tag("cia", "CIA", "topic"),
  tag("lsd", "LSD", "substance"),
  tag("government-research", "Government Research", "topic"),
  tag("intelligence", "Intelligence", "topic"),
  tag("clinical", "Clinical", "topic"),
  tag("law", "Law", "topic"),
  tag("human-experiments", "Human experiments", "topic"),
  tag("research-ethics", "Research ethics", "topic"),
  tag("congressional-investigation", "Congressional investigation", "topic"),
  tag("declassified-files", "Declassified files", "topic"),
  tag("cold-war", "Cold War", "topic")
];

async function main() {
  await fs.mkdir(path.join(importDir, "pdfs"), { recursive: true });
  await fs.mkdir(path.join(importDir, "source-downloads"), { recursive: true });
  await fs.mkdir(path.join(importDir, "transcripts"), { recursive: true });

  const documents = await readJson("documents");
  const files = await readJson("files");
  const assets = await readJson("assets");
  const pages = await readJson("pages");
  const externalSources = await readJson("external_sources");
  const stagedPeople = await readJson("people");
  const documentPeople = await readJson("document_people");
  let documentSections = await readJson("document_sections");
  const stagedTags = await readJson("tags");
  const documentTags = await readJson("document_tags");

  const sourceState = [];

  for (const config of sourceConfigs) {
    const documentId = deterministicUuid(`document:${config.slug}`);
    const pdfState = await preparePdf(config, documentId);
    const pageCount = await getPdfPageCount(pdfState.hostedPdfPath);
    const pageTexts = await extractPdfTextPages(pdfState.downloadedPdfPath, config.slug, pageCount);
    const wordTotal = wordCount(pageTexts.join("\n\n"));
    sourceState.push({ config, documentId, pageCount, pageTexts, pdfState, wordTotal });

    const firstThumbnailPath = `documents/${documentId}/pdf-thumbnails/${config.slug}/page-001.jpg`;
    const nowNote = `${config.editorialNote} Full OCR transcript split into page-range sections; machine OCR has not been fully corrected.`;

    upsertBy(documents, "id", [
      {
        id: documentId,
        slug: config.slug,
        title: config.title,
        subtitle: config.subtitle,
        source_kind: "single",
        display_date: config.displayDate,
        date_start: config.dateStart,
        date_end: config.dateEnd,
        document_type: config.documentType,
        medium: "Text",
        language: "English",
        content_language: "English",
        translation_language: null,
        translation_text_path: null,
        translation_provider: null,
        translation_note: null,
        reader_mode: "transcript",
        region: config.region,
        publication_place: config.publicationPlace,
        publication_title: config.publicationTitle,
        publisher: config.publisher,
        summary: config.summary,
        abstract: config.summary,
        editorial_note: nowNote,
        citation: config.citation,
        rights_statement: "Public domain as a work of the United States federal government under 17 U.S.C. 105. The archive hosts OCR text and thumbnails; full PDFs are linked through external repositories.",
        source_url: config.sourceUrl,
        external_access_url: config.pdfUrl,
        access_type: "hosted",
        hosting_status: "transcript_only",
        cover_image_path: firstThumbnailPath,
        thumbnail_path: firstThumbnailPath,
        is_featured: false,
        status: "published",
        published_at: null
      }
    ]);

    upsertBy(externalSources, "id", [
      {
        id: deterministicUuid(`${documentId}:external:source-record`),
        document_id: documentId,
        repository_name: config.repositoryName,
        institution_name: config.institutionName,
        url: config.sourceUrl,
        access_label: config.accessLabel,
        stable_identifier: config.sourceUrl,
        rights_note: "Federal source text is public domain under 17 U.S.C. 105. Repository scan metadata and packaging may have separate descriptive metadata.",
        is_primary: true,
        last_checked_at: null
      }
    ]);

    for (let index = 0; index < pageCount; index += 1) {
      const pageNumber = index + 1;
      const filename = `page-${String(pageNumber).padStart(3, "0")}.jpg`;
      const storagePath = `documents/${documentId}/pdf-thumbnails/${config.slug}/${filename}`;
      upsertPage(pages, {
        id: deterministicUuid(`${documentId}:pdf-page:${pageNumber}`),
        document_id: documentId,
        page_number: pageNumber,
        label: `Page ${pageNumber}`,
        readable_image_path: "",
        thumbnail_image_path: storagePath,
        language: "English",
        ocr_text: pageTexts[index] || "",
        ocr_confidence: null,
        transcription_status: "machine_ocr_from_pdf"
      });
    }
  }

  upsertBy(stagedPeople, "slug", people);
  upsertBy(stagedTags, "slug", tags);

  for (const { config, documentId } of sourceState) {
    upsertBy(documentPeople, ["document_id", "person_id", "role"], config.people.map((person) => ({
      document_id: documentId,
      person_id: personId(person.slug),
      role: person.role
    })));

    upsertBy(documentTags, ["document_id", "tag_id"], config.tags.map((tagSlug) => ({
      document_id: documentId,
      tag_id: tagId(tagSlug)
    })));
  }

  const managedDocumentIds = new Set(sourceState.map((item) => item.documentId));
  removeRows(files, (row) => managedDocumentIds.has(row.document_id) && row.mime_type === "application/pdf");
  removeRows(assets, (row) => managedDocumentIds.has(row.document_id) && row.mime_type === "application/pdf");
  documentSections = documentSections.filter((section) => !managedDocumentIds.has(section.document_id));
  for (const state of sourceState) {
    documentSections.push(...buildDocumentSections(state));
  }

  pages.sort(compareDocumentPageRows);
  documentSections.sort(compareDocumentPositionRows);

  await writeJson("documents", documents);
  await writeJson("files", files);
  await writeJson("assets", assets);
  await writeJson("pages", pages);
  await writeJson("external_sources", externalSources);
  await writeJson("people", stagedPeople);
  await writeJson("document_people", documentPeople);
  await writeJson("document_sections", documentSections);
  await writeJson("tags", stagedTags);
  await writeJson("document_tags", documentTags);

  for (const name of ["documents", "files", "assets", "pages", "external_sources", "people", "document_people", "document_sections", "tags", "document_tags"]) {
    await mirrorCsv(name, await readJson(name));
  }

  await updateArchiveSources(sourceState);
  await updateReadmeCounts();

  for (const { config, pageCount, wordTotal, pdfState } of sourceState) {
    const relativePdf = path.relative(root, pdfState.hostedPdfPath);
    console.log(`Staged ${config.slug}: ${pageCount} PDF pages, ${wordTotal.toLocaleString()} OCR words from local working file ${relativePdf}`);
  }
}

async function preparePdf(config, documentId) {
  const sourceDir = path.join(importDir, "source-downloads", config.slug);
  const hostedDir = path.join(importDir, "pdfs", config.slug);
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(hostedDir, { recursive: true });

  const downloadedPdfPath = path.join(sourceDir, config.downloadedPdfFilename);
  const hostedPdfPath = path.join(hostedDir, config.hostedPdfFilename);

  await downloadFile(config.pdfUrl, downloadedPdfPath);
  const downloadedStats = await fs.stat(downloadedPdfPath);

  if (downloadedStats.size > maxHostedPdfBytes && compressOversizePdfs) {
    await compressPdf(downloadedPdfPath, hostedPdfPath, documentId);
    const hostedStats = await fs.stat(hostedPdfPath);
    if (hostedStats.size > maxHostedPdfBytes) {
      console.warn(`${config.slug}: compressed PDF is still ${(hostedStats.size / 1024 / 1024).toFixed(1)} MB; upload may require a larger storage limit.`);
    }
  } else {
    if (downloadedStats.size > maxHostedPdfBytes) {
      console.warn(`${config.slug}: local working PDF is ${(downloadedStats.size / 1024 / 1024).toFixed(1)} MB; it is used for OCR/thumbnails and is not staged for upload.`);
    }
    await fs.copyFile(downloadedPdfPath, hostedPdfPath);
  }

  return { downloadedPdfPath, hostedPdfPath };
}

async function downloadFile(url, destination) {
  if (await exists(destination)) {
    const stats = await fs.stat(destination);
    if (stats.size > 0) return;
  }

  console.log(`Downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} ${response.statusText}: ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destination, bytes);
}

async function compressPdf(sourcePath, destinationPath, documentId) {
  const tmpPath = path.join(path.dirname(destinationPath), `${documentId}-compressed.tmp.pdf`);
  console.log(`Compressing ${path.relative(root, sourcePath)} for hosted access`);
  await execFileAsync("gs", [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.6",
    "-dPDFSETTINGS=/ebook",
    "-dDetectDuplicateImages=true",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${tmpPath}`,
    sourcePath
  ]);
  await fs.rename(tmpPath, destinationPath);
}

async function getPdfPageCount(pdfPath) {
  const { stdout } = await execFileAsync("pdfinfo", [pdfPath]);
  const match = stdout.match(/^Pages:\s+(\d+)/m);
  if (!match) throw new Error(`Could not determine page count for ${pdfPath}`);
  return Number(match[1]);
}

async function extractPdfTextPages(pdfPath, slug, pageCount) {
  const outputDir = path.join(importDir, "transcripts", slug);
  await fs.mkdir(outputDir, { recursive: true });
  const textPath = path.join(outputDir, "full-ocr.txt");
  await execFileAsync("pdftotext", ["-layout", "-enc", "UTF-8", pdfPath, textPath]);
  const raw = await fs.readFile(textPath, "utf8");
  let pages = raw.split("\f");
  if (pages.length && !pages.at(-1)?.trim()) pages = pages.slice(0, -1);
  pages = pages.map(normalizeOcrPageText);

  if (pages.length < pageCount) {
    pages = [...pages, ...Array.from({ length: pageCount - pages.length }, () => "")];
  }
  if (pages.length > pageCount) {
    pages = pages.slice(0, pageCount - 1).concat(normalizeOcrPageText(pages.slice(pageCount - 1).join("\n\n")));
  }
  return pages;
}

function normalizeOcrPageText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function buildDocumentSections({ config, documentId, pageTexts }) {
  const sections = [
    {
      id: deterministicUuid(`${documentId}:section:source-note`),
      document_id: documentId,
      position: 10,
      heading: "Source note",
      section_type: "source_note",
      body: config.sourceNote,
      body_format: "markdown"
    },
    {
      id: deterministicUuid(`${documentId}:section:historical-context`),
      document_id: documentId,
      position: 20,
      heading: "Historical context",
      section_type: "historical_context",
      body: expertContextPlaceholder,
      body_format: "markdown"
    }
  ];

  for (let startIndex = 0; startIndex < pageTexts.length; startIndex += transcriptPageChunkSize) {
    const endIndex = Math.min(startIndex + transcriptPageChunkSize, pageTexts.length);
    const startPage = startIndex + 1;
    const endPage = endIndex;
    const body = pageTexts
      .slice(startIndex, endIndex)
      .map((text, offset) => {
        const pageNumber = startPage + offset;
        const bodyText = text.trim() || "_No OCR text extracted for this page._";
        return `##### Page ${pageNumber}\n\n${bodyText}`;
      })
      .join("\n\n");

    sections.push({
      id: deterministicUuid(`${documentId}:section:transcript:${startPage}-${endPage}`),
      document_id: documentId,
      position: 100 + startIndex,
      heading: startPage === endPage ? `Transcript, page ${startPage}` : `Transcript, pages ${startPage}-${endPage}`,
      section_type: "transcript",
      body,
      body_format: "markdown"
    });
  }

  return sections;
}

function upsertPage(rows, nextPage) {
  const index = rows.findIndex((row) => row.document_id === nextPage.document_id && Number(row.page_number) === nextPage.page_number);
  if (index === -1) {
    rows.push(nextPage);
    return;
  }
  rows[index] = {
    ...rows[index],
    ...nextPage,
    readable_image_path: rows[index].readable_image_path || nextPage.readable_image_path || "",
    thumbnail_image_path: rows[index].thumbnail_image_path || nextPage.thumbnail_image_path || "",
    transcription_status: nextPage.transcription_status || rows[index].transcription_status || null
  };
}

function personId(slug) {
  const person = people.find((item) => item.slug === slug);
  if (!person) throw new Error(`Unknown person slug: ${slug}`);
  return person.id;
}

function tagId(slug) {
  const item = tags.find((entry) => entry.slug === slug);
  if (!item) throw new Error(`Unknown tag slug: ${slug}`);
  return item.id;
}

function tag(slug, name, tagType) {
  return {
    id: deterministicUuid(`tag:${slug}`),
    slug,
    name,
    tag_type: tagType,
    description: null,
    status: "published"
  };
}

async function updateArchiveSources(sourceState) {
  const archivePath = path.join(importDir, "archive_sources.json");
  let rows = [];
  try {
    rows = JSON.parse(await fs.readFile(archivePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  for (const { config, documentId, wordTotal } of sourceState) {
    const peopleNames = config.people.map((person) => people.find((item) => item.slug === person.slug)?.name).filter(Boolean);
    const tagNames = config.tags.map((slug) => tags.find((item) => item.slug === slug)?.name).filter(Boolean);
    upsertBy(rows, "slug", [
      {
        id: config.slug.replaceAll("-", "_"),
        slug: config.slug,
        title: config.title,
        author: peopleNames.join(" and ") || config.publisher,
        year: config.dateStart,
        displayDate: config.displayDate,
        type: config.documentType,
        medium: "Text",
        era: "1970-2000",
        region: config.region,
        language: "English",
        tags: tagNames,
        people: peopleNames,
        substances: tagNames.includes("LSD") ? ["LSD"] : [],
        summary: config.summary,
        excerpt: config.summary,
        citation: config.citation,
        rights: "Public domain as a work of the United States federal government under 17 U.S.C. 105.",
        sourceUrl: config.sourceUrl,
        accessType: "hosted",
        hostingStatus: "transcript_only",
        wordCount: wordTotal,
        addedDate: "2026-07-09",
        featured: false,
        imageTone: "document",
        imagePath: `/documents/${documentId}/pdf-thumbnails/${config.slug}/page-001.jpg`,
        transcript: ""
      }
    ]);
  }

  await fs.writeFile(archivePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "archive_sources.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

async function updateReadmeCounts() {
  const readmePath = path.join(importDir, "README.md");
  const counts = {
    documents: (await readJson("documents")).length,
    pages: (await readJson("pages")).length,
    files: (await readJson("files")).length,
    assets: (await readJson("assets")).length,
    externalSources: (await readJson("external_sources")).length,
    people: (await readJson("people")).length,
    tags: (await readJson("tags")).length
  };

  let text = "";
  try {
    text = await fs.readFile(readmePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const countsBlock = `## Counts

- Documents: ${counts.documents}
- Pages: ${counts.pages}
- Files/assets: ${counts.files} files / ${counts.assets} assets
- External sources: ${counts.externalSources}
- People: ${counts.people}
- Tags: ${counts.tags}
`;
  const next = text.includes("## Counts") ? text.replace(/## Counts[\s\S]*$/m, countsBlock) : `${text.trim()}\n\n${countsBlock}\n`;
  await fs.writeFile(readmePath, next.trimEnd() + "\n", "utf8");
}

function upsertBy(rows, key, nextRows) {
  for (const next of nextRows) {
    const index = rows.findIndex((row) => conflictValue(row, key) === conflictValue(next, key));
    if (index === -1) rows.push(next);
    else rows[index] = { ...rows[index], ...next };
  }
}

function removeRows(rows, predicate) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (predicate(rows[index])) rows.splice(index, 1);
  }
}

function conflictValue(row, key) {
  if (Array.isArray(key)) return key.map((item) => String(row[item] ?? "")).join("\u0001");
  return String(row[key] ?? "");
}

function compareDocumentPageRows(a, b) {
  const docCompare = String(a.document_id || "").localeCompare(String(b.document_id || ""));
  if (docCompare) return docCompare;
  return (Number(a.page_number) || 0) - (Number(b.page_number) || 0);
}

function compareDocumentPositionRows(a, b) {
  const docCompare = String(a.document_id || "").localeCompare(String(b.document_id || ""));
  if (docCompare) return docCompare;
  return (Number(a.position) || 0) - (Number(b.position) || 0);
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

async function mirrorCsv(name, rows) {
  const csvPath = path.join(importDir, `${name}.csv`);
  try {
    await fs.access(csvPath);
  } catch {
    return;
  }

  const existing = await fs.readFile(csvPath, "utf8");
  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const existingColumns = existing.split(/\r?\n/, 1)[0].split(",");
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

function unique(values) {
  return [...new Set(values)];
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
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

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
