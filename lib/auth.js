import { timingSafeEqual } from "crypto";
import { hasValidAdminSession } from "@/lib/security/session.js";

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
 * Extract cron secret from Authorization header or x-cron-secret only.
 * Query-string secrets are intentionally not accepted (log/referrer leak risk).
 * @param {Request} request
 */
export function extractCronSecret(request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret) return headerSecret.trim();

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
 * Owner access via signed admin session cookie OR cron secret header.
 * @param {Request} request
 */
export function verifyPrivilegedAccess(request) {
  if (hasValidAdminSession(request)) {
    return { authorized: true, method: "session" };
  }

  const cron = verifyCronSecret(request);
  if (cron.authorized) {
    return { authorized: true, method: "cron" };
  }

  return cron;
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

/**
 * Helper for owner-only routes (stats, feeds, force AI, etc.).
 * @param {Request} request
 */
export function unauthorizedPrivilegedResponse(request) {
  const result = verifyPrivilegedAccess(request);
  if (result.authorized) return null;

  return Response.json(
    {
      success: false,
      error: {
        message: result.message ?? "Unauthorized",
        code: "UNAUTHORIZED",
      },
    },
    { status: result.status ?? 401 },
  );
}

export default verifyCronSecret;
