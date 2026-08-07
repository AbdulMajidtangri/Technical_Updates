import { handleAiRoute } from "@/lib/api/handleAiRoute.js";
import { generateLearning } from "@/lib/ai/generateLearning.js";

export async function POST(request) {
  return handleAiRoute(request, {
    feature: "learn",
    handler: (body) => generateLearning(body.articleId, { force: Boolean(body.force) }),
  });
}
