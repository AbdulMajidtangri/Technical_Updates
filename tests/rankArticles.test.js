import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rankArticles, developerImpactToScore } from "../lib/ranking/rankArticles.js";

describe("rankArticles", () => {
  it("maps developer impact labels", () => {
    assert.equal(developerImpactToScore("High"), 100);
    assert.equal(developerImpactToScore("Medium"), 60);
    assert.equal(developerImpactToScore("Low"), 30);
  });

  it("ranks higher importance articles first", () => {
    const ranked = rankArticles([
      { title: "Low", importanceScore: 40, relevanceScore: 40, developerImpact: "Low", publishedAt: new Date().toISOString() },
      { title: "High", importanceScore: 95, relevanceScore: 90, developerImpact: "High", publishedAt: new Date().toISOString() },
    ]);
    assert.equal(ranked[0].title, "High");
  });
});