import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDisplayPages,
  buildReaderTabs,
  buildReaderToc,
  getOriginalMode,
  toEmbedUrl,
  visibleReaderTab,
} from "../src/lib/source-reader";
import type { ArchiveSource } from "../src/lib/types";

test("buildReaderTabs gives collection sources overview and details only", () => {
  const source = makeSource({ sourceKind: "collection" });

  assert.deepEqual(buildReaderTabs(source, []), [
    { id: "overview", label: "Overview" },
    { id: "details", label: "Details" },
  ]);
});

test("buildReaderTabs prioritizes translations before transcripts and originals", () => {
  const source = makeSource({
    files: [{ id: "pdf", kind: "original_pdf", url: "/file.pdf", mimeType: "application/pdf" }],
    translationText: "## Translation\n\nTranslated text.",
  });

  assert.deepEqual(buildReaderTabs(source, ["Transcript text"]).map((tab) => tab.id), [
    "translation",
    "transcript",
    "original",
    "details",
  ]);
});

test("buildReaderTabs labels a translated source transcript by its original language", () => {
  const source = makeSource({
    contentLanguage: "Spanish",
    language: "Spanish",
    translationText: "## Translation\n\nTranslated text.",
  });

  assert.deepEqual(buildReaderTabs(source, ["Texto original."]).map((tab) => tab.label), [
    "Translation",
    "Original Spanish",
    "Original source",
    "Details",
  ]);
});

test("getOriginalMode prefers PDFs for academic articles without page images", () => {
  const source = makeSource({
    files: [{ id: "pdf", kind: "original_pdf", url: "/file.pdf", mimeType: "application/pdf" }],
    type: "Academic Article",
  });

  assert.equal(getOriginalMode(source, []), "pdf");
});

test("buildDisplayPages creates a fallback page from transcript text", () => {
  const source = makeSource({ imagePath: "/cover.jpg" });
  const pages = buildDisplayPages(source, ["This is a transcript paragraph that can be wrapped into line-level fallback text."]);

  assert.equal(pages.length, 1);
  assert.equal(pages[0].label, "1");
  assert.equal(pages[0].lines[0].index, 1);
});

test("buildReaderToc uses transcript section headings", () => {
  const source = makeSource({
    transcriptSections: [
      { heading: "Opening Note", kind: "note", paragraphs: [] },
      { heading: "Transcript", kind: "transcript", paragraphs: [] },
    ],
  });

  assert.deepEqual(buildReaderToc(source, "transcript", []), [
    { id: "section-opening-note", label: "Opening Note" },
    { id: "section-transcript", label: "Transcript" },
  ]);
});

test("visibleReaderTab falls back when active tab is unavailable", () => {
  assert.equal(visibleReaderTab("translation", [{ id: "details", label: "Details" }]), "details");
});

test("toEmbedUrl normalizes common video URLs", () => {
  assert.equal(toEmbedUrl("https://youtu.be/abc123"), "https://www.youtube.com/embed/abc123");
  assert.equal(toEmbedUrl("https://vimeo.com/12345"), "https://player.vimeo.com/video/12345");
});

function makeSource(overrides: Partial<ArchiveSource> = {}): ArchiveSource {
  return {
    accessType: "hosted",
    addedDate: "2026-01-01",
    author: "Archive",
    citation: "Archive citation.",
    displayDate: "1968",
    era: "1950-1970",
    excerpt: "Excerpt.",
    hostingStatus: "metadata_only",
    id: "source-1",
    imageTone: "paper",
    language: "English",
    medium: "Text",
    people: [],
    region: "United States",
    rights: "Research use.",
    slug: "source-1",
    sourceUrl: "#",
    substances: [],
    summary: "Summary.",
    tags: [],
    title: "Source One",
    type: "Book",
    wordCount: 100,
    year: 1968,
    ...overrides,
  };
}
