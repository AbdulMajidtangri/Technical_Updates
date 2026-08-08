import { getArticleDoc } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence, cacheIntelligence } from "@/lib/intelligence/cacheIntelligence.js";
import { normalizeArticleForIntelligence } from "@/lib/intelligence/shared/normalization.js";
import { extractConcepts } from "./conceptExtractor.js";
import { rankLearningConcepts } from "./knowledgeGap.js";
import { generateMicroExplanation } from "./explanation.js";
import { DEFAULT_RELATIONSHIPS } from "./knowledgeGap.js";

/**
 * Run LearnPath pipeline for an article + user knowledge profile.
 */
export async function runLearnPath(articleId, options = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  const userConcepts = options.userConcepts ?? options.knowledgeProfile?.concepts ?? {};

  if (!options.force) {
    const cached = getCachedIntelligence(doc, "learnPath");
    if (cached?.data) {
      const personalized = personalizeCached(cached.data, userConcepts);
      return { success: true, data: personalized, cached: true, model: cached.model };
    }
  }

  const article = normalizeArticleForIntelligence(doc);

  const extractResult = await extractConcepts(article);
  if (!extractResult.success) return extractResult;

  const ranked = rankLearningConcepts(extractResult.concepts, userConcepts);
  const explanationCache = new Map();
  const knowledgeGaps = [];

  for (const concept of ranked) {
    const explResult = await generateMicroExplanation(article, concept, explanationCache);
    if (!explResult.success) continue;

    knowledgeGaps.push({
      conceptId: concept.conceptId,
      concept: concept.name,
      category: concept.category,
      importanceScore: concept.importanceScore,
      familiarityScore: concept.familiarityScore,
      gapScore: concept.gapScore,
      learningPriority: concept.learningPriority,
      explanation: explResult.data.explanation,
      whyItMatters: explResult.data.whyItMatters,
      example: explResult.data.example,
      connection: explResult.data.connection ?? null,
      quiz: explResult.data.quiz ?? null,
      prerequisites: findPrerequisites(concept.name),
    });
  }

  const result = {
    articleId: article.articleId,
    learningSummary: knowledgeGaps.length
      ? `This story contains ${knowledgeGaps.length} concept${knowledgeGaps.length > 1 ? "s" : ""} you may want to understand first.`
      : "You appear familiar with the key concepts in this story.",
    allConcepts: extractResult.concepts.map((c) => ({
      conceptId: c.conceptId,
      name: c.name,
      importanceScore: c.importanceScore,
    })),
    knowledgeGaps,
    relationships: DEFAULT_RELATIONSHIPS,
    generatedAt: new Date().toISOString(),
  };

  await cacheIntelligence(article.articleId, "learnPath", result, extractResult.model);

  return { success: true, data: result, cached: false, model: extractResult.model };
}

function personalizeCached(cachedData, userConcepts) {
  const ranked = rankLearningConcepts(
    cachedData.allConcepts?.map((c) => ({ ...c, normalizedName: c.conceptId })) ?? [],
    userConcepts,
  );
  const gapIds = new Set(ranked.map((r) => r.conceptId));
  return {
    ...cachedData,
    knowledgeGaps: (cachedData.knowledgeGaps ?? []).filter((g) => gapIds.has(g.conceptId)),
    learningSummary: gapIds.size
      ? `This story contains ${gapIds.size} concept${gapIds.size > 1 ? "s" : ""} you may want to understand first.`
      : "You appear familiar with the key concepts in this story.",
  };
}

function findPrerequisites(conceptName) {
  const name = conceptName.toLowerCase();
  return DEFAULT_RELATIONSHIPS.filter(([, child]) => child.toLowerCase() === name).map(([parent]) => parent);
}

export default runLearnPath;
