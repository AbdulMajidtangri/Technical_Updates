import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { verifyPrivilegedAccess } from "@/lib/auth.js";
import { isValidObjectId, readJsonBody } from "@/lib/security/validation.js";

/**
 * Shared handler wrapper for AI POST routes.
 * @param {Request} request
 * @param {{ feature: string, handler: (body: object) => Promise<object>, requireArticleId?: boolean }} options
 */
export async function handleAiRoute(request, { feature, handler, requireArticleId = true }) {
  try {
    const rateKey = getClientKey(request, feature);
    const rate = checkRateLimit(rateKey);
    if (!rate.allowed) {
      return jsonError("Too many requests. Please wait a moment.", {
        status: 429,
        code: "RATE_LIMITED",
      });
    }

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const body = parsed.data ?? {};

    if (requireArticleId) {
      const articleId = body?.articleId;
      if (!articleId) {
        return jsonError("articleId is required", { status: 400, code: "MISSING_ARTICLE_ID" });
      }
      if (!isValidObjectId(String(articleId))) {
        return jsonError("Invalid articleId", { status: 400, code: "INVALID_ARTICLE_ID" });
      }
    }

    if (Boolean(body.force)) {
      const privileged = verifyPrivilegedAccess(request);
      if (!privileged.authorized) {
        return jsonError("Owner authentication required for force refresh", {
          status: privileged.status ?? 401,
          code: "UNAUTHORIZED",
        });
      }
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
