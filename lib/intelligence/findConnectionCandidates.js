import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
  "from", "as", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall",
  "can", "need", "dare", "ought", "used", "it", "its", "this", "that", "these", "those",
  "i", "you", "he", "she", "we", "they", "what", "which", "who", "whom", "when", "where",
  "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some",
  "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "new", "says", "said", "after", "over", "into", "about", "up", "out", "off", "down",
]);

export function extractEntitiesFromArticle(doc) {
  const entities = new Set();

  for (const tag of doc.tags ?? []) {
    const t = String(tag).trim();
    if (t.length >= 2) entities.add(t);
  }

  for (const word of (doc.title ?? "").split(/\s+/)) {
    const clean = word.replace(/[^a-zA-Z0-9.-]/g, "");
    if (clean.length >= 3 && !STOPWORDS.has(clean.toLowerCase())) {
      if (/^[A-Z]/.test(clean) || clean.length >= 5) entities.add(clean);
    }
  }

  return [...entities].slice(0, 12);
}

/**
 * Deterministic candidate finder — no OpenAI.
 * @param {object} doc - article lean doc
 * @param {number} limit
 */
export async function findConnectionCandidates(doc, limit = 8) {
  await connectDB();
  const articleId = doc._id;
  const entities = extractEntitiesFromArticle(doc);
  const tags = doc.tags ?? [];

  const orConditions = [];

  if (tags.length) {
    orConditions.push({ tags: { $in: tags } });
  }

  if (entities.length) {
    orConditions.push({ tags: { $in: entities } });
    orConditions.push({ title: { $regex: entities.slice(0, 3).join("|"), $options: "i" } });
  }

  if (doc.category && doc.category !== "Other") {
    orConditions.push({ category: doc.category });
  }

  if (!orConditions.length) {
    return Article.find({
      _id: { $ne: articleId },
      isDuplicate: { $ne: true },
      importanceScore: { $gte: 60 },
    })
      .sort({ importanceScore: -1, publishedAt: -1 })
      .limit(limit)
      .lean();
  }

  const candidates = await Article.find({
    _id: { $ne: articleId },
    isDuplicate: { $ne: true },
    $or: orConditions,
  })
    .sort({ importanceScore: -1, publishedAt: -1 })
    .limit(limit * 2)
    .lean();

  const scored = candidates.map((c) => {
    let score = 0;
    const cTags = new Set(c.tags ?? []);
    for (const t of tags) if (cTags.has(t)) score += 3;
    for (const e of entities) {
      if (cTags.has(e)) score += 2;
      if (c.title?.toLowerCase().includes(e.toLowerCase())) score += 1;
    }
    if (c.category === doc.category) score += 1;
    return { ...c, _matchScore: score };
  });

  return scored
    .sort((a, b) => b._matchScore - a._matchScore || (b.importanceScore ?? 0) - (a.importanceScore ?? 0))
    .slice(0, limit);
}

export default findConnectionCandidates;
