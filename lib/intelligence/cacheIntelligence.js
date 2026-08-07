import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";

/**
 * Cache intelligence result on article document.
 * @param {string} articleId
 * @param {string} feature - understand | impact | connections | learning
 * @param {object} data
 * @param {string} model
 */
export async function cacheIntelligence(articleId, feature, data, model) {
  await connectDB();
  const key = `intelligenceCache.${feature}`;
  await Article.updateOne(
    { _id: articleId },
    {
      $set: {
        [key]: {
          data,
          generatedAt: new Date(),
          model,
        },
      },
    },
  );
}

/**
 * Cache scenario by question hash.
 */
export async function cacheScenario(articleId, questionHash, data, model) {
  await connectDB();
  const key = `intelligenceCache.scenarios.${questionHash}`;
  await Article.updateOne(
    { _id: articleId },
    {
      $set: {
        [key]: {
          data,
          question: data.question,
          generatedAt: new Date(),
          model,
        },
      },
    },
  );
}

/**
 * Get cached intelligence if present.
 */
export function getCachedIntelligence(doc, feature) {
  const cache = doc?.intelligenceCache?.[feature];
  if (cache?.data) return cache;
  return null;
}

export function getCachedScenario(doc, questionHash) {
  const cache = doc?.intelligenceCache?.scenarios?.[questionHash];
  if (cache?.data) return cache;
  return null;
}

export default cacheIntelligence;
