import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateAiResponse } from "../lib/ai/validateAiResponse.js";

describe("validateAiResponse", () => {
  it("accepts valid AI output", () => {
    const result = validateAiResponse({
      category: "Technology",
      tags: ["AI"],
      importanceScore: 80,
      relevanceScore: 75,
      developerImpact: "High",
      summary: "Summary text here.",
      simpleExplanation: "Simple explanation here.",
      whyItMatters: "It matters because.",
    });
    assert.equal(result.success, true);
  });

  it("rejects invalid developer impact", () => {
    const result = validateAiResponse({
      category: "Technology",
      tags: ["AI"],
      importanceScore: 80,
      relevanceScore: 75,
      developerImpact: "Very High",
      summary: "Summary",
      simpleExplanation: "Simple",
      whyItMatters: "Why",
    });
    assert.equal(result.success, false);
  });
});