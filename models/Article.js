import mongoose from "mongoose";
import { CATEGORIES } from "@/lib/config/categories.js";

export const DEVELOPER_IMPACT_LEVELS = ["High", "Medium", "Low"];

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", maxlength: 2000 },
    summary: { type: String, default: "", maxlength: 2000 },
    simpleExplanation: { type: String, default: "", maxlength: 1000 },
    whyItMatters: { type: String, default: "", maxlength: 1500 },
    whatHappened: { type: String, default: "", maxlength: 1500 },
    keyFacts: { type: [String], default: [] },
    unknowns: { type: [String], default: [] },
    affectedGroups: {
      type: [
        {
          group: { type: String, trim: true },
          explanation: { type: String, maxlength: 500 },
        },
      ],
      default: [],
    },
    entities: { type: [String], default: [], index: true },
    topics: { type: [String], default: [] },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", index: true },
    intelligenceCache: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    learningData: { type: mongoose.Schema.Types.Mixed },
    aiProcessedAt: { type: Date },
    sourceName: { type: String, default: "", trim: true, index: true },
    sourceUrl: { type: String, default: "", trim: true },
    articleUrl: { type: String, required: true, trim: true, unique: true, index: true },
    imageUrl: { type: String, default: "", trim: true },
    author: { type: String, default: "", trim: true },
    publishedAt: { type: Date, index: true },
    collectedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "Other",
      index: true,
    },
    tags: { type: [String], default: [] },
    importanceScore: { type: Number, min: 1, max: 100, default: 1, index: true },
    relevanceScore: { type: Number, min: 1, max: 100, default: 1 },
    developerImpact: {
      type: String,
      enum: DEVELOPER_IMPACT_LEVELS,
      default: "Low",
    },
    aiProcessed: { type: Boolean, default: false },
    aiModel: { type: String, default: "", trim: true },
    contentHash: { type: String, required: true, trim: true, unique: true, index: true },
    guid: { type: String, default: "", trim: true },
    normalizedTitle: { type: String, default: "", trim: true, index: true },
    isDuplicate: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isSaved: { type: Boolean, default: false },
    readCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    collection: "articles",
  },
);

ArticleSchema.index({ normalizedTitle: 1, sourceName: 1 });

ArticleSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret.__v;
    return ret;
  },
});

/** @type {import("mongoose").Model<any>} */
const Article =
  mongoose.models.Article ?? mongoose.model("Article", ArticleSchema);

export default Article;