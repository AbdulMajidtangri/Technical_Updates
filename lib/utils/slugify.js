/**
 * Convert a title (or arbitrary string) into a URL-safe slug.
 * @param {string | null | undefined} value
 * @param {{ maxLength?: number }} [options]
 * @returns {string}
 */
export function slugify(value, options = {}) {
  const maxLength = options.maxLength ?? 120;
  if (!value) return "article";

  const slug = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!slug) return "article";
  return slug.length > maxLength ? slug.slice(0, maxLength).replace(/-+$/g, "") : slug;
}

/**
 * Build a unique slug by appending a short suffix when needed.
 * @param {string} baseSlug
 * @param {string | number} suffix
 * @returns {string}
 */
export function withSlugSuffix(baseSlug, suffix) {
  const safeBase = slugify(baseSlug);
  const token = String(suffix).replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase();
  return token ? `${safeBase}-${token}` : safeBase;
}

export default slugify;