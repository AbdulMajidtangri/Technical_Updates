import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";
import { DEFAULT_RELATIONSHIPS, getCategoryFamiliarity } from "@/lib/intelligence/learnPath/knowledgeGap.js";
import { readJsonBody, sanitizeRecord } from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

export async function POST(request) {
  try {
    const rate = checkApiRateLimit(getApiClientKey(request, "knowledge-profile"));
    if (!rate.allowed) {
      return jsonError("Too many requests", { status: 429, code: "RATE_LIMITED" });
    }

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const body = parsed.data ?? {};
    const concepts = sanitizeRecord(
      body.knowledgeProfile?.concepts ?? body.concepts ?? {},
      LIMITS.CONCEPTS_MAX,
    );
    const categoryScores = getCategoryFamiliarity(concepts);

    const conceptList = Object.values(concepts)
      .slice(0, LIMITS.CONCEPTS_MAX)
      .sort((a, b) => (b.familiarityScore ?? 0) - (a.familiarityScore ?? 0));

    return jsonSuccess({
      profileId: typeof body.profileId === "string" ? body.profileId.slice(0, 64) : null,
      categoryScores,
      concepts: conceptList,
      relationships: DEFAULT_RELATIONSHIPS,
    });
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Knowledge profile service unavailable" });
  }
}

export async function GET(request) {
  const rate = checkApiRateLimit(getApiClientKey(request, "knowledge-profile-get"));
  if (!rate.allowed) {
    return jsonError("Too many requests", { status: 429, code: "RATE_LIMITED" });
  }

  return jsonSuccess({
    message: "POST your knowledge profile to retrieve computed scores.",
    relationships: DEFAULT_RELATIONSHIPS,
  });
}
