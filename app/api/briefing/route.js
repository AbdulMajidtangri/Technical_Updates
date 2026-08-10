import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";
import { getArticles } from "@/lib/data/articles.js";
import { buildBriefing, BRIEFING_MINUTES_OPTIONS } from "@/lib/briefing/buildBriefing.js";
import {
  clampNumber,
  readJsonBody,
  sanitizeInterestProfile,
  sanitizeStringArray,
} from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

function rateLimitOrError(request) {
  const rate = checkApiRateLimit(getApiClientKey(request, "briefing"));
  if (!rate.allowed) {
    return jsonError("Too many briefing requests. Please wait.", {
      status: 429,
      code: "RATE_LIMITED",
    });
  }
  return null;
}

export async function POST(request) {
  try {
    const limited = rateLimitOrError(request);
    if (limited) return limited;

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const body = parsed.data ?? {};
    const minutes = Number(body.minutes ?? 15);
    if (!BRIEFING_MINUTES_OPTIONS.includes(minutes)) {
      return jsonError("minutes must be 5, 10, or 15", { status: 400, code: "INVALID_MINUTES" });
    }

    const readIds = sanitizeStringArray(body.readIds, LIMITS.READ_IDS_MAX);
    const interestProfile = sanitizeInterestProfile(body.interestProfile);

    const { articles } = await getArticles({
      limit: LIMITS.BRIEFING_ARTICLES_MAX,
      analyzed: true,
      importance: 40,
    });

    const briefing = buildBriefing(articles, {
      minutes,
      readIds,
      interestProfile,
    });

    return jsonSuccess(briefing);
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Briefing service unavailable" });
  }
}

export async function GET(request) {
  try {
    const limited = rateLimitOrError(request);
    if (limited) return limited;

    const url = new URL(request.url);
    const minutes = clampNumber(url.searchParams.get("minutes"), 5, 15, 15);
    if (!BRIEFING_MINUTES_OPTIONS.includes(minutes)) {
      return jsonError("minutes must be 5, 10, or 15", { status: 400, code: "INVALID_MINUTES" });
    }

    const { articles } = await getArticles({
      limit: LIMITS.BRIEFING_ARTICLES_MAX,
      analyzed: true,
      importance: 40,
    });

    const briefing = buildBriefing(articles, { minutes });
    return jsonSuccess(briefing);
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Briefing service unavailable" });
  }
}
