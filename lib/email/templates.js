import { BRAND } from "@/lib/config/brand.js";
import { getAppBaseUrl } from "@/lib/email/mailer.js";

function layout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f4ef;font-family:Georgia,'Times New Roman',serif;color:#1a1523;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e8e2d9;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7c3aed;font-weight:700;">${BRAND.name}</p>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;">${content}</td></tr>
        <tr><td style="padding:20px 32px;background:#faf8f5;border-top:1px solid #e8e2d9;font-size:12px;color:#6b6474;line-height:1.6;">
          You subscribed to tech updates from ${BRAND.name}.<br>
          <a href="${getAppBaseUrl()}" style="color:#7c3aed;">Visit the site</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function buildWelcomeEmail({ email, unsubscribeUrl }) {
  const subject = `You're on the list — ${BRAND.name} updates`;
  const text = `Thanks for subscribing to ${BRAND.name}!

We've saved your email (${email}). We'll notify you when important new tech stories and software updates are published.

Open your dashboard: ${getAppBaseUrl()}

Unsubscribe: ${unsubscribeUrl}`;

  const html = layout(`
    <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:600;color:#1a1523;">You're subscribed</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#4a4455;">
      Thanks for joining the <strong>${BRAND.name}</strong> newsletter. We saved <strong>${email}</strong> and will email you when new technical updates and important releases land in the app.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a4455;">
      Expect concise alerts — no spam. Only meaningful tech intelligence worth your time.
    </p>
    <a href="${getAppBaseUrl()}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ea580c);color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:700;">Open ${BRAND.shortName} Atlas</a>
    <p style="margin:24px 0 0;font-size:12px;color:#6b6474;">
      Changed your mind? <a href="${unsubscribeUrl}" style="color:#7c3aed;">Unsubscribe</a>
    </p>
  `);

  return { subject, html, text };
}

export function buildUpdateDigestEmail({ articles, unsubscribeUrl }) {
  const subject = `New tech updates — ${articles.length} fresh ${articles.length === 1 ? "story" : "stories"}`;
  const itemsText = articles.map((a) => `- ${a.title} (${getAppBaseUrl()}/news/${a.slug})`).join("\n");
  const text = `New updates are available on ${BRAND.name}:\n\n${itemsText}\n\nRead more: ${getAppBaseUrl()}\n\nUnsubscribe: ${unsubscribeUrl}`;

  const itemsHtml = articles
    .map(
      (a) => `
      <li style="margin-bottom:16px;list-style:none;padding:0;">
        <a href="${getAppBaseUrl()}/news/${a.slug}" style="color:#1a1523;text-decoration:none;font-size:17px;font-weight:600;line-height:1.35;">${a.title}</a>
        <p style="margin:6px 0 0;font-size:13px;color:#6b6474;">${a.category ?? "Tech"}${a.summary ? ` · ${a.summary.slice(0, 120)}${a.summary.length > 120 ? "…" : ""}` : ""}</p>
      </li>`,
    )
    .join("");

  const html = layout(`
    <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:600;color:#1a1523;">Fresh tech updates</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#4a4455;">
      New stories were just published on ${BRAND.name}. Here are the latest highlights:
    </p>
    <ul style="margin:0;padding:0;">${itemsHtml}</ul>
    <a href="${getAppBaseUrl()}" style="display:inline-block;margin-top:8px;background:linear-gradient(135deg,#7c3aed,#ea580c);color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:700;">Read on ${BRAND.shortName} Atlas</a>
    <p style="margin:24px 0 0;font-size:12px;color:#6b6474;">
      <a href="${unsubscribeUrl}" style="color:#7c3aed;">Unsubscribe from updates</a>
    </p>
  `);

  return { subject, html, text };
}

export default { buildWelcomeEmail, buildUpdateDigestEmail };
