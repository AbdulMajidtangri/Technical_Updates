import { connectDB } from "@/lib/db.js";
import Article from "@/models/Article.js";
import { analyzeArticle } from "@/lib/ai/analyzeArticle.js";
import { extractEntitiesFromArticle } from "@/lib/intelligence/findConnectionCandidates.js";

export async function processNews(options = {}) {
  await connectDB();

  const batchSize = options.batchSize ?? Number(process.env.AI_BATCH_SIZE ?? 5);
  const limit = Number.isFinite(batchSize) && batchSize > 0 ? Math.floor(batchSize) : 5;

  const pending = await Article.find({
    aiProcessed: false,
    isDuplicate: { $ne: true },
  })
    .sort({ publishedAt: -1, collectedAt: -1 })
    .limit(limit);

  const results = {
    requested: limit,
    processed: 0,
    succeeded: 0,
    failed: 0,
    items: [],
  };

  for (const doc of pending) {
    results.processed += 1;

    const outcome = await analyzeArticle(
      {
        title: doc.title,
        description: doc.description,
        summary: doc.summary,
        sourceName: doc.sourceName,
        publishedAt: doc.publishedAt,
        category: doc.category,
      },
      { model: options.model },
    );

    if (!outcome.success) {
      results.failed += 1;
      results.items.push({ id: String(doc._id), ok: false, error: outcome.error });
      continue;
    }

    const analysis = outcome.analysis;
    const entities = extractEntitiesFromArticle({ ...doc.toObject(), tags: analysis.tags });

    await Article.updateOne(
      { _id: doc._id },
      {
        $set: {
          category: analysis.category,
          tags: analysis.tags,
          entities,
          topics: analysis.tags,
          importanceScore: analysis.importanceScore,
          relevanceScore: analysis.relevanceScore,
          developerImpact: analysis.developerImpact,
          summary: analysis.summary,
          simpleExplanation: analysis.simpleExplanation,
          whyItMatters: analysis.whyItMatters,
          aiProcessed: true,
          aiProcessedAt: new Date(),
          aiModel: outcome.model,
        },
      },
    );

    results.succeeded += 1;
    results.items.push({ id: String(doc._id), ok: true, importanceScore: analysis.importanceScore });
  }

  results.remaining = await Article.countDocuments({
    aiProcessed: false,
    isDuplicate: { $ne: true },
  });

  return results;
}

export default processNews;