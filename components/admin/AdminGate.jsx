"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useAdminSecret } from "@/hooks/useAdminSecret";
import { Button } from "@/components/ui/Button";

export function AdminGate() {
  const { unlock } = useAdminSecret();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!key.trim()) {
      setError("Enter your operations key to continue.");
      return;
    }
    const ok = unlock(key);
    if (!ok) setError("Could not unlock. Check your key and try again.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(222_47%_5%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-sm font-bold text-white">
            TP
          </span>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-white">Control Center</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Owner-only area for news sync, system health, and intelligence checks.
            Regular readers never see this page.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[hsl(222_47%_8%)] p-6 shadow-2xl"
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
                className="w-full rounded-lg border border-white/10 bg-[hsl(222_47%_6%)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--accent))] focus:outline-none"
              />
            </div>
          </label>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

          <Button type="submit" variant="accent" className="mt-5 w-full">
            Unlock control center
          </Button>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-white/55">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              This key is stored only in your browser session. It is never shown on the public site
              or shared with readers.
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          <Link href="/" className="hover:text-white/70">
            ← Back to TechPulse
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminGate;
