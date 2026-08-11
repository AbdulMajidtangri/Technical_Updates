import mongoose from "mongoose";
import { randomBytes } from "crypto";

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
      index: true,
    },
    active: { type: Boolean, default: true, index: true },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      default: () => randomBytes(24).toString("hex"),
    },
    subscribedAt: { type: Date, default: Date.now },
    lastEmailedAt: { type: Date },
    welcomeSentAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.NewsletterSubscriber ??
  mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
