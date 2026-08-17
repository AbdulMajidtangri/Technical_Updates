import { NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";

function applyRateLimit(request, pathname) {
  if (!pathname.startsWith("/api/")) return null;

  const rate = checkApiRateLimit(getApiClientKey(request, pathname));
  if (rate.allowed) return null;

  const retryAfterSec = Math.max(1, Math.ceil((rate.retryAfterMs ?? 60_000) / 1000));
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Too many requests. Please slow down.",
        code: "RATE_LIMITED",
      },
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const rateLimited = applyRateLimit(request, pathname);
  if (rateLimited) {
    applySecurityHeaders(rateLimited, { isDev: process.env.NODE_ENV !== "production" });
    return rateLimited;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, { isDev: process.env.NODE_ENV !== "production" });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|offline.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
