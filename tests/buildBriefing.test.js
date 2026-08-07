import test from "node:test";
import assert from "node:assert/strict";
import { buildBriefing, estimateArticleMinutes } from "../lib/briefing/buildBriefing.js";

const sampleArticles = [
  {
    id: "1",
    slug: "a1",
    title: "High AI story",
    category: "Artificial Intelligence",
    tags: ["OpenAI"],
    importanceScore: 90,
    relevanceScore: 85,
    developerImpact: "High",
    publishedAt: new Date().toISOString(),
    aiProcessed: true,
    simpleExplanation: "Simple",
  },
  {
    id: "2",
    slug: "a2",
    title: "Medium biz story",
    category: "Business",
    tags: ["Startups"],
    importanceScore: 70,
    relevanceScore: 60,
    developerImpact: "Low",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    aiProcessed: true,
    summary: "Summary",
  },
  {
    id: "3",
    slug: "a3",
    title: "Another AI story",
    category: "Artificial Intelligence",
    tags: ["Machine Learning"],
    importanceScore: 75,
    relevanceScore: 70,
    developerImpact: "Medium",
    publishedAt: new Date().toISOString(),
    aiProcessed: true,
    simpleExplanation: "Also simple",
  },
];

test("estimateArticleMinutes returns reasonable values", () => {
  assert.equal(estimateArticleMinutes({ simpleExplanation: "x" }), 2);
  assert.equal(estimateArticleMinutes({ summary: "x" }), 2.5);
  assert.equal(estimateArticleMinutes({}), 3);
});

test("buildBriefing respects time budget", () => {
  const result = buildBriefing(sampleArticles, { minutes: 5 });
  assert.ok(result.articleCount >= 1);
  assert.ok(result.estimatedMinutes <= 5.5);
});

test("buildBriefing excludes read articles", () => {
  const result = buildBriefing(sampleArticles, { minutes: 15, readIds: ["1", "2", "3"] });
  assert.equal(result.articleCount, 0);
});

test("buildBriefing boosts interest profile matches", () => {
  const result = buildBriefing(sampleArticles, {
    minutes: 15,
    interestProfile: {
      categories: { "Artificial Intelligence": 0.9 },
      topics: { OpenAI: 0.95 },
    },
  });
  assert.ok(result.articles.length > 0);
  assert.equal(result.articles[0].category, "Artificial Intelligence");
});
