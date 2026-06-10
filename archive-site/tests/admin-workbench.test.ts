import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBibliographyTasks,
  buildBiographyStubCandidates,
} from "../src/lib/admin-workbench";
import type { BibliographyItem } from "../src/lib/bibliography";
import type { ArchiveSource } from "../src/lib/types";

test("buildBiographyStubCandidates creates source-linked metadata stubs", () => {
  const candidates = buildBiographyStubCandidates([
    makeSource({ people: ["Example Scholar"], slug: "source-a", title: "Source A", year: 1954 }),
    makeSource({ people: ["Example Scholar", "bebreen@ucsc.edu"], slug: "source-b", title: "Source B", year: 1962 }),
  ]);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].name, "Example Scholar");
  assert.equal(candidates[0].slug, "example-scholar");
  assert.equal(candidates[0].status, "metadata_stub");
  assert.equal(candidates[0].sourceCount, 2);
  assert.equal(candidates[0].years, "1954-1962");
  assert.ok(candidates[0].needs.includes("Full editorial biography"));
});

test("buildBiographyStubCandidates recognizes full profiles", () => {
  const candidates = buildBiographyStubCandidates([
    makeSource({ people: ["Alexander Shulgin"], slug: "shulgin-source", title: "Shulgin Source", year: 1973 }),
  ]);

  assert.equal(candidates[0].name, "Alexander Shulgin");
  assert.equal(candidates[0].status, "full_profile");
  assert.equal(candidates[0].hasFullProfile, true);
});

test("buildBibliographyTasks flags further-reading records missing maintenance metadata", () => {
  const tasks = buildBibliographyTasks([
    makeBibliographyItem({
      contributors: [],
      editorialNote: undefined,
      reliabilityNote: undefined,
      tags: [],
      eras: [],
      documentSlugs: [],
    }),
  ]);

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].track, "bibliography");
  assert.match(tasks[0].meta.find((item) => item.label === "Needs")?.value ?? "", /contributors/);
  assert.match(tasks[0].meta.find((item) => item.label === "Needs")?.value ?? "", /editorial note/);
});

function makeSource(overrides: Partial<ArchiveSource> = {}): ArchiveSource {
  return {
    accessType: "hosted",
    addedDate: "2026-01-01",
    author: "Archive",
    citation: "Archive citation.",
    displayDate: "1960",
    era: "1950-1970",
    excerpt: "Excerpt.",
    hostingStatus: "metadata_only",
    id: overrides.slug ?? "source-1",
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
    tags: ["LSD"],
    title: "Source One",
    type: "Book",
    wordCount: 100,
    year: 1960,
    ...overrides,
  };
}

function makeBibliographyItem(overrides: Partial<BibliographyItem> = {}): BibliographyItem {
  return {
    contributors: [{ displayName: "Scholar, Example", familyName: "Scholar", givenName: "Example", role: "author" }],
    documentSlugs: ["source-1"],
    editorialNote: "Editorial note.",
    eras: ["1950-1970"],
    id: "bib-1",
    itemType: "book",
    recommendationStatus: "recommended",
    reliabilityNote: "Reliability note.",
    slug: "example-book",
    status: "published",
    tags: [{ name: "LSD", slug: "lsd" }],
    title: "Example Book",
    year: 1960,
    ...overrides,
  };
}
