import assert from "node:assert/strict";
import test from "node:test";
import { extractMarkdownToc, markdownHeadingId, parseMarkdown } from "../src/lib/markdown";

test("markdownHeadingId normalizes display text into stable section IDs", () => {
  assert.equal(markdownHeadingId("Pharmacology & Ritual Use"), "section-pharmacology-ritual-use");
  assert.equal(markdownHeadingId("`Code` and *Emphasis*"), "section-code-and-emphasis");
});

test("parseMarkdown separates footnotes from paragraphs", () => {
  const parsed = parseMarkdown("A paragraph with a note.[^1]\n\n[^1]: First line.\n  Continued line.");

  assert.equal(parsed.footnotes.length, 1);
  assert.equal(parsed.footnotes[0].text, "First line. Continued line.");
  assert.deepEqual(parsed.blocks.map((block) => block.type), ["paragraph", "footnotes"]);
});

test("parseMarkdown assigns unique heading IDs and parses figure rows", () => {
  const parsed = parseMarkdown("## Context\n\n## Context\n\n{{figures:one, two}}");
  const headings = parsed.blocks.filter((block) => block.type === "heading");
  const figureRow = parsed.blocks.find((block) => block.type === "figure-row");

  assert.deepEqual(headings.map((heading) => heading.id), ["section-context", "section-context-2"]);
  assert.deepEqual(figureRow, { type: "figure-row", tokens: ["one", "two"] });
});

test("parseMarkdown treats five-hash lines as headings", () => {
  const parsed = parseMarkdown("##### First paragraph, on certain herbs that intoxicate\n\nThere is an herb.");

  assert.deepEqual(parsed.blocks[0], {
    type: "heading",
    depth: 5,
    id: "section-first-paragraph-on-certain-herbs-that-intoxicate",
    text: "First paragraph, on certain herbs that intoxicate",
  });
});

test("extractMarkdownToc mirrors rendered heading IDs and notes", () => {
  const toc = extractMarkdownToc("## Context\n\n### Context\n\n##### Details\n\n[^a]: A note.");

  assert.deepEqual(toc, [
    { id: "section-context", label: "Context" },
    { id: "section-context-2", label: "Context" },
    { id: "section-details", label: "Details" },
    { id: "section-notes", label: "Notes" },
  ]);
});
