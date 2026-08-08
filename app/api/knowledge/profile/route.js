import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";
import { DEFAULT_RELATIONSHIPS, getCategoryFamiliarity } from "@/lib/intelligence/learnPath/knowledgeGap.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const concepts = body.knowledgeProfile?.concepts ?? body.concepts ?? {};
    const categoryScores = getCategoryFamiliarity(concepts);

    const conceptList = Object.values(concepts).sort(
      (a, b) => (b.familiarityScore ?? 0) - (a.familiarityScore ?? 0),
    );

    return jsonSuccess({
      profileId: body.profileId ?? null,
      categoryScores,
      concepts: conceptList,
      relationships: DEFAULT_RELATIONSHIPS,
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

export async function GET() {
  return jsonSuccess({
    message: "POST your knowledge profile to retrieve computed scores.",
    relationships: DEFAULT_RELATIONSHIPS,
  });
}
