import mongoose from "mongoose";
import { LIMITS, ALLOWED_INTERACTION_TYPES } from "./constants.js";

/**
 * Validate MongoDB ObjectId string.
 * @param {unknown} value
 */
export function isValidObjectId(value) {
  if (typeof value !== "string") return false;
  if (value.length > LIMITS.ARTICLE_ID_MAX_CHARS) return false;
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;
}

/**
 * @param {unknown} value
 * @param {number} maxLen
 */
export function sanitizeString(value, maxLen) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

/**
 * @param {unknown} value
 * @param {number} maxItems
 * @param {number} maxItemLen
 */
export function sanitizeStringArray(value, maxItems, maxItemLen = 64) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxItemLen))
    .filter(Boolean);
}

/**
 * @param {unknown} value
 * @param {number} maxKeys
 */
export function sanitizeRecord(value, maxKeys = LIMITS.INTEREST_PROFILE_MAX_KEYS) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const out = {};
  let count = 0;
  for (const [key, raw] of Object.entries(value)) {
    if (count >= maxKeys) break;
    if (typeof key !== "string") continue;
    const safeKey = key.trim().slice(0, 64);
    if (!safeKey) continue;

    if (typeof raw === "number" && Number.isFinite(raw)) {
      out[safeKey] = Math.max(0, Math.min(100, raw));
    } else if (typeof raw === "string") {
      out[safeKey] = raw.trim().slice(0, 120);
    } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      out[safeKey] = sanitizeRecord(raw, 20);
    }
    count += 1;
  }
  return out;
}

/**
 * @param {unknown} value
 */
export function sanitizeInterestProfile(value) {
  const profile = value && typeof value === "object" ? value : {};
  return {
    categories: sanitizeRecord(profile.categories),
    topics: sanitizeRecord(profile.topics),
  };
}

/**
 * @param {unknown} type
 */
export function isAllowedInteractionType(type) {
  return typeof type === "string" && ALLOWED_INTERACTION_TYPES.has(type);
}

/**
 * Clamp numeric query param.
 * @param {unknown} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 */
export function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(num)));
}

/**
 * Guard against oversized JSON bodies.
 * @param {Request} request
 * @param {number} maxBytes
 */
export async function readJsonBody(request, maxBytes = LIMITS.JSON_BODY_MAX_BYTES) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) {
    return { ok: false, error: "Request body too large", status: 413 };
  }

  let text;
  try {
    text = await request.text();
  } catch {
    return { ok: false, error: "Invalid request body", status: 400 };
  }

  if (text.length > maxBytes) {
    return { ok: false, error: "Request body too large", status: 413 };
  }

  if (!text.trim()) {
    return { ok: true, data: {} };
  }

  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, error: "Invalid JSON body", status: 400 };
  }
}

export default {
  isValidObjectId,
  sanitizeString,
  sanitizeStringArray,
  sanitizeRecord,
  sanitizeInterestProfile,
  isAllowedInteractionType,
  clampNumber,
  readJsonBody,
};
