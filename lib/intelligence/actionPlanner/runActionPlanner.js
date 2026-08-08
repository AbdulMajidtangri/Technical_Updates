import { getArticleDoc } from "@/lib/intelligence/getArticleDoc.js";
import { getCachedIntelligence, cacheIntelligence } from "@/lib/intelligence/cacheIntelligence.js";
import { normalizeArticleForIntelligence } from "@/lib/intelligence/shared/normalization.js";
import { INTELLIGENCE_CONFIG } from "@/lib/intelligence/shared/config.js";
import { connectDB } from "@/lib/db.js";
import ActionAnalysis from "@/models/ActionAnalysis.js";
import { detectActionSignals } from "./detector.js";
import { extractEvents, generateActionCandidates } from "./extractor.js";
import { verifyActionCandidates } from "./verifier.js";
import { scoreAndRankActions, classifyActionStatus } from "./scorer.js";
import { formatActionPlannerResult } from "./formatter.js";

/**
 * Run the full ActionPlanner pipeline for an article.
 */
export async function runActionPlanner(articleId, options = {}) {
  const doc = await getArticleDoc(articleId);
  if (!doc) return { success: false, error: "Article not found" };

  if (!options.force) {
    const cached = getCachedIntelligence(doc, "actionPlanner");
    if (cached?.data) return { success: true, data: cached.data, cached: true, model: cached.model };
  }

  const article = normalizeArticleForIntelligence(doc);
  const { signals, audiences, signalStrength } = detectActionSignals(article);

  if (signalStrength < 15 && (article.importanceScore ?? 0) < 55) {
    const empty = formatActionPlannerResult({
      article,
      status: "NO_ACTION_REQUIRED",
      actions: [],
      events: [],
      rejected: [],
      signals,
      reason: "No actionable signals detected in this article.",
      scores: { relevanceScore: 0, urgencyScore: 0, confidenceScore: 0 },
    });
    await persistActionAnalysis(article.articleId, empty, "deterministic");
    await cacheIntelligence(article.articleId, "actionPlanner", empty, "deterministic");
    return { success: true, data: empty, cached: false, model: "deterministic" };
  }

  const eventsResult = await extractEvents(article);
  if (!eventsResult.success) return eventsResult;
  const events = eventsResult.events ?? [];

  const candidatesResult = await generateActionCandidates(article, events, signals, audiences);
  if (!candidatesResult.success) return candidatesResult;

  if (!candidatesResult.actionRequired || !candidatesResult.candidates?.length) {
    const empty = formatActionPlannerResult({
      article,
      status: "NO_ACTION_REQUIRED",
      actions: [],
      events,
      rejected: [],
      signals,
      reason: "This article does not identify a specific action readers need to take.",
      scores: { relevanceScore: 0, urgencyScore: signalStrength, confidenceScore: 0 },
    });
    await persistActionAnalysis(article.articleId, empty, candidatesResult.model);
    await cacheIntelligence(article.articleId, "actionPlanner", empty, candidatesResult.model);
    return { success: true, data: empty, cached: false, model: candidatesResult.model };
  }

  const { verified, rejected } = verifyActionCandidates(article, candidatesResult.candidates);
  const actions = scoreAndRankActions(verified, article, signals, audiences, options.userInterest ?? {});

  const cfg = INTELLIGENCE_CONFIG.actionPlanner;
  const displayActions = actions.filter(
    (a) => a.confidenceScore >= cfg.minConfidenceToShow && a.relevanceScore >= cfg.minRelevanceToShow,
  );

  const avgConfidence = displayActions.length
    ? displayActions.reduce((s, a) => s + a.confidenceScore, 0) / displayActions.length
    : 0;
  const avgRelevance = displayActions.length
    ? displayActions.reduce((s, a) => s + a.relevanceScore, 0) / displayActions.length
    : 0;
  const avgUrgency = displayActions.length
    ? displayActions.reduce((s, a) => s + a.urgencyScore, 0) / displayActions.length
    : 0;

  const status = classifyActionStatus(displayActions, avgConfidence, avgRelevance, signalStrength);

  const result = formatActionPlannerResult({
    article,
    status,
    actions: displayActions,
    events,
    rejected,
    signals,
    reason: displayActions.length
      ? displayActions[0].reason
      : "No verified actions met evidence and confidence thresholds.",
    scores: {
      relevanceScore: Math.round(avgRelevance),
      urgencyScore: Math.round(avgUrgency),
      confidenceScore: Math.round(avgConfidence),
    },
  });

  await persistActionAnalysis(article.articleId, result, candidatesResult.model);
  await cacheIntelligence(article.articleId, "actionPlanner", result, candidatesResult.model);

  return { success: true, data: result, cached: false, model: candidatesResult.model };
}

async function persistActionAnalysis(articleId, result, model) {
  await connectDB();
  await ActionAnalysis.findOneAndUpdate(
    { articleId },
    {
      $set: {
        articleId,
        status: result.status,
        headline: result.headline,
        actionRequired: result.actionRequired,
        actions: result.actions,
        events: result.events,
        rejectedActions: result.rejectedActions,
        signals: result.signals,
        relevanceScore: result.relevanceScore,
        urgencyScore: result.urgencyScore,
        confidenceScore: result.confidenceScore,
        reason: result.reason,
        model,
        generatedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );
}

export default runActionPlanner;
