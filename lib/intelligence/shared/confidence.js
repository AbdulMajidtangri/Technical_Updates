export function clamp(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function confidenceLevel(score) {
  const s = clamp(score);
  if (s >= 75) return "HIGH";
  if (s >= 50) return "MEDIUM";
  return "LOW";
}

export function urgencyLabel(score) {
  const s = clamp(score);
  if (s >= 81) return "CRITICAL";
  if (s >= 51) return "HIGH";
  if (s >= 21) return "MEDIUM";
  return "LOW";
}

export function normalizeConceptName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

export function conceptIdFromName(name) {
  const normalized = normalizeConceptName(name);
  return normalized.replace(/\s+/g, "-") || "unknown";
}

export default clamp;
