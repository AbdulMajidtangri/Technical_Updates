const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

const UNITS = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
  { unit: "second", ms: 1000 },
];

/**
 * @param {string | Date | null | undefined} value
 * @returns {Date | null}
 */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Human-readable relative time (e.g. "3 hours ago").
 * @param {string | Date | null | undefined} value
 * @param {{ now?: Date, fallback?: string }} [options]
 * @returns {string}
 */
export function formatRelativeTime(value, options = {}) {
  const date = toDate(value);
  if (!date) return options.fallback ?? "Unknown date";

  const now = options.now ?? new Date();
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  for (const { unit, ms } of UNITS) {
    if (absMs >= ms || unit === "second") {
      const amount = Math.round(diffMs / ms);
      return rtf.format(amount, /** @type {Intl.RelativeTimeFormatUnit} */ (unit));
    }
  }

  return options.fallback ?? "Unknown date";
}

/**
 * Locale date/time for article detail views.
 * @param {string | Date | null | undefined} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDateTime(value, options = {}) {
  const date = toDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}

export default formatRelativeTime;