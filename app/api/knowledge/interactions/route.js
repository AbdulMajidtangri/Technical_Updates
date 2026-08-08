import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { INTELLIGENCE_CONFIG } from "@/lib/intelligence/shared/config.js";
import { clamp } from "@/lib/intelligence/shared/confidence.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, conceptId, name, category, result, concepts = {} } = body;

    if (!type || !conceptId) {
      return jsonError("type and conceptId are required", { status: 400 });
    }

    const cfg = INTELLIGENCE_CONFIG.learnPath.familiarityUpdate;
    const existing = concepts[conceptId] ?? {
      conceptId,
      name: name ?? conceptId,
      category: category ?? "General",
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
        return jsonError("Invalid interaction type", { status: 400 });
    }

    const updated = {
      ...existing,
      familiarityScore: clamp((existing.familiarityScore ?? 0) + familiarityDelta),
      confidenceScore: clamp((existing.confidenceScore ?? 50) + confidenceDelta),
      exposureCount: (existing.exposureCount ?? 0) + 1,
      lastSeen: new Date().toISOString(),
      manuallyConfirmed: type === "already_know" ? true : existing.manuallyConfirmed,
      lastInteraction: { type, result: result ?? null },
    };

    return jsonSuccess({ concept: updated });
  } catch (err) {
    return jsonFromError(err);
  }
}
