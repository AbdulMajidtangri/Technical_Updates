"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BRAND } from "@/lib/config/brand.js";
import { useAdminSecret } from "@/hooks/useAdminSecret";
import { Button } from "@/components/ui/Button";

const SECRET_KEY = "techpulse-cron-secret";

export function AdminGate() {
  const { unlock } = useAdminSecret();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SECRET_KEY);
    if (saved) setKey(saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!key.trim()) {
      setError("Enter your operations key to continue.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ secret: key.trim() }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Invalid operations key.");
        return;
      }

      unlock(key);
      window.location.reload();
    } catch {
      setError("Could not verify key. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(260_18%_5%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <BrandLogo size="lg" variant="light" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-white">Control Center</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Owner-only area for news sync, system health, and intelligence checks.
            Regular readers never see this page.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[hsl(260_16%_8%)] p-6 shadow-2xl"
        >
          <label className="block text-sm font-medium text-white">
            Operations key
            <div className="relative mt-2">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError("");
                }}
                placeholder="Same as CRON_SECRET in .env.local"
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-[hsl(260_16%_6%)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--accent))] focus:outline-none"
              />
            </div>
          </label>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

          <Button type="submit" variant="accent" className="mt-5 w-full" disabled={submitting}>
            {submitting ? "Verifying…" : "Unlock control center"}
          </Button>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-white/55">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your key is verified on the server and stored in a secure HttpOnly session cookie.
              The key in session storage is only used for protected sync API calls from this browser.
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          <Link href="/" className="hover:text-white/70">
            ← Back to {BRAND.shortName} Atlas
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminGate;
