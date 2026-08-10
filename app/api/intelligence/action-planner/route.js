import { handleAiRoute } from "@/lib/api/handleAiRoute.js";
import { runActionPlanner } from "@/lib/intelligence/actionPlanner/runActionPlanner.js";

export async function POST(request) {
  return handleAiRoute(request, {
    feature: "action-planner",
    handler: (body) =>
      runActionPlanner(body.articleId, {
        force: Boolean(body.force),
        userInterest: body.interestProfile ?? body.userInterest ?? {},
      }),
  });
}
