/**
 * Content categories (exact display names). Used for AI classification, filters, and storage.
 */

export const CATEGORIES = [
  "Artificial Intelligence",
  "Software Development",
  "Technology",
  "Business",
  "Cybersecurity",
  "Space",
  "Science",
  "Gaming",
  "Finance",
  "Travel",
  "Environment",
  "Health",
  "Religion",
  "Mobile",
  "Cloud & DevOps",
  "Hardware",
  "Other",
];

/** @type {Record<string, string>} */
export const CATEGORY_DESCRIPTIONS = {
  "Artificial Intelligence":
    "Machine learning, LLMs, generative AI, AI policy, and research with product or industry impact.",
  "Software Development":
    "Programming languages, frameworks, APIs, engineering practices, and shipping software.",
  Technology:
    "General technology industry news, platforms, and digital products not covered by a narrower category.",
  Business:
    "Markets, strategy, earnings, labor, enterprise, and macro trends affecting technology and business.",
  Cybersecurity:
    "Security vulnerabilities, breaches, privacy, threat intelligence, and defensive security.",
  Space:
    "Space exploration, launch providers, satellites, and aerospace technology.",
  Science:
    "Scientific research and discoveries with technology, engineering, or societal relevance.",
  Gaming:
    "Video games, studios, engines, esports, and interactive entertainment technology.",
  Finance:
    "Personal finance, markets, fintech, banking technology, and economic news.",
  Travel:
    "Travel industry, destinations, transportation, and hospitality technology.",
  Environment:
    "Climate, sustainability, energy transition, and environmental policy and science.",
  Health:
    "Health, medicine, mental health, and wellness with news or tech angles.",
  Religion:
    "Faith, religious communities, and related social or cultural news.",
  Mobile:
    "Smartphones, mobile OS ecosystems, apps, and handset industry news.",
  "Cloud & DevOps":
    "Cloud platforms, infrastructure, DevOps, SRE, CI/CD, and operational tooling.",
  Hardware:
    "Chips, devices, PCs, peripherals, and physical computing hardware.",
  Other:
    "Stories that do not fit other categories or are tangential to the main taxonomy.",
};

/**
 * @param {string} name
 * @returns {string}
 */
export function getCategorySlug(name) {
  if (!name) return "";
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * @param {string | null | undefined} slug
 * @returns {string | undefined}
 */
export function getCategoryBySlug(slug) {
  if (!slug) return undefined;
  const normalized = String(slug).trim().toLowerCase();
  return CATEGORIES.find((category) => getCategorySlug(category) === normalized);
}

/**
 * @param {string | null | undefined} category
 * @returns {boolean}
 */
export function isValidCategory(category) {
  if (!category) return false;
  const value = String(category).trim();
  if (CATEGORIES.includes(value)) return true;
  return Boolean(getCategoryBySlug(value));
}

export default CATEGORIES;