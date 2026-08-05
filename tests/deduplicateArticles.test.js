import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deduplicateArticles } from "../lib/rss/deduplicateArticles.js";

describe("deduplicateArticles", () => {
  it("removes duplicate URLs", () => {
    const articles = [
      { articleUrl: "https://a.com/1", contentHash: "h1", normalizedTitle: "one" },
      { articleUrl: "https://a.com/1", contentHash: "h2", normalizedTitle: "one duplicate" },
    ];
    const { unique, removedCount } = deduplicateArticles(articles);
    assert.equal(unique.length, 1);
    assert.equal(removedCount, 1);
  });

  it("removes duplicate normalized titles", () => {
    const articles = [
      { articleUrl: "https://a.com/1", contentHash: "h1", normalizedTitle: "same story" },
      { articleUrl: "https://a.com/2", contentHash: "h2", normalizedTitle: "same story" },
    ];
    const { unique } = deduplicateArticles(articles);
    assert.equal(unique.length, 1);
  });
});