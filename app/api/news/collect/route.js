import { verifyCronSecret } from "@/lib/auth.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { collectNews } from "@/lib/services/collectNews.js";

export async function POST(request) {
  const auth = verifyCronSecret(request);
  if (!auth.authorized) {
    return jsonError(auth.message, { status: auth.status, code: "UNAUTHORIZED" });
  }
  try {
    const result = await collectNews();
    return jsonSuccess({
      feedsProcessed: result.feedsProcessed,
      articlesFetched: result.articlesFetched,
      newArticles: result.newArticles,
      duplicates: result.duplicates,
      failedFeeds: result.failedFeeds,
      feedErrors: result.feedErrors,
    });
  } catch (error) {
    return jsonFromError(error);
  }
}