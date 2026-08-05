const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * @param {string | null | undefined} value
 * @returns {{ valid: true, url: URL } | { valid: false, error: string }}
 */
export function validateUrl(value) {
  if (!value || !String(value).trim()) {
    return { valid: false, error: "URL is required" };
  }

  let parsed;
  try {
    parsed = new URL(String(value).trim());
  } catch {
    return { valid: false, error: "URL is malformed" };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { valid: false, error: "URL must use http or https" };
  }

  if (!parsed.hostname) {
    return { valid: false, error: "URL hostname is missing" };
  }

  return { valid: true, url: parsed };
}

/**
 * @param {string | null | undefined} value
 * @returns {boolean}
 */
export function isValidHttpUrl(value) {
  return validateUrl(value).valid;
}

/**
 * Normalize a URL for storage (strip hash, trim trailing slashes on path).
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeHttpUrl(value) {
  const result = validateUrl(value);
  if (!result.valid) return String(value ?? "").trim();

  const parsed = result.url;
  parsed.hash = "";
  let pathname = parsed.pathname.replace(/\/+$/, "") || "";
  if (pathname && !pathname.startsWith("/")) pathname = `/${pathname}`;
  parsed.pathname = pathname || "/";
  return parsed.toString();
}

export default validateUrl;