import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit.js";
import { generateMissedNews } from "@/lib/ai/generateMissedNews.js";

export async function POST(request) {
  try {
    const rate = checkRateLimit(getClientKey(request, "discover"));
    if (!rate.allowed) {
      return jsonError("Too many requests", { status: 429 });
    }

    const body = await request.json();
    const result = await generateMissedNews({
      readIds: body.readIds ?? [],
      savedIds: body.savedIds ?? [],
      interestProfile: body.interestProfile ?? { categories: {}, topics: {} },
      limit: body.limit ?? 5,
      useAi: Boolean(body.useAi) && (body.readIds?.length ?? 0) > 0,
    });

    if (!result.success) {
      return jsonError(result.error ?? "Discovery failed", { status: 422 });
    }

    return jsonSuccess(result.data);
  } catch (err) {
    return jsonFromError(err);
  }
}
