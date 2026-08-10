/** Security response headers applied globally via middleware and next.config.js. */

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-DNS-Prefetch-Control": "off",
};

export function buildContentSecurityPolicy(isDev = false) {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/**
 * Apply security headers to a NextResponse or plain headers object.
 * @param {Headers | import('next/server').NextResponse} target
 * @param {{ isDev?: boolean, includeCsp?: boolean }} options
 */
export function applySecurityHeaders(target, options = {}) {
  const isDev = options.isDev ?? process.env.NODE_ENV !== "production";
  const headers = target.headers ?? target;

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  if (options.includeCsp !== false) {
    headers.set("Content-Security-Policy", buildContentSecurityPolicy(isDev));
  }

  if (!isDev) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return target;
}

export default SECURITY_HEADERS;
