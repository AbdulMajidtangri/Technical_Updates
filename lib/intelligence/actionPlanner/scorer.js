import { clamp, confidenceLevel, urgencyLabel } from "../shared/confidence.js";
import { INTELLIGENCE_CONFIG } from "../shared/config.js";

export function scoreAudienceMatch(candidate, detectedAudiences, userInterest = {}) {
  const audience = candidate.targetAudience ?? "";
  let score = 40;

  if (detectedAudiences.some((a) => audience.toLowerCase().includes(a.toLowerCase()))) score += 40;

  for (const [cat, weight] of Object.entries(userInterest.categories ?? {})) {
    if (weight >= 0.5 && audience.toLowerCase().includes(cat.toLowerCase())) score += 15;
  }

  return clamp(score);
}

export function scoreRelevance(candidate, article, audienceMatch) {
  const directImpact = candidate.explicitness === "direct" ? 85 : candidate.explicitness === "implied" ? 65 : 40;
  const geographicMatch = 50;
  const temporalRelevance = candidate.deadline ? 80 : 45;

  const relevanceScore = clamp(
    audienceMatch * 0.4 + directImpact * 0.3 + geographicMatch * 0.15 + temporalRelevance * 0.15,
  );

  return relevanceScore;
}

export function scoreUrgency(candidate, signals, article) {
  let deadlineFactor = candidate.deadline ? 35 : 0;
  let severityFactor = 0;

  const severityTypes = ["vulnerability", "recall", "emergency", "end_of_support"];
  if (signals.some((s) => severityTypes.includes(s.type))) severityFactor = 30;

  let timeSensitivity = (article.importanceScore ?? 0) * 0.25;

  return clamp(deadlineFactor + severityFactor + timeSensitivity);
}

export function scoreConfidence(candidate, verificationScore, article) {
  let score = verificationScore ?? 50;

  if (candidate.explicitness === "direct") score += 15;
  if (candidate.sourceQuote) score += 10;
  if (article.sourceName) score += 5;

  return clamp(score);
}

export function classifyActionStatus(actions, avgConfidence, avgRelevance, signalStrength) {
  const cfg = INTELLIGENCE_CONFIG.actionPlanner;

  if (!actions.length) return "NO_ACTION_REQUIRED";

  if (avgConfidence >= cfg.actionRequiredConfidence && avgRelevance >= cfg.minRelevanceToShow) {
    return actions.some((a) => a.explicitness === "direct") ? "ACTION_REQUIRED" : "ACTION_RECOMMENDED";
  }

  if (avgConfidence >= cfg.actionRecommendedConfidence || signalStrength >= 50) {
    return "ACTION_RECOMMENDED";
  }

  if (avgConfidence >= cfg.monitorConfidence || signalStrength >= 30) {
    return "MONITOR";
  }

  return "NO_ACTION_REQUIRED";
}

export function scoreAndRankActions(candidates, article, signals, audiences, userInterest = {}) {
  return candidates
    .map((candidate) => {
      const audienceMatch = scoreAudienceMatch(candidate, audiences, userInterest);
      const relevanceScore = scoreRelevance(candidate, article, audienceMatch);
      const urgencyScore = scoreUrgency(candidate, signals, article);
      const confidenceScore = scoreConfidence(candidate, candidate.verificationScore, article);

      return {
        title: candidate.title,
        description: candidate.description,
        targetAudience: candidate.targetAudience,
        urgency: urgencyLabel(urgencyScore),
        urgencyScore,
        confidence: confidenceLevel(confidenceScore),
        confidenceScore,
        deadline: candidate.deadline ?? null,
        evidence: candidate.evidence,
        sourceQuote: candidate.sourceQuote ?? null,
        reason: candidate.reason,
        relevanceScore,
        explicitness: candidate.explicitness,
      };
    })
    .sort((a, b) => b.confidenceScore + b.relevanceScore - (a.confidenceScore + a.relevanceScore))
    .slice(0, INTELLIGENCE_CONFIG.actionPlanner.maxActions);
}

export default scoreAndRankActions;
