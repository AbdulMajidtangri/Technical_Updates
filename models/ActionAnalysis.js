import mongoose from "mongoose";

const ActionItemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    targetAudience: String,
    urgency: String,
    urgencyScore: Number,
    confidence: String,
    confidenceScore: Number,
    deadline: String,
    evidence: String,
    sourceQuote: String,
    reason: String,
    relevanceScore: Number,
    explicitness: String,
  },
  { _id: false },
);

const ActionAnalysisSchema = new mongoose.Schema(
  {
    articleId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["ACTION_REQUIRED", "ACTION_RECOMMENDED", "MONITOR", "NO_ACTION_REQUIRED"],
      default: "NO_ACTION_REQUIRED",
    },
    headline: { type: String, default: "" },
    actionRequired: { type: Boolean, default: false },
    actions: { type: [ActionItemSchema], default: [] },
    events: { type: [mongoose.Schema.Types.Mixed], default: [] },
    rejectedActions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    signals: { type: [mongoose.Schema.Types.Mixed], default: [] },
    relevanceScore: { type: Number, default: 0 },
    urgencyScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    model: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "action_analyses" },
);

/** @type {import("mongoose").Model<any>} */
const ActionAnalysis =
  mongoose.models.ActionAnalysis ?? mongoose.model("ActionAnalysis", ActionAnalysisSchema);

export default ActionAnalysis;
