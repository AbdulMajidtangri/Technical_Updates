import { rankArticles, scoreArticle } from "../ranking/rankArticles.js";

export const BRIEFING_MINUTES_OPTIONS = [5, 10, 15];

/** Estimated minutes to read summary + skim article */
export function estimateArticleMinutes(article) {
  if (article.simpleExplanation) return 2;
  if (article.summary) return 2.5;
  return 3;
}

/**
 * Personalize ranking score with interest profile.
 */
export function scoreForBriefing(article, interestProfile = {}, baseScore) {
  const rank = baseScore ?? scoreArticle(article).score;
  let score = rank;

  const catWeight = interestProfile.categories?.[article.category] ?? 0;
  score += catWeight * 30;

  for (const tag of article.tags ?? []) {
    score += (interestProfile.topics?.[tag] ?? 0) * 12;
  }

  if (article.aiProcessed) score += 4;
  if (article.simpleExplanation) score += 3;

  return score;
}

/**
 * Build a time-budgeted briefing from candidate articles.
 * @param {object[]} articles
 * @param {{ minutes?: number, readIds?: string[], interestProfile?: object, maxPerCategory?: number }} options
 */
export function buildBriefing(articles = [], options = {}) {
  const minutes = BRIEFING_MINUTES_OPTIONS.includes(options.minutes) ? options.minutes : 15;
  const readSet = new Set((options.readIds ?? []).map(String));
  const interestProfile = options.interestProfile ?? {};
  const maxPerCategory = options.maxPerCategory ?? 2;

  const ranked = rankArticles(articles.filter((a) => a?.id && !readSet.has(String(a.id))));

  const candidates = ranked
    .map((article) => ({
      ...article,
      briefingScore: scoreForBriefing(article, interestProfile, article.score),
      readMinutes: estimateArticleMinutes(article),
    }))
    .sort((a, b) => b.briefingScore - a.briefingScore);

  const selected = [];
  const categoryCounts = new Map();
  let timeUsed = 0;

  function tryAdd(article, ignoreCategoryLimit = false) {
    if (selected.some((s) => s.id === article.id)) return false;
    if (timeUsed + article.readMinutes > minutes + 0.25) return false;

    const cat = article.category ?? "Other";
    const count = categoryCounts.get(cat) ?? 0;
    if (!ignoreCategoryLimit && count >= maxPerCategory && selected.length >= 2) return false;

    selected.push(article);
    categoryCounts.set(cat, count + 1);
    timeUsed += article.readMinutes;
    return true;
  }

  for (const article of candidates) {
    tryAdd(article);
    if (timeUsed >= minutes - 0.25) break;
  }

  if (selected.length < Math.max(2, Math.floor(minutes / 5))) {
    for (const article of candidates) {
      tryAdd(article, true);
      if (timeUsed >= minutes - 0.25) break;
    }
  }

  return {
    minutes,
    estimatedMinutes: Math.round(timeUsed * 10) / 10,
    articleCount: selected.length,
    articles: selected.map((a, index) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.category,
      sourceName: a.sourceName,
      importanceScore: a.importanceScore,
      simpleExplanation: a.simpleExplanation ?? a.summary ?? "",
      readMinutes: a.readMinutes,
      rank: index + 1,
      briefingScore: Math.round(a.briefingScore),
    })),
  };
}

export default buildBriefing;
