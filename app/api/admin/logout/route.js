import { buildAdminSessionClearCookie } from "@/lib/security/session.js";
import { jsonSuccess } from "@/lib/api/response.js";

export async function POST() {
  return jsonSuccess(
    { loggedOut: true },
    {
      headers: {
        "Set-Cookie": buildAdminSessionClearCookie(),
      },
    },
  );
}

export async function GET() {
  return POST();
}
