import { getFeedStats, getEnabledFeeds } from "@/lib/config/rssFeeds.js";
import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";
import { unauthorizedPrivilegedResponse } from "@/lib/auth.js";

export async function GET(request) {
  const denied = unauthorizedPrivilegedResponse(request);
  if (denied) return denied;

  try {
    const stats = getFeedStats();
    const feeds = getEnabledFeeds().map(({ id, name, category, url }) => ({
      id,
      name,
      category,
      url,
    }));
    return jsonSuccess({ stats, feeds });
  } catch (error) {
    return jsonFromError(error, { fallbackMessage: "Feed catalog unavailable" });
  }
}
