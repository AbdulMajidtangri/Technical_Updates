import nodemailer from "nodemailer";

let transport = null;

export function isEmailConfigured() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass);
}

export function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function getFromAddress() {
  const from = process.env.SMTP_FROM?.trim();
  if (from) return from;
  const user = process.env.SMTP_USER?.trim();
  return user ? `Inkwell Atlas <${user}>` : "Inkwell Atlas <noreply@localhost>";
}

export function getMailTransport() {
  if (!isEmailConfigured()) {
    throw new Error("SMTP is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to .env.local");
  }

  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transport;
}

export async function sendMailMessage({ to, subject, html, text }) {
  const transporter = getMailTransport();
  return transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
  });
}

export default getMailTransport;
