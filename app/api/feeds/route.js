import { getFeedStats, getEnabledFeeds } from "@/lib/config/rssFeeds.js";
import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";

export async function GET() {
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
    return jsonFromError(error);
  }
}
