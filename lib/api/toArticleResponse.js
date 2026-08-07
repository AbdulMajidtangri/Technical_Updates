export function toArticleResponse(doc) {
  if (!doc) return null;

  return {
    id: doc.id ?? (doc._id ? String(doc._id) : undefined),
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? "",
    summary: doc.summary ?? "",
    simpleExplanation: doc.simpleExplanation ?? "",
    whyItMatters: doc.whyItMatters ?? "",
    whatHappened: doc.whatHappened ?? "",
    keyFacts: doc.keyFacts ?? [],
    unknowns: doc.unknowns ?? [],
    affectedGroups: doc.affectedGroups ?? [],
    entities: doc.entities ?? [],
    topics: doc.topics ?? [],
    storyId: doc.storyId ? String(doc.storyId) : null,
    sourceName: doc.sourceName ?? "",
    sourceUrl: doc.sourceUrl ?? "",
    articleUrl: doc.articleUrl ?? "",
    imageUrl: doc.imageUrl ?? "",
    author: doc.author ?? "",
    publishedAt: doc.publishedAt ?? null,
    collectedAt: doc.collectedAt ?? doc.createdAt ?? null,
    category: doc.category ?? "Other",
    tags: doc.tags ?? [],
    importanceScore: doc.importanceScore ?? 0,
    relevanceScore: doc.relevanceScore ?? 0,
    developerImpact: doc.developerImpact ?? "Low",
    aiProcessed: Boolean(doc.aiProcessed),
    aiModel: doc.aiModel ?? "",
    contentHash: doc.contentHash ?? "",
    guid: doc.guid ?? "",
    isDuplicate: Boolean(doc.isDuplicate),
    isFeatured: Boolean(doc.isFeatured),
    readCount: doc.readCount ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export default toArticleResponse;