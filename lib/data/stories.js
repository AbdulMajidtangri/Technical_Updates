import { connectDB } from "@/lib/db.js";
import Story from "@/models/Story.js";
import Article from "@/models/Article.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";

function toStoryResponse(doc, articles = []) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? "",
    category: doc.category ?? "Other",
    status: doc.status ?? "DEVELOPING",
    importanceScore: doc.importanceScore ?? 0,
    firstPublishedAt: doc.firstPublishedAt ?? null,
    lastUpdatedAt: doc.lastUpdatedAt ?? null,
    coverImage: doc.coverImage ?? "",
    keyEntities: doc.keyEntities ?? [],
    timeline: (doc.timeline ?? []).map((e) => ({
      id: e._id ? String(e._id) : undefined,
      date: e.date,
      title: e.title,
      description: e.description ?? "",
      articleId: e.articleId ? String(e.articleId) : null,
      eventType: e.eventType ?? "update",
    })),
    articleIds: (doc.articleIds ?? []).map(String),
    articles,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getStories(options = {}) {
  await connectDB();
  const limit = Math.min(50, Math.max(1, Number(options.limit ?? 20)));
  const filter = {};
  if (options.status) filter.status = options.status;

  const docs = await Story.find(filter)
    .sort({ lastUpdatedAt: -1, importanceScore: -1 })
    .limit(limit)
    .lean();

  return {
    stories: docs.map((d) => toStoryResponse(d)),
    total: docs.length,
  };
}

export async function getStoryBySlug(slug) {
  await connectDB();
  const doc = await Story.findOne({ slug: decodeURIComponent(String(slug ?? "").trim()) }).lean();
  if (!doc) return null;

  const articles = doc.articleIds?.length
    ? await Article.find({ _id: { $in: doc.articleIds } })
        .sort({ publishedAt: -1 })
        .lean()
    : [];

  return toStoryResponse(doc, articles.map(toArticleResponse));
}

export async function getDevelopingStories(limit = 6) {
  await connectDB();
  const docs = await Story.find({ status: { $in: ["DEVELOPING", "ACTIVE"] } })
    .sort({ lastUpdatedAt: -1, importanceScore: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => toStoryResponse(d));
}

export default getStories;
