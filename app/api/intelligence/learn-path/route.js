import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { runLearnPath } from "@/lib/intelligence/learnPath/runLearnPath.js";

export async function POST(request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "learn-path"));
    if (!rate.allowed) {
      return jsonError("Too many requests. Please wait.", { status: 429, code: "RATE_LIMITED" });
    }

    const body = await request.json();
    if (!body?.articleId) {
      return jsonError("articleId is required", { status: 400 });
    }

    const result = await runLearnPath(body.articleId, {
      force: Boolean(body.force),
      userConcepts: body.knowledgeProfile?.concepts ?? body.userConcepts ?? {},
      knowledgeProfile: body.knowledgeProfile,
    });

    if (!result.success) {
      return jsonError(result.error ?? "LearnPath failed", { status: 422 });
    }

    return jsonSuccess({ ...result.data, cached: result.cached, model: result.model });
  } catch (err) {
    return jsonFromError(err);
  }
}
