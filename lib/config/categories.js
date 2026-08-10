/**
 * Content categories. Used for AI classification, filters, RSS mapping, and storage.
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
  "World News",
  "Politics",
  "Sports",
  "Entertainment",
  "Education",
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
    "General technology industry news, platforms, and digital products.",
  Business:
    "Markets, strategy, earnings, labor, enterprise, and macro trends.",
  Cybersecurity:
    "Security vulnerabilities, breaches, privacy, threat intelligence, and defensive security.",
  Space:
    "Space exploration, launch providers, satellites, and aerospace technology.",
  Science:
    "Scientific research and discoveries with technology or societal relevance.",
  Gaming:
    "Video games, studios, engines, esports, and interactive entertainment.",
  Finance:
    "Personal finance, markets, fintech, banking, and economic news.",
  Travel:
    "Travel industry, destinations, transportation, and hospitality.",
  Environment:
    "Climate, sustainability, energy transition, and environmental policy.",
  Health:
    "Health, medicine, mental health, and wellness news.",
  "World News":
    "International headlines and major global developments.",
  Politics:
    "Government, elections, policy, and political news.",
  Sports:
    "Sports news, leagues, athletes, and major events.",
  Entertainment:
    "Film, TV, music, celebrities, and arts industry news.",
  Education:
    "Schools, universities, ed-tech, and learning industry news.",
  Religion:
    "Faith communities, religious events, and related cultural news.",
  Mobile:
    "Smartphones, mobile OS ecosystems, apps, and handset industry.",
  "Cloud & DevOps":
    "Cloud platforms, infrastructure, DevOps, SRE, and operational tooling.",
  Hardware:
    "Chips, devices, PCs, peripherals, and physical computing hardware.",
  Other:
    "Stories that do not fit other categories.",
};

export function getCategorySlug(name) {
  if (!name) return "";
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategoryBySlug(slug) {
  if (!slug) return undefined;
  const normalized = String(slug).trim().toLowerCase();
  return CATEGORIES.find((category) => getCategorySlug(category) === normalized);
}

export function isValidCategory(category) {
  if (!category) return false;
  const value = String(category).trim();
  if (CATEGORIES.includes(value)) return true;
  return Boolean(getCategoryBySlug(value));
}

export default CATEGORIES;
