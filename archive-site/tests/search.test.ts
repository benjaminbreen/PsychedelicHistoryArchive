import assert from "node:assert/strict";
import test from "node:test";
import { searchArchiveIndex } from "../src/lib/search";
import type { PublicTopicListItem } from "../src/lib/topics";
import type { ArchiveSource } from "../src/lib/types";

test("searchArchiveIndex groups source, topic, people, and collection matches", () => {
  const source = makeSource({
    people: ["Claudio Naranjo"],
    summary: "Harmala alkaloid research in Chile.",
    tags: ["Harmala", "Clinical"],
    title: "Psychotropic Properties of Harmala Alkaloids",
  });
  const collection = makeSource({
    id: "collection-1",
    slug: "bulletin",
    sourceKind: "collection",
    summary: "A periodical run about clinical research.",
    tags: ["Clinical"],
    title: "Psychedelic Information Bulletin",
  });
  const topics: PublicTopicListItem[] = [
    {
      dek: "Research on harmala alkaloids and related compounds.",
      documentCount: 1,
      documentIds: [source.id],
      id: "topic-1",
      name: "Harmala",
      slug: "harmala",
    },
  ];

  const results = searchArchiveIndex({
    collections: [collection],
    curatedTopics: topics,
    query: "harmala",
    sources: [source],
  });

  assert.equal(results.sources.length, 1);
  assert.equal(results.topics[0].slug, "harmala");
  assert.equal(results.people[0].name, "Claudio Naranjo");
  assert.equal(results.collections.length, 0);
  assert.equal(results.total, 3);
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
    region: "Chile",
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
