import { headers } from "next/headers";

export async function getServerBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function fetchAPI(path, options = {}) {
  const base = await getServerBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers ?? {}) },
    next: options.next ?? { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.success) return null;
  return json.data;
}