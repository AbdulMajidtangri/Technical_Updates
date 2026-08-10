import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { generateMissedNews } from "@/lib/ai/generateMissedNews.js";
import {
  clampNumber,
  readJsonBody,
  sanitizeInterestProfile,
  sanitizeStringArray,
} from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

export async function POST(request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "discover"));
    if (!rate.allowed) {
      return jsonError("Too many requests", { status: 429, code: "RATE_LIMITED" });
    }

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const body = parsed.data ?? {};
    const readIds = sanitizeStringArray(body.readIds, LIMITS.READ_IDS_MAX);
    const savedIds = sanitizeStringArray(body.savedIds, LIMITS.READ_IDS_MAX);
    const interestProfile = sanitizeInterestProfile(body.interestProfile);
    const limit = clampNumber(body.limit, 1, 10, 5);

    const result = await generateMissedNews({
      readIds,
      savedIds,
      interestProfile,
      limit,
      useAi: Boolean(body.useAi) && readIds.length > 0,
    });

    if (!result.success) {
      return jsonError(result.error ?? "Discovery failed", { status: 422, code: "AI_FAILED" });
    }

    return jsonSuccess(result.data);
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Discovery service unavailable" });
  }
}
