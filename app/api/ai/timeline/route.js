import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { getArticleDoc } from "@/lib/intelligence/getArticleDoc.js";
import { assignArticleToStory } from "@/lib/services/storyEngine.js";
import { getStoryBySlug } from "@/lib/data/stories.js";

export async function POST(request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "timeline"));
    if (!rate.allowed) return jsonError("Too many requests", { status: 429 });

    const body = await request.json();
    if (!body?.articleId) return jsonError("articleId is required", { status: 400 });

    const doc = await getArticleDoc(body.articleId);
    if (!doc) return jsonError("Article not found", { status: 404 });

    const storyDoc = await assignArticleToStory(doc);
    const story = storyDoc?.slug ? await getStoryBySlug(storyDoc.slug) : null;

    return jsonSuccess({ story });
  } catch (err) {
    return jsonFromError(err);
  }
}
