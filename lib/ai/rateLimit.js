const buckets = new Map();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

/**
 * Simple in-memory rate limiter for AI endpoints.
 * @param {string} key - e.g. IP or articleId+feature
 */
export function checkRateLimit(key) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.start > WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfterMs: WINDOW_MS - (now - entry.start) };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

export function getClientKey(request, suffix = "") {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${ip}${suffix ? `:${suffix}` : ""}`;
}

export default checkRateLimit;
