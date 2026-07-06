import assert from "node:assert/strict";
import test from "node:test";

test("search index chunks include metadata, section, and OCR page anchors", async () => {
  const { buildSearchChunks } = await loadSearchIndexModule();
  const chunks = buildSearchChunks(makeDocument());

  assert.ok(chunks.some((chunk) => chunk.chunk_kind === "metadata"));
  assert.ok(chunks.some((chunk) => chunk.chunk_kind === "section" && chunk.href?.includes("#section-historical-overview")));
  assert.ok(chunks.some((chunk) => chunk.chunk_kind === "page" && chunk.href?.includes("page=1")));
});

test("search index chunk hashes change when source text changes", async () => {
  const { buildSearchChunks } = await loadSearchIndexModule();
  const before = buildSearchChunks(makeDocument())[0].content_hash;
  const after = buildSearchChunks(makeDocument({ summary: "A different summary about harmala chemistry." }))[0].content_hash;

  assert.notEqual(before, after);
});

async function loadSearchIndexModule() {
  const modulePath = "../../scripts/search_index_embeddings.mjs";
  return import(modulePath) as Promise<{
    buildSearchChunks: (document: Record<string, unknown>) => Array<Record<string, string | null>>;
  }>;
}

function makeDocument(overrides: Record<string, unknown> = {}) {
  return {
    abstract: "A short abstract.",
    citation: "Archive citation.",
    display_date: "1968",
    document_people: [{ people: { name: "Claudio Naranjo" }, role: "author" }],
    document_sections: [
      {
        body: "## Historical Overview\n\nClinical work with harmala alkaloids in Chile.",
        body_format: "markdown",
        heading: "Historical Overview",
        id: "section-1",
        position: 1,
        section_type: "overview",
      },
    ],
    document_tags: [{ tags: { name: "Clinical", status: "published", tag_type: "topic" } }],
    document_type: "Academic Article",
    id: "11111111-1111-1111-1111-111111111111",
    language: "English",
    medium: "Text",
    pages: [{ id: "page-1", label: "1", ocr_text: "OCR text about psychotherapy and altered states.", page_number: 1 }],
    publication_title: "Journal",
    publisher: "Publisher",
    region: "Chile",
    short_title: "Harmala",
    slug: "harmala",
    source_kind: "single",
    subtitle: null,
    summary: "Harmala alkaloid research in Chile.",
    title: "Psychotropic Properties of Harmala Alkaloids",
    translation_text: null,
    ...overrides,
  };
}
