import assert from "node:assert/strict";
import test from "node:test";
import { archiveClearFiltersHref, archiveHref } from "../src/lib/archive-url";

test("archiveHref preserves unrelated state and resets pagination", () => {
  const href = archiveHref(
    { era: "1950-1970", page: "3", sort: "title", view: "compact" },
    { tag: "Clinical" }
  );

  assert.equal(href, "/archive?era=1950-1970&sort=title&view=compact&tag=Clinical");
});

test("archiveHref can intentionally set pagination", () => {
  const href = archiveHref(
    { era: "1950-1970", sort: "title" },
    { page: "2" },
    { resetPage: false }
  );

  assert.equal(href, "/archive?era=1950-1970&sort=title&page=2");
});

test("archiveClearFiltersHref keeps view preferences while clearing filters", () => {
  const href = archiveClearFiltersHref({
    era: "1950-1970",
    page: "2",
    q: "leary",
    sort: "newest",
    view: "grid",
  });

  assert.equal(href, "/archive?sort=newest&view=grid");
});
