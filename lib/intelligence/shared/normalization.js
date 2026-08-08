import { INTELLIGENCE_CONFIG } from "./config.js";

const HTML_TAG = /<[^>]+>/g;

export function stripHtml(text = "") {
  return String(text).replace(HTML_TAG, " ").replace(/\s+/g, " ").trim();
}

/**
 * Normalized article for intelligence pipelines.
 * @param {object} doc - MongoDB article lean doc
 */
export function normalizeArticleForIntelligence(doc) {
  if (!doc) return null;

  const content = stripHtml(
    [doc.description, doc.summary, doc.simpleExplanation].filter(Boolean).join("\n\n"),
  ).slice(0, INTELLIGENCE_CONFIG.contentMaxChars);

  return {
    articleId: String(doc._id),
    title: doc.title ?? "",
    source: doc.sourceName ?? "",
    url: doc.articleUrl ?? "",
    publishedAt: doc.publishedAt ?? null,
    category: doc.category ?? "Other",
    summary: doc.summary ?? doc.simpleExplanation ?? "",
    content,
    entities: doc.entities ?? [],
    keywords: doc.tags ?? [],
    importanceScore: doc.importanceScore ?? 0,
    developerImpact: doc.developerImpact ?? "Low",
  };
}

export default normalizeArticleForIntelligence;
