import { clamp } from "../shared/confidence.js";

/**
 * Verify action candidates against article text — reject unsupported actions.
 * @param {object} article
 * @param {object[]} candidates
 */
export function verifyActionCandidates(article, candidates = []) {
  const text = `${article.title} ${article.content} ${article.summary}`.toLowerCase();
  const verified = [];
  const rejected = [];

  for (const candidate of candidates) {
    const reasons = [];
    let score = 50;

    const evidenceWords = candidate.evidence
      ?.toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 8) ?? [];

    const evidenceMatch = evidenceWords.filter((w) => text.includes(w)).length;
    const evidenceRatio = evidenceWords.length ? evidenceMatch / evidenceWords.length : 0;

    if (evidenceRatio >= 0.35) score += 25;
    else if (evidenceRatio >= 0.2) score += 10;
    else reasons.push("weak_evidence_match");

    if (candidate.explicitness === "direct") score += 20;
    else if (candidate.explicitness === "implied") score += 10;
    else score += 0;

    if (candidate.sourceQuote && text.includes(candidate.sourceQuote.toLowerCase().slice(0, 40))) {
      score += 15;
    }

    const genericPatterns = [/stay informed/i, /keep an eye/i, /be aware/i, /consider following/i];
    if (genericPatterns.some((p) => p.test(candidate.description))) {
      score -= 25;
      reasons.push("generic_advice");
    }

    if (candidate.explicitness === "consideration" && evidenceRatio < 0.25) {
      score -= 15;
      reasons.push("weak_consideration");
    }

    score = clamp(score);

    if (score >= 40 && !reasons.includes("generic_advice")) {
      verified.push({ ...candidate, verificationScore: score });
    } else {
      rejected.push({ ...candidate, rejectionReasons: reasons, verificationScore: score });
    }
  }

  return { verified, rejected };
}

export default verifyActionCandidates;
