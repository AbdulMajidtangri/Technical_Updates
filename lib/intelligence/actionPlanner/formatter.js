/**
 * Format final ActionPlanner output for API/UI.
 */
export function formatActionPlannerResult({
  article,
  status,
  actions,
  events,
  rejected,
  signals,
  reason,
  scores,
}) {
  const actionRequired = status === "ACTION_REQUIRED" || status === "ACTION_RECOMMENDED";

  let headline = "No action required";
  if (status === "ACTION_REQUIRED") headline = "Action may be required";
  else if (status === "ACTION_RECOMMENDED") headline = "Action recommended";
  else if (status === "MONITOR") headline = "Worth monitoring";

  return {
    articleId: article.articleId,
    status,
    headline,
    actionRequired,
    actions: actions ?? [],
    events: events ?? [],
    rejectedActions: rejected ?? [],
    signals: signals ?? [],
    reason: reason ?? "",
    relevanceScore: scores?.relevanceScore ?? 0,
    urgencyScore: scores?.urgencyScore ?? 0,
    confidenceScore: scores?.confidenceScore ?? 0,
    sourceUrl: article.url,
    sourceName: article.source,
    generatedAt: new Date().toISOString(),
  };
}

export default formatActionPlannerResult;
