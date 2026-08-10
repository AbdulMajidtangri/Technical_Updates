import { verifyCronSecret } from "@/lib/auth.js";
import {
  buildAdminSessionCookie,
  createAdminSessionToken,
} from "@/lib/security/session.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { readJsonBody } from "@/lib/security/validation.js";

export async function POST(request) {
  try {
    const parsed = await readJsonBody(request, 4096);
    if (!parsed.ok) {
      return jsonError(parsed.error, { status: parsed.status, code: "INVALID_BODY" });
    }

    const secret = parsed.data?.secret?.trim?.() ?? extractBodySecretFallback(parsed.data);
    if (!secret) {
      return jsonError("Operations key is required", { status: 400, code: "MISSING_SECRET" });
    }

    const probe = new Request(request.url, {
      headers: {
        "x-cron-secret": secret,
      },
    });
    const auth = verifyCronSecret(probe);
    if (!auth.authorized) {
      return jsonError("Invalid operations key", { status: auth.status ?? 403, code: "INVALID_SECRET" });
    }

    const token = createAdminSessionToken();
    return jsonSuccess(
      { authenticated: true },
      {
        headers: {
          "Set-Cookie": buildAdminSessionCookie(token),
        },
      },
    );
  } catch (err) {
    return jsonFromError(err, { fallbackMessage: "Could not verify operations key" });
  }
}

function extractBodySecretFallback(body) {
  if (typeof body?.secret === "string") return body.secret.trim();
  return "";
}

export async function GET() {
  return jsonError("Method not allowed", { status: 405, code: "METHOD_NOT_ALLOWED" });
}
