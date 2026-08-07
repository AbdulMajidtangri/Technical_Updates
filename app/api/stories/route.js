import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";
import { getStories } from "@/lib/data/stories.js";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const status = url.searchParams.get("status") ?? undefined;
    const data = await getStories({ limit, status });
    return jsonSuccess(data);
  } catch (err) {
    return jsonFromError(err);
  }
}
