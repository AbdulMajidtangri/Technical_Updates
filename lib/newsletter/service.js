import { connectDB } from "@/lib/db.js";
import NewsletterSubscriber from "@/models/NewsletterSubscriber.js";
import Article from "@/models/Article.js";
import { isEmailConfigured, sendMailMessage, getAppBaseUrl } from "@/lib/email/mailer.js";
import { buildWelcomeEmail, buildUpdateDigestEmail } from "@/lib/email/templates.js";

import { isValidEmail, normalizeEmail } from "@/lib/newsletter/validation.js";

function unsubscribeUrl(token) {
  return `${getAppBaseUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function subscribeToNewsletter(emailInput) {
  const email = normalizeEmail(emailInput);
  if (!isValidEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  await connectDB();

  let subscriber = await NewsletterSubscriber.findOne({ email });
  if (subscriber) {
    if (subscriber.active) {
      return {
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed. We'll email you when new updates are published.",
      };
    }
    subscriber.active = true;
    subscriber.subscribedAt = new Date();
    await subscriber.save();
  } else {
    subscriber = await NewsletterSubscriber.create({ email });
  }

  let welcomeSent = false;
  if (isEmailConfigured()) {
    try {
      const { subject, html, text } = buildWelcomeEmail({
        email,
        unsubscribeUrl: unsubscribeUrl(subscriber.unsubscribeToken),
      });
      await sendMailMessage({ to: email, subject, html, text });
      subscriber.welcomeSentAt = new Date();
      await subscriber.save();
      welcomeSent = true;
    } catch (err) {
      console.error("[newsletter] welcome email failed:", err);
    }
  }

  return {
    success: true,
    alreadySubscribed: false,
    welcomeSent,
    message: welcomeSent
      ? "You're subscribed! Check your inbox — we sent a confirmation email."
      : "You're subscribed! We'll notify you when new tech updates are published.",
  };
}

export async function unsubscribeNewsletter(token) {
  if (!token || typeof token !== "string") {
    return { success: false, error: "Invalid unsubscribe link." };
  }

  await connectDB();
  const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token.trim() });
  if (!subscriber) {
    return { success: false, error: "This unsubscribe link is invalid or expired." };
  }

  subscriber.active = false;
  await subscriber.save();
  return { success: true, email: subscriber.email };
}

export async function notifySubscribersOfNewUpdates(newArticlesCount = 0) {
  if (!isEmailConfigured()) {
    return { sent: 0, skipped: "smtp-not-configured" };
  }

  if (Number(newArticlesCount) < 1) {
    return { sent: 0, skipped: "no-new-articles" };
  }

  await connectDB();

  const subscribers = await NewsletterSubscriber.find({ active: true }).lean();
  if (!subscribers.length) {
    return { sent: 0, skipped: "no-subscribers" };
  }

  const articles = await Article.find({ isDuplicate: { $ne: true } })
    .sort({ collectedAt: -1, importanceScore: -1 })
    .limit(6)
    .select("title slug summary category")
    .lean();

  if (!articles.length) {
    return { sent: 0, skipped: "no-articles-to-show" };
  }

  let sent = 0;
  for (const subscriber of subscribers) {
    try {
      const { subject, html, text } = buildUpdateDigestEmail({
        articles,
        unsubscribeUrl: unsubscribeUrl(subscriber.unsubscribeToken),
      });
      await sendMailMessage({ to: subscriber.email, subject, html, text });
      await NewsletterSubscriber.updateOne({ _id: subscriber._id }, { lastEmailedAt: new Date() });
      sent += 1;
    } catch (err) {
      console.error(`[newsletter] digest failed for ${subscriber.email}:`, err);
    }
  }

  return { sent, total: subscribers.length };
}

export default subscribeToNewsletter;
