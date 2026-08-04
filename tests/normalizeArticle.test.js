import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeArticle, normalizeTitle } from "../lib/rss/normalizeArticle.js";

describe("normalizeArticle", () => {
  it("normalizes RSS item with required fields", () => {
    const result = normalizeArticle(
      { title: "OpenAI launches new model", link: "https://example.com/a", guid: "abc", description: "<p>Big news</p>", pubDate: "2026-08-04T10:00:00Z" },
      { name: "Technology", url: "https://rss.app/feed" },
    );
    assert.equal(result.title, "OpenAI launches new model");
    assert.equal(result.articleUrl, "https://example.com/a");
    assert.equal(result.sourceName, "Technology");
    assert.ok(result.contentHash);
    assert.equal(result.description, "Big news");
  });

  it("normalizes titles consistently", () => {
    assert.equal(normalizeTitle("OpenAI: New Model!"), "openai new model");
  });
});