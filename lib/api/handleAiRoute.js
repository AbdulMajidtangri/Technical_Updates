import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";

/**
 * Shared handler wrapper for AI POST routes.
 * @param {Request} request
 * @param {{ feature: string, handler: (body: object) => Promise<object> }} options
 */
export async function handleAiRoute(request, { feature, handler }) {
  try {
    const rateKey = getClientKey(request, feature);
    const rate = checkRateLimit(rateKey);
    if (!rate.allowed) {
      return jsonError("Too many requests. Please wait a moment.", {
        status: 429,
        code: "RATE_LIMITED",
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", { status: 400, code: "INVALID_JSON" });
    }

    const articleId = body?.articleId;
    if (!articleId) {
      return jsonError("articleId is required", { status: 400, code: "MISSING_ARTICLE_ID" });
    }

    const result = await handler(body);
    if (!result.success) {
      return jsonError(result.error ?? "AI processing failed", {
        status: 422,
        code: "AI_FAILED",
        details: result.details,
      });
    }

    return jsonSuccess({
      ...result.data,
      cached: result.cached ?? false,
      model: result.model,
    });
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Intelligence service unavailable" });
  }
}

export default handleAiRoute;
