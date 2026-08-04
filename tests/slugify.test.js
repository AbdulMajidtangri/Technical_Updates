import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify, withSlugSuffix } from "../lib/utils/slugify.js";

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    assert.equal(slugify("Hello World!"), "hello-world");
  });

  it("appends suffix for uniqueness", () => {
    assert.match(withSlugSuffix("hello-world", "abc123"), /^hello-world-abc123$/);
  });
});