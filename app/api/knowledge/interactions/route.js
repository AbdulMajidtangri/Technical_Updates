import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";
import { INTELLIGENCE_CONFIG } from "@/lib/intelligence/shared/config.js";
import { clamp } from "@/lib/intelligence/shared/confidence.js";
import {
  isAllowedInteractionType,
  readJsonBody,
  sanitizeRecord,
  sanitizeString,
} from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

export async function POST(request) {
  try {
    const rate = checkApiRateLimit(getApiClientKey(request, "knowledge-interactions"));
    if (!rate.allowed) {
      return jsonError("Too many requests", { status: 429, code: "RATE_LIMITED" });
    }

    const parsed = await readJsonBody(request);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const body = parsed.data ?? {};
    const { type, conceptId, name, category, result } = body;
    const concepts = sanitizeRecord(body.concepts, LIMITS.CONCEPTS_MAX);

    if (!type || !conceptId) {
      return jsonError("type and conceptId are required", { status: 400, code: "MISSING_FIELDS" });
    }

    if (!isAllowedInteractionType(type)) {
      return jsonError("Invalid interaction type", { status: 400, code: "INVALID_TYPE" });
    }

    const safeConceptId = sanitizeString(String(conceptId), 64);
    if (!safeConceptId) {
      return jsonError("Invalid conceptId", { status: 400, code: "INVALID_CONCEPT_ID" });
    }

    const cfg = INTELLIGENCE_CONFIG.learnPath.familiarityUpdate;
    const existing = concepts[safeConceptId] ?? {
      conceptId: safeConceptId,
      name: sanitizeString(name ?? safeConceptId, 120),
      category: sanitizeString(category ?? "General", 64),
      familiarityScore: 0,
      confidenceScore: 50,
      exposureCount: 0,
    };

    let familiarityDelta = 0;
    let confidenceDelta = 0;

    switch (type) {
      case "exposure":
        familiarityDelta = cfg.exposure;
        break;
      case "understood":
        familiarityDelta = cfg.openedExplanation;
        confidenceDelta = 5;
        break;
      case "already_know":
        familiarityDelta = cfg.alreadyKnow;
        confidenceDelta = 10;
        break;
      case "quiz_correct":
        familiarityDelta = cfg.quizCorrect;
        confidenceDelta = 8;
        break;
      case "quiz_wrong":
        familiarityDelta = cfg.quizWrong;
        confidenceDelta = -5;
        break;
      default:
        return jsonError("Invalid interaction type", { status: 400, code: "INVALID_TYPE" });
    }

    const updated = {
      ...existing,
      familiarityScore: clamp((existing.familiarityScore ?? 0) + familiarityDelta),
      confidenceScore: clamp((existing.confidenceScore ?? 50) + confidenceDelta),
      exposureCount: (existing.exposureCount ?? 0) + 1,
      lastSeen: new Date().toISOString(),
      manuallyConfirmed: type === "already_know" ? true : existing.manuallyConfirmed,
      lastInteraction: {
        type,
        result: typeof result === "string" ? result.slice(0, 120) : null,
      },
    };

    return jsonSuccess({ concept: updated });
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Interaction service unavailable" });
  }
}
