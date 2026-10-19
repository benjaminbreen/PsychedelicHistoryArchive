import assert from "node:assert/strict";
import test from "node:test";
import { biographyHrefsFor } from "../src/lib/biographies";

test("biographyHrefsFor links only names with a curated or published biography", () => {
  const hrefs = biographyHrefsFor(
    ["Myron Stolaroff", "Betty Eisner", "Arthur Heffter", "Federal Bureau of Investigation", ""],
    new Set(["betty-eisner"])
  );
  assert.equal(hrefs["Myron Stolaroff"], "/biographies/myron-stolaroff");
  assert.equal(hrefs["Betty Eisner"], "/biographies/betty-eisner");
  assert.equal(hrefs["Arthur Heffter"], undefined);
  assert.equal(hrefs["Federal Bureau of Investigation"], undefined);
});
