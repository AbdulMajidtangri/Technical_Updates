import { NextResponse } from "next/server";
import { unsubscribeNewsletter } from "@/lib/newsletter/service.js";
import { getAppBaseUrl } from "@/lib/email/mailer.js";
import { BRAND } from "@/lib/config/brand.js";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");

  try {
    const result = await unsubscribeNewsletter(token);
    const home = getAppBaseUrl();

    if (!result.success) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:520px;margin:auto;">
          <h1>Unsubscribe failed</h1><p>${result.error}</p><p><a href="${home}">Back to ${BRAND.name}</a></p>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }

    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:520px;margin:auto;">
        <h1>You've been unsubscribed</h1>
        <p>${result.email} will no longer receive update emails from ${BRAND.name}.</p>
        <p><a href="${home}">Return to ${BRAND.name}</a></p>
      </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch {
    return NextResponse.redirect(getAppBaseUrl(), 302);
  }
}
