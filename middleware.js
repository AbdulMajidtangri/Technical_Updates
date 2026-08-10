import { NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers.js";
import { verifyPrivilegedAccess } from "@/lib/auth.js";
import { checkApiRateLimit, getApiClientKey } from "@/lib/security/apiRateLimit.js";
import { hasValidAdminSession } from "@/lib/security/session.js";

const PRIVILEGED_API_PREFIXES = [
  "/api/stats",
  "/api/feeds",
  "/api/news/collect",
  "/api/news/process",
  "/api/news/sync",
  "/api/cron/",
];

function isPrivilegedApi(pathname) {
  return PRIVILEGED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

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

  if (isPrivilegedApi(pathname)) {
    const auth = verifyPrivilegedAccess(request);
    if (!auth.authorized) {
      const denied = NextResponse.json(
        {
          success: false,
          error: {
            message: auth.message ?? "Unauthorized",
            code: "UNAUTHORIZED",
          },
        },
        { status: auth.status ?? 401 },
      );
      applySecurityHeaders(denied, { isDev: process.env.NODE_ENV !== "production" });
      return denied;
    }
  }

  if (pathname.startsWith("/admin") && !hasValidAdminSession(request)) {
    const isAdminApi = pathname.startsWith("/api/admin/");
    if (!isAdminApi) {
      const response = NextResponse.next();
      response.headers.set("X-Admin-Auth", "required");
      applySecurityHeaders(response, { isDev: process.env.NODE_ENV !== "production" });
      return response;
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, { isDev: process.env.NODE_ENV !== "production" });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
