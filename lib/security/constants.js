/** Shared security limits and cookie names. */

export const ADMIN_SESSION_COOKIE = "tp-admin-session";
export const ADMIN_SESSION_MAX_AGE_SEC = 8 * 60 * 60; // 8 hours

export const LIMITS = {
  /** Max JSON body size hint for route handlers (bytes). */
  JSON_BODY_MAX_BYTES: 64 * 1024,
  QUESTION_MAX_CHARS: 500,
  SEARCH_QUERY_MAX_CHARS: 200,
  ARTICLE_ID_MAX_CHARS: 64,
  READ_IDS_MAX: 200,
  CONCEPTS_MAX: 500,
  INTEREST_PROFILE_MAX_KEYS: 50,
  BRIEFING_ARTICLES_MAX: 80,
  STORIES_LIMIT_MAX: 50,
  NEWS_PAGE_LIMIT_MAX: 100,
  NEWS_FETCH_MAX: 500,
};

export const RATE_LIMITS = {
  AI_WINDOW_MS: 60_000,
  AI_MAX_REQUESTS: 20,
  API_WINDOW_MS: 60_000,
  API_MAX_REQUESTS: 120,
};

export const ALLOWED_INTERACTION_TYPES = new Set([
  "exposure",
  "understood",
  "already_know",
  "quiz_correct",
  "quiz_wrong",
]);

export default LIMITS;
