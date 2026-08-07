import mongoose from "mongoose";
import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";

/**
 * Fetch raw article document for intelligence processing.
 * @param {string} articleId
 */
export async function getArticleDoc(articleId) {
  await connectDB();
  const id = String(articleId ?? "").trim();
  if (!id) return null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await Article.findById(id).lean();
    if (doc) return doc;
  }

  return Article.findOne({ slug: id }).lean();
}

export function articleContextForAI(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    summary: doc.summary ?? "",
    simpleExplanation: doc.simpleExplanation ?? "",
    whyItMatters: doc.whyItMatters ?? "",
    category: doc.category ?? "Other",
    tags: doc.tags ?? [],
    entities: doc.entities ?? [],
    sourceName: doc.sourceName ?? "",
    publishedAt: doc.publishedAt ?? null,
    articleUrl: doc.articleUrl ?? "",
    importanceScore: doc.importanceScore ?? 0,
  };
}

export default getArticleDoc;
