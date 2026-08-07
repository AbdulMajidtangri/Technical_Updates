import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { getStoryBySlug } from "@/lib/data/stories.js";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const story = await getStoryBySlug(slug);
    if (!story) return jsonError("Story not found", { status: 404, code: "NOT_FOUND" });
    return jsonSuccess({ story });
  } catch (err) {
    return jsonFromError(err);
  }
}
