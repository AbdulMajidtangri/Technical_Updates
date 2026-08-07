import { handleAiRoute } from "@/lib/api/handleAiRoute.js";
import { generateImpact } from "@/lib/ai/generateImpact.js";

export async function POST(request) {
  return handleAiRoute(request, {
    feature: "impact",
    handler: (body) => generateImpact(body.articleId, { force: Boolean(body.force) }),
  });
}
