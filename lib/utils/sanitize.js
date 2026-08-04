const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_STYLE_RE = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;
const WHITESPACE_RE = /\s+/g;
const ENTITY_MAP = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * Decode a small set of common HTML entities.
 * @param {string} value
 * @returns {string}
 */
function decodeBasicEntities(value) {
  return value.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (match) => ENTITY_MAP[match] ?? match);
}

/**
 * Strip HTML tags and normalize whitespace from RSS/article content.
 * @param {string | null | undefined} html
 * @param {{ preserveLineBreaks?: boolean }} [options]
 * @returns {string}
 */
export function sanitizeHtml(html, options = {}) {
  if (!html) return "";

  let text = String(html)
    .replace(SCRIPT_STYLE_RE, " ")
    .replace(HTML_TAG_RE, options.preserveLineBreaks ? "\n" : " ");

  text = decodeBasicEntities(text);
  text = text.replace(WHITESPACE_RE, options.preserveLineBreaks ? "\n" : " ").trim();

  if (options.preserveLineBreaks) {
    text = text.replace(/\n{3,}/g, "\n\n");
  }

  return text;
}

/** Alias for RSS normalization pipelines. */
export const stripHtml = sanitizeHtml;

export default sanitizeHtml;