import mongoose from "mongoose";
import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { toArticleResponse } from "@/lib/api/toArticleResponse.js";

export async function GET(_request, context) {
  try {
    await connectDB();

    const { id } = await context.params;
    const key = decodeURIComponent(id ?? "").trim();
    if (!key) return jsonError("Article id or slug is required", { status: 400 });

    let doc = null;
    if (mongoose.Types.ObjectId.isValid(key)) {
      doc = await Article.findById(key).lean();
    }

    if (!doc) {
      doc = await Article.findOne({ slug: key }).lean();
    }

    if (!doc) {
      return jsonError("Article not found", { status: 404, code: "NOT_FOUND" });
    }

    return jsonSuccess({ article: toArticleResponse(doc) });
  } catch (error) {
    return jsonFromError(error);
  }
}