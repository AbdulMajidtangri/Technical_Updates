import { handleAiRoute } from "@/lib/api/handleAiRoute.js";
import { generateUnderstand } from "@/lib/ai/generateUnderstand.js";

export async function POST(request) {
  return handleAiRoute(request, {
    feature: "understand",
    handler: (body) => generateUnderstand(body.articleId, { force: Boolean(body.force) }),
  });
}
