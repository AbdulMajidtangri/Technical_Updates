import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";
import { getStories } from "@/lib/data/stories.js";
import { clampNumber, sanitizeString } from "@/lib/security/validation.js";
import { LIMITS } from "@/lib/security/constants.js";

const ALLOWED_STATUS = new Set(["draft", "published", "archived"]);

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = clampNumber(url.searchParams.get("limit"), 1, LIMITS.STORIES_LIMIT_MAX, 20);
    const rawStatus = url.searchParams.get("status");
    const status =
      rawStatus && ALLOWED_STATUS.has(sanitizeString(rawStatus, 32))
        ? sanitizeString(rawStatus, 32)
        : undefined;
    const data = await getStories({ limit, status });
    return jsonSuccess(data);
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Stories unavailable" });
  }
}
