import { handleAiRoute } from "@/lib/api/handleAiRoute.js";
import { generateConnections } from "@/lib/ai/generateConnections.js";

export async function POST(request) {
  return handleAiRoute(request, {
    feature: "connect",
    handler: (body) => generateConnections(body.articleId, { force: Boolean(body.force) }),
  });
}
