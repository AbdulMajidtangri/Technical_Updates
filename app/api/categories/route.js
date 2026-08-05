import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from "@/lib/config/categories.js";
import { jsonSuccess, jsonFromError } from "@/lib/api/response.js";

export async function GET() {
  try {
    await connectDB();
    const rows = await Article.aggregate([
      { $match: { isDuplicate: { $ne: true } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const countMap = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    const categories = CATEGORIES.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: CATEGORY_DESCRIPTIONS[name] ?? "",
      count: countMap[name] ?? 0,
    }));
    return jsonSuccess({ categories });
  } catch (error) {
    return jsonFromError(error);
  }
}