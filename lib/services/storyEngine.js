import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import Story from "@/models/Story.js";
import { createHash } from "crypto";
import { slugify } from "@/lib/utils/slugify.js";
import { extractEntitiesFromArticle } from "@/lib/intelligence/findConnectionCandidates.js";

function inferEventType(title = "") {
  const t = title.toLowerCase();
  if (/announce|launch|release|introduc|unveil/.test(t)) return "announcement";
  if (/react|respond|criti|backlash|concern/.test(t)) return "reaction";
  if (/detail|spec|technical|how/.test(t)) return "detail";
  if (/conclud|final|end|close|verdict/.test(t)) return "conclusion";
  return "update";
}

/**
 * Deterministic story assignment — no OpenAI.
 * @param {object} doc - article lean document
 */
export async function assignArticleToStory(doc) {
  await connectDB();
  if (!doc?._id) return null;

  if (doc.storyId) {
    return Story.findById(doc.storyId).lean();
  }

  const entities = extractEntitiesFromArticle(doc);
  const tags = doc.tags ?? [];

  let story = null;

  if (entities.length >= 2) {
    story = await Story.findOne({
      keyEntities: { $in: entities },
      category: doc.category,
      status: { $in: ["DEVELOPING", "ACTIVE"] },
    })
      .sort({ lastUpdatedAt: -1 })
      .lean();
  }

  if (!story && tags.length >= 2) {
    story = await Story.findOne({
      keyEntities: { $in: tags.slice(0, 4) },
      status: { $in: ["DEVELOPING", "ACTIVE"] },
    })
      .sort({ lastUpdatedAt: -1 })
      .lean();
  }

  const publishedAt = doc.publishedAt ?? doc.collectedAt ?? new Date();
  const event = {
    date: publishedAt,
    title: doc.title.slice(0, 300),
    description: (doc.summary || doc.description || "").slice(0, 500),
    articleId: doc._id,
    eventType: inferEventType(doc.title),
  };

  if (story) {
    const articleIds = [...new Set([...(story.articleIds ?? []).map(String), String(doc._id)])];
    const timeline = [...(story.timeline ?? []), event].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    await Story.updateOne(
      { _id: story._id },
      {
        $set: {
          articleIds,
          timeline,
          lastUpdatedAt: publishedAt,
          importanceScore: Math.max(story.importanceScore ?? 0, doc.importanceScore ?? 0),
          keyEntities: [...new Set([...(story.keyEntities ?? []), ...entities])].slice(0, 20),
        },
      },
    );

    await Article.updateOne({ _id: doc._id }, { $set: { storyId: story._id, entities } });
    return Story.findById(story._id).lean();
  }

  const baseSlug = slugify(doc.title).slice(0, 60) || "story";
  const slug = `${baseSlug}-${createHash("sha256").update(doc.title).digest("hex").slice(0, 6)}`;

  const created = await Story.create({
    title: doc.title.slice(0, 200),
    slug,
    description: doc.summary || doc.description || "",
    category: doc.category ?? "Other",
    status: "DEVELOPING",
    importanceScore: doc.importanceScore ?? 50,
    firstPublishedAt: publishedAt,
    lastUpdatedAt: publishedAt,
    coverImage: doc.imageUrl ?? "",
    articleIds: [doc._id],
    keyEntities: entities,
    timeline: [event],
  });

  await Article.updateOne({ _id: doc._id }, { $set: { storyId: created._id, entities } });
  return created.toObject();
}

export async function ensureStoryForArticle(articleId) {
  const doc = await Article.findById(articleId).lean();
  if (!doc) return null;
  return assignArticleToStory(doc);
}

export default assignArticleToStory;
