import { ACTION_SIGNAL_PATTERNS, AUDIENCE_KEYWORDS } from "./constants.js";

/**
 * Deterministic rule-based action signal detection.
 * @param {object} article - normalized article
 * @returns {{ signals: object[], audiences: string[], signalStrength: number }}
 */
export function detectActionSignals(article) {
  const text = `${article.title}\n${article.content}\n${article.summary}`.toLowerCase();
  const signals = [];

  for (const { type, patterns } of ACTION_SIGNAL_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        signals.push({ type, matched: pattern.source });
        break;
      }
    }
  }

  const audiences = [];
  for (const [audience, patterns] of Object.entries(AUDIENCE_KEYWORDS)) {
    if (patterns.some((p) => p.test(text))) audiences.push(audience);
  }

  if (!audiences.length && article.category === "Software Development") audiences.push("Developers");
  if (!audiences.length && article.developerImpact === "High") audiences.push("Developers");

  const signalStrength = Math.min(100, signals.length * 18 + (article.importanceScore ?? 0) * 0.2);

  return { signals, audiences, signalStrength };
}

export default detectActionSignals;
