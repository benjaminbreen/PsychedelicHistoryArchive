import assert from "node:assert/strict";
import test from "node:test";
import { buildReaderModel, parseLineatedPages, sourceCitation, textStatus, transcriptParagraphs } from "../src/lib/reader-model";
import type { ArchiveSource } from "../src/lib/types";

const MEMO = `LSD mm September 23,1954

Preliminary LSD memo

1  [crossed-out text] Problems of Consc ousness Princeton 1954
2      presented Caligor to Problems of Consciousness, Abrahamson interested,
3      he had asked me how to get candidates for experimentation from low
4      income groups the year before
5  Only other knowledge of the drug was a brief conversation
6      before he got his dissertation.

[end of page 1]

LSD -25, Sept.23,1954 p.2.    mm

                         right after
1      coming to the conclusion that I would try the drug, especially after
2      reading Abrahamson's third paper
3  September 22. Second LDS session
24
4      as an interested observer.`;

test("parseLineatedPages keeps page breaks, Mead's numbers, headings and insertions", () => {
  const pages = parseLineatedPages(transcriptParagraphs(makeSource({ transcript: MEMO })));
  assert.ok(pages);
  assert.equal(pages.length, 2);
  assert.deepEqual(pages[0].lines.slice(0, 2).map(l => l.kind), ["head", "head"]);
  assert.deepEqual(pages[0].lines[2], { n: 1, text: "[crossed-out text] Problems of Consc ousness Princeton 1954", indent: 0, kind: "line" });
  assert.equal(pages[0].lines[3].indent, 1);
  assert.equal(pages[1].lines.find(l => l.kind === "insert"), undefined, "an unnumbered line before the first number is a heading");
  assert.equal(pages[1].lines.filter(l => l.kind === "line").length, 4, "a stray bare number is dropped");
});

test("parseLineatedPages leaves prose alone", () => {
  assert.equal(parseLineatedPages(["An ordinary paragraph of prose.", "Another paragraph."]), null);
});

test("buildReaderModel picks views from the material", () => {
  const memo = buildReaderModel(makeSource({ transcript: MEMO, files: [{ id: "f", kind: "original_pdf", url: "/memo.pdf" } as never] }), transcriptParagraphs(makeSource({ transcript: MEMO })));
  assert.deepEqual(memo.textViews.map(v => v.id), ["transcript"]);
  assert.equal(memo.original.kind, "pdf");
  assert.equal(memo.canCompare, true);

  const translated = buildReaderModel(makeSource({ translationText: "Translated.", contentLanguage: "French", transcript: "Original." }), ["Original."]);
  assert.deepEqual(translated.textViews.map(v => v.label), ["Translation", "Original French"]);

  const record = buildReaderModel(makeSource({ accessType: "external", sourceUrl: "https://example.org/item" }), []);
  assert.deepEqual(record.textViews.map(v => v.id), ["overview"]);
  assert.equal(record.original.kind, "external");
  assert.equal(record.canCompare, false);

  const collection = buildReaderModel(makeSource({ sourceKind: "collection" }), []);
  assert.deepEqual(collection.textViews.map(v => v.id), ["overview"]);
  assert.equal(collection.original.kind, "none");
});

test("the hero uses the summary, falling back to a short source note", () => {
  const note = { heading: "Source note", kind: "source_note" as const, body: "A short note.", paragraphs: [] };
  assert.equal(buildReaderModel(makeSource({ transcriptSections: [note] }), []).introSection, undefined);
  assert.equal(buildReaderModel(makeSource({ summary: "", transcriptSections: [note] }), []).introSection, note);
});

test("textStatus describes how the text was prepared", () => {
  const source = makeSource({ transcript: MEMO, pages: [{ id: "p", pageNumber: 1, label: "1", transcriptionStatus: "reviewed", lines: [] }] });
  const status = textStatus(source, buildReaderModel(source, transcriptParagraphs(source)));
  assert.equal(status.label, "Reviewed transcript");
  assert.match(status.detail, /2 pages, checked against the original/);
});

test("sourceCitation includes page and line ranges", () => {
  const source = makeSource({ author: "Margaret Mead", title: "Preliminary LSD memo", displayDate: "23 September 1954", citation: "Library of Congress, Mead Papers." });
  assert.equal(
    sourceCitation(source, { page: 2, a: 4, b: 9 }, "https://example.org"),
    "Margaret Mead, “Preliminary LSD memo,” 23 September 1954, p. 2, lines 4–9, Library of Congress, Mead Papers; The Psychedelic History Archive, https://example.org/archive/source-1."
  );
});

function makeSource(overrides: Partial<ArchiveSource> = {}): ArchiveSource {
  return {
    accessType: "hosted", addedDate: "2026-01-01", author: "Archive", citation: "Archive citation.", displayDate: "1968", era: "1950-1970",
    excerpt: "Excerpt.", hostingStatus: "metadata_only", id: "source-1", imageTone: "paper", language: "English", medium: "Text", people: [],
    region: "United States", rights: "Research use.", slug: "source-1", sourceUrl: "#", substances: [], summary: "Summary.", tags: [],
    title: "Source One", type: "Book", wordCount: 100, year: 1968, ...overrides
  };
}
