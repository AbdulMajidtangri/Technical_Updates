import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";
import { readJsonBody } from "@/lib/security/validation.js";
import { subscribeToNewsletter } from "@/lib/newsletter/service.js";
import { FEATURES } from "@/lib/config/features.js";

export async function POST(request) {
  if (!FEATURES.newsletter) {
    return jsonError("Newsletter is not available yet.", { status: 503, code: "NEWSLETTER_DISABLED" });
  }

  try {
    const rate = checkApiRateLimit(getApiClientKey(request, "newsletter-subscribe"));
    if (!rate.allowed) {
      return jsonError("Too many requests. Please wait a moment.", { status: 429, code: "RATE_LIMITED" });
    }

    const parsed = await readJsonBody(request, 4096);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const email = parsed.data?.email;
    if (!email) {
      return jsonError("Email is required", { status: 400, code: "MISSING_EMAIL" });
    }

    const result = await subscribeToNewsletter(email);
    if (!result.success) {
      return jsonError(result.error ?? "Could not subscribe", { status: 400, code: "INVALID_EMAIL" });
    }

    return jsonSuccess({
      message: result.message,
      alreadySubscribed: result.alreadySubscribed ?? false,
      welcomeSent: result.welcomeSent ?? false,
    });
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Newsletter subscription failed" });
  }
}

export async function GET() {
  return jsonError("Method not allowed", { status: 405, code: "METHOD_NOT_ALLOWED" });
}
