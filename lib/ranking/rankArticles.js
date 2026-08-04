const DEFAULT_WEIGHTS = {
  importance: 0.35,
  relevance: 0.3,
  developerImpact: 0.25,
  recency: 0.1,
};

const DEVELOPER_IMPACT_SCORES = {
  High: 100,
  Medium: 60,
  Low: 30,
};

const RECENCY_HALF_LIFE_HOURS = 36;

/**
 * Map developerImpact label to numeric score for ranking.
 * @param {string | null | undefined} impact
 * @returns {number}
 */
export function developerImpactToScore(impact) {
  if (!impact) return DEVELOPER_IMPACT_SCORES.Low;
  const key = String(impact).trim();
  if (key in DEVELOPER_IMPACT_SCORES) {
    return DEVELOPER_IMPACT_SCORES[/** @type {keyof typeof DEVELOPER_IMPACT_SCORES} */ (key)];
  }
  return DEVELOPER_IMPACT_SCORES.Low;
}

/**
 * Score how recent an article is (0-100).
 * @param {string | Date | null | undefined} publishedAt
 * @param {Date} [now]
 */
export function scoreRecency(publishedAt, now = new Date()) {
  if (!publishedAt) return 40;

  const published = publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return 40;

  const ageHours = Math.max(0, (now.getTime() - published.getTime()) / (1000 * 60 * 60));
  const decay = Math.pow(0.5, ageHours / RECENCY_HALF_LIFE_HOURS);
  return Math.round(decay * 100);
}

/**
 * Transparent composite score for ranking.
 * @param {object} article
 * @param {{ weights?: Partial<typeof DEFAULT_WEIGHTS>, now?: Date }} [options]
 * @returns {{ score: number, breakdown: object }}
 */
export function scoreArticle(article, options = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...options.weights };

  const importance = clampScore(article.importanceScore ?? 0);
  const relevance = clampScore(article.relevanceScore ?? 0);
  const developerImpact = clampScore(developerImpactToScore(article.developerImpact));
  const recency = scoreRecency(article.publishedAt, options.now);

  const weighted =
    importance * weights.importance +
    relevance * weights.relevance +
    developerImpact * weights.developerImpact +
    recency * weights.recency;

  const score = Math.round(clampScore(weighted));

  return {
    score,
    breakdown: {
      importanceScore: importance,
      relevanceScore: relevance,
      developerImpact,
      recency,
      weights,
    },
  };
}

/**
 * Rank articles descending by composite score (stable tie-breaker: newer first, then title).
 * @param {object[]} articles
 * @param {{ weights?: Partial<typeof DEFAULT_WEIGHTS>, now?: Date }} [options]
 * @returns {Array<object & { rank: number, score: number, scoreBreakdown: object }>}
 */
export function rankArticles(articles, options = {}) {
  if (!Array.isArray(articles)) return [];

  const ranked = articles.map((article) => {
    const { score, breakdown } = scoreArticle(article, options);
    return {
      ...article,
      score,
      scoreBreakdown: breakdown,
    };
  });

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    const bTime = Date.parse(b.publishedAt ?? "") || 0;
    const aTime = Date.parse(a.publishedAt ?? "") || 0;
    if (bTime !== aTime) return bTime - aTime;

    return (a.title ?? "").localeCompare(b.title ?? "");
  });

  return ranked.map((article, index) => ({
    ...article,
    rank: index + 1,
  }));
}

/**
 * @param {number} value
 */
function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export default rankArticles;