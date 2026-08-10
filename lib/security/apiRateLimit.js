import { RATE_LIMITS } from "./constants.js";

const buckets = new Map();

/**
 * Lightweight in-memory rate limiter for general API routes.
 * Note: resets per serverless instance — use Redis/Upstash for strict global limits.
 * @param {string} key
 * @param {{ windowMs?: number, maxRequests?: number }} options
 */
export function checkApiRateLimit(key, options = {}) {
  const windowMs = options.windowMs ?? RATE_LIMITS.API_WINDOW_MS;
  const maxRequests = options.maxRequests ?? RATE_LIMITS.API_MAX_REQUESTS;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: windowMs - (now - entry.start),
    };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * @param {Request} request
 * @param {string} suffix
 */
export function getApiClientKey(request, suffix = "") {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${ip}${suffix ? `:${suffix}` : ""}`;
}

export default checkApiRateLimit;
