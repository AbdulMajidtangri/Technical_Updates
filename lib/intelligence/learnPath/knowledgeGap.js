import { clamp } from "../shared/confidence.js";
import { INTELLIGENCE_CONFIG } from "../shared/config.js";

/** Default concept relationships for knowledge map */
export const DEFAULT_RELATIONSHIPS = [
  ["Artificial Intelligence", "Machine Learning", "prerequisite"],
  ["Machine Learning", "Deep Learning", "prerequisite"],
  ["Deep Learning", "Transformer", "prerequisite"],
  ["Transformer", "LLM", "example_of"],
  ["LLM", "Inference", "depends_on"],
  ["LLM", "RAG", "related"],
  ["JavaScript", "React", "prerequisite"],
  ["React", "Next.js", "depends_on"],
];

/**
 * Compute knowledge gap score for a concept.
 */
export function computeGapScore(importanceScore, familiarityScore) {
  const importance = clamp(importanceScore);
  const familiarity = clamp(familiarityScore) / 100;
  return clamp(importance * (1 - familiarity));
}

/**
 * Rank concepts for learning priority.
 */
export function rankLearningConcepts(concepts, userConcepts = {}) {
  const cfg = INTELLIGENCE_CONFIG.learnPath;

  return concepts
    .map((concept) => {
      const profile = userConcepts[concept.conceptId] ?? userConcepts[concept.normalizedName] ?? {};
      const familiarityScore = clamp(profile.familiarityScore ?? 0);
      const gapScore = computeGapScore(concept.importanceScore, familiarityScore);

      const prerequisiteImportance = 50;
      const learningPriority = clamp(
        concept.importanceScore * 0.45 + gapScore * 0.4 + prerequisiteImportance * 0.15,
      );

      return {
        ...concept,
        familiarityScore,
        confidenceScore: clamp(profile.confidenceScore ?? 0),
        exposureCount: profile.exposureCount ?? 0,
        gapScore,
        learningPriority,
      };
    })
    .filter((c) => c.importanceScore >= cfg.minImportanceForCard && c.gapScore >= cfg.minGapForCard)
    .sort((a, b) => b.learningPriority - a.learningPriority)
    .slice(0, cfg.maxLearningCards);
}

export function getCategoryFamiliarity(userConcepts = {}) {
  const categories = {};

  for (const entry of Object.values(userConcepts)) {
    const cat = entry.category ?? "General";
    if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
    categories[cat].total += entry.familiarityScore ?? 0;
    categories[cat].count += 1;
  }

  return Object.fromEntries(
    Object.entries(categories).map(([cat, { total, count }]) => [cat, Math.round(total / count)]),
  );
}

export default rankLearningConcepts;
