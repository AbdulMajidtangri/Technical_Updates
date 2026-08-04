import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison for secrets.
 * @param {string} a
 * @param {string} b
 */
function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Extract cron secret from common request locations.
 * @param {Request} request
 */
export function extractCronSecret(request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret) return headerSecret.trim();

  try {
    const url = new URL(request.url);
    const querySecret = url.searchParams.get("secret");
    if (querySecret) return querySecret.trim();
  } catch {
    // ignore invalid URL
  }

  return "";
}

/**
 * Verify CRON_SECRET for protected cron/admin routes.
 * @param {Request} request
 * @returns {{ authorized: true } | { authorized: false, status: number, message: string }}
 */
export function verifyCronSecret(request) {
  const expected = process.env.CRON_SECRET?.trim();

  if (!expected) {
    return {
      authorized: false,
      status: 500,
      message: "CRON_SECRET is not configured",
    };
  }

  const provided = extractCronSecret(request);
  if (!provided) {
    return {
      authorized: false,
      status: 401,
      message: "Missing cron secret",
    };
  }

  if (!safeEqual(provided, expected)) {
    return {
      authorized: false,
      status: 403,
      message: "Invalid cron secret",
    };
  }

  return { authorized: true };
}

/**
 * Helper for route handlers.
 * @param {Request} request
 * @returns {Response | null} Response when unauthorized; null when authorized
 */
export function unauthorizedCronResponse(request) {
  const result = verifyCronSecret(request);
  if (result.authorized) return null;

  return Response.json({ error: result.message }, { status: result.status });
}

export default verifyCronSecret;