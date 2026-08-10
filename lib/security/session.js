import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SEC } from "@/lib/security/constants.js";

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

/**
 * Create a signed admin session token.
 * Format: exp.nonce.signature
 */
export function createAdminSessionToken() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or CRON_SECRET is not configured");
  }

  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${exp}.${nonce}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verify a signed admin session token.
 * @param {string | undefined | null} token
 */
export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expRaw, nonce, signature] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const payload = `${expRaw}.${nonce}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return safeEqual(signature, expected);
}

/**
 * Build Set-Cookie header value for admin session.
 * @param {string} token
 */
export function buildAdminSessionCookie(token) {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${ADMIN_SESSION_MAX_AGE_SEC}`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/**
 * Build Set-Cookie header to clear admin session.
 */
export function buildAdminSessionClearCookie() {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/**
 * Read admin session token from a Request or cookie map.
 * @param {Request | { get: (name: string) => string | undefined }} source
 */
export function readAdminSessionToken(source) {
  if (source && typeof source.get === "function") {
    return source.get(ADMIN_SESSION_COOKIE) ?? "";
  }

  if (source && typeof source.headers?.get === "function") {
    const cookieHeader = source.headers.get("cookie") ?? "";
    for (const part of cookieHeader.split(";")) {
      const [name, ...rest] = part.trim().split("=");
      if (name === ADMIN_SESSION_COOKIE) {
        return decodeURIComponent(rest.join("="));
      }
    }
  }

  return "";
}

/**
 * Check whether the request has a valid admin session cookie.
 * @param {Request} request
 */
export function hasValidAdminSession(request) {
  const token = readAdminSessionToken(request);
  return verifyAdminSessionToken(token);
}

export { ADMIN_SESSION_COOKIE };
