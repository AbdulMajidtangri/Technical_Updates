import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { verifyPrivilegedAccess } from "@/lib/auth.js";
import { generateScenario } from "@/lib/ai/generateScenario.js";
import {
  isValidObjectId,
  readJsonBody,
  sanitizeString,
} from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

export async function POST(request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "scenario"));
    if (!rate.allowed) {
      return jsonError("Too many scenario requests. Please wait.", { status: 429, code: "RATE_LIMITED" });
    }

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const body = parsed.data ?? {};
    if (!body.articleId || !isValidObjectId(String(body.articleId))) {
      return jsonError("Valid articleId is required", { status: 400, code: "INVALID_ARTICLE_ID" });
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

    const question =
      sanitizeString(
        body.question?.trim() || "What if this development has widespread adoption?",
        LIMITS.QUESTION_MAX_CHARS,
      ) || "What if this development has widespread adoption?";

    const result = await generateScenario(body.articleId, question, { force: Boolean(body.force) });

    if (!result.success) {
      return jsonError(result.error ?? "Scenario analysis failed", { status: 422, code: "AI_FAILED" });
    }

    return jsonSuccess({ ...result.data, cached: result.cached, model: result.model });
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Scenario service unavailable" });
  }
}
