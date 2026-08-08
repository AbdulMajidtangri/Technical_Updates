import test from "node:test";
import assert from "node:assert/strict";
import { verifyActionCandidates } from "../lib/intelligence/actionPlanner/verifier.js";
import { computeGapScore, rankLearningConcepts } from "../lib/intelligence/learnPath/knowledgeGap.js";
import { classifyActionStatus } from "../lib/intelligence/actionPlanner/scorer.js";

const article = {
  title: "Security update required",
  content: "A critical vulnerability affects Node.js 18. Security updates will end on September 1.",
  summary: "Node.js 18 security support ends September 1.",
};

test("verifyActionCandidates rejects generic advice", () => {
  const { verified, rejected } = verifyActionCandidates(article, [
    {
      title: "Stay informed",
      description: "Keep an eye on the news",
      reason: "General",
      evidence: "article mentions security",
      targetAudience: "Developers",
      explicitness: "consideration",
    },
    {
      title: "Check Node.js version",
      description: "Verify whether your project uses Node.js 18 before support ends.",
      reason: "Security support is ending",
      evidence: "Security updates will end on September 1",
      sourceQuote: "Security updates will end on September 1",
      targetAudience: "Developers using Node.js 18",
      explicitness: "direct",
    },
  ]);

  assert.ok(rejected.length >= 1);
  assert.ok(verified.some((v) => v.title.includes("Node.js")));
});

test("classifyActionStatus returns NO_ACTION when empty", () => {
  assert.equal(classifyActionStatus([], 0, 0, 10), "NO_ACTION_REQUIRED");
});

test("computeGapScore prioritizes important unknown concepts", () => {
  const highGap = computeGapScore(90, 20);
  const lowGap = computeGapScore(30, 90);
  assert.ok(highGap > lowGap);
});

test("rankLearningConcepts filters known concepts", () => {
  const concepts = [
    { conceptId: "inference", name: "Inference", normalizedName: "inference", importanceScore: 90, category: "AI" },
    { conceptId: "openai", name: "OpenAI", normalizedName: "openai", importanceScore: 30, category: "AI" },
  ];
  const userConcepts = {
    openai: { familiarityScore: 90 },
    inference: { familiarityScore: 20 },
  };
  const ranked = rankLearningConcepts(concepts, userConcepts);
  assert.equal(ranked[0].conceptId, "inference");
});
