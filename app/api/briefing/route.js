import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { getArticles } from "@/lib/data/articles.js";
import { buildBriefing, BRIEFING_MINUTES_OPTIONS } from "@/lib/briefing/buildBriefing.js";

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const minutes = Number(body.minutes ?? 15);
    if (!BRIEFING_MINUTES_OPTIONS.includes(minutes)) {
      return jsonError("minutes must be 5, 10, or 15", { status: 400 });
    }

    const { articles } = await getArticles({
      limit: 80,
      analyzed: true,
      importance: 40,
    });

    const briefing = buildBriefing(articles, {
      minutes,
      readIds: body.readIds ?? [],
      interestProfile: body.interestProfile ?? { categories: {}, topics: {} },
    });

    return jsonSuccess(briefing);
  } catch (err) {
    return jsonFromError(err);
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const minutes = Number(url.searchParams.get("minutes") ?? 15);

    const { articles } = await getArticles({
      limit: 80,
      analyzed: true,
      importance: 40,
    });

    const briefing = buildBriefing(articles, { minutes });
    return jsonSuccess(briefing);
  } catch (err) {
    return jsonFromError(err);
  }
}
