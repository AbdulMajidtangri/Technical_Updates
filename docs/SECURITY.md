# TechPulse AI — Security

This document lists security requirements and how they are implemented. No system can be guaranteed unhackable, but these layers reduce common attack surfaces (OWASP-aligned).

## Requirements checklist

| # | Requirement | Status | Implementation |
|---|-------------|--------|----------------|
| 1 | Secrets never in client bundle | Done | Only `NEXT_PUBLIC_APP_URL` is public; API keys stay server-side |
| 2 | Owner-only admin area | Done | Server verifies `CRON_SECRET`, sets HttpOnly session cookie |
| 3 | Protected operational APIs | Done | Cron/sync/stats/feeds require secret or admin session |
| 4 | No secret in URL query strings | Done | `lib/auth.js` accepts header/Bearer only |
| 5 | Timing-safe secret comparison | Done | `crypto.timingSafeEqual` in `lib/auth.js` |
| 6 | Security response headers | Done | `middleware.js` + `next.config.js` |
| 7 | Content Security Policy | Done | CSP on all responses |
| 8 | Rate limiting | Done | AI routes (20/min/IP), general API (120/min/IP) |
| 9 | Input validation & size limits | Done | `lib/security/validation.js` |
| 10 | MongoDB injection prevention | Done | Mongoose structured queries; regex escaped |
| 11 | OpenAI cost abuse mitigation | Done | Rate limits + cache; `force` requires owner auth |
| 12 | Production error sanitization | Done | `jsonFromError` hides 500 details in production |
| 13 | DoS mitigation on list endpoints | Done | Fetch caps on `/api/news` and `/api/search` |
| 14 | Admin session expiry | Done | 8-hour signed cookie |

## Environment variables

Copy `.env.example` to `.env.local`:

```env
MONGODB_URI=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
CRON_SECRET=<32+ random bytes>
ADMIN_SESSION_SECRET=<optional separate signing secret>
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Generate strong secrets (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Use different values for `CRON_SECRET` and `ADMIN_SESSION_SECRET` in production.

## Authentication model

### Public readers

- Can read news, search, categories, stories, briefing.
- Can use AI features with rate limits (cached responses preferred).
- Cannot call `force: true` (bypass cache / re-run OpenAI).
- Cannot access `/api/stats`, `/api/feeds`, or cron/sync routes.

### Owner (you)

1. Open `/admin` and enter your operations key (`CRON_SECRET`).
2. Server validates via `POST /api/admin/verify` and sets HttpOnly cookie `tp-admin-session`.
3. Admin UI and privileged APIs work with cookie (and optionally `x-cron-secret` for sync buttons).

### Vercel cron

Configure cron jobs with header:

```
Authorization: Bearer <CRON_SECRET>
```

Do **not** put the secret in the URL.

## Security headers

Applied on every response:

- `Content-Security-Policy`
- `Strict-Transport-Security` (production)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

## Rate limits

| Scope | Limit |
|-------|-------|
| AI endpoints | 20 requests / minute / IP |
| General API | 120 requests / minute / IP |

On serverless, limits are per instance. For strict global limits, add Redis/Upstash later.

## Input limits

See `lib/security/constants.js` — examples:

- JSON body max 64 KB
- Scenario question max 500 chars
- Search query max 200 chars
- News fetch cap 500 documents per request

## Reporting issues

If you find a vulnerability, rotate `CRON_SECRET` and `OPENAI_API_KEY` immediately, then fix and redeploy.

## Future hardening (optional)

- Redis-backed rate limiting
- WAF (Cloudflare / Vercel Firewall)
- Dependency scanning in CI (`npm audit`)
- Full user accounts with OAuth (when multi-user is needed)
