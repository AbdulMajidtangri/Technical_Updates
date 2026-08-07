import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { generateScenario } from "@/lib/ai/generateScenario.js";

export async function POST(request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "scenario"));
    if (!rate.allowed) {
      return jsonError("Too many scenario requests. Please wait.", { status: 429, code: "RATE_LIMITED" });
    }

    const body = await request.json();
    if (!body?.articleId) {
      return jsonError("articleId is required", { status: 400 });
    }

    const question = body.question?.trim() || "What if this development has widespread adoption?";
    const result = await generateScenario(body.articleId, question, { force: Boolean(body.force) });

    if (!result.success) {
      return jsonError(result.error ?? "Scenario analysis failed", { status: 422 });
    }

    return jsonSuccess({ ...result.data, cached: result.cached, model: result.model });
  } catch (err) {
    return jsonFromError(err);
  }
}
