import mongoose from "mongoose";
import { CATEGORIES } from "@/lib/config/categories.js";

export const STORY_STATUSES = ["DEVELOPING", "ACTIVE", "RESOLVED", "CONCLUDED", "UNKNOWN"];

const TimelineEventSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: "", maxlength: 2000 },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
    eventType: {
      type: String,
      enum: ["announcement", "reaction", "detail", "update", "conclusion", "other"],
      default: "update",
    },
  },
  { _id: true },
);

const StorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, default: "Other", index: true },
    status: { type: String, enum: STORY_STATUSES, default: "DEVELOPING", index: true },
    importanceScore: { type: Number, min: 1, max: 100, default: 50, index: true },
    firstPublishedAt: { type: Date, index: true },
    lastUpdatedAt: { type: Date, index: true },
    coverImage: { type: String, default: "" },
    articleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    keyEntities: { type: [String], default: [], index: true },
    timeline: { type: [TimelineEventSchema], default: [] },
  },
  { timestamps: true, collection: "stories" },
);

StorySchema.index({ keyEntities: 1, category: 1 });
StorySchema.index({ lastUpdatedAt: -1 });

StorySchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret.__v;
    return ret;
  },
});

/** @type {import("mongoose").Model<any>} */
const Story = mongoose.models.Story ?? mongoose.model("Story", StorySchema);

export default Story;
