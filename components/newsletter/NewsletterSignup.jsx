"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NewsletterSignup({ compact = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const json = await res.json();

      if (!json.success) {
        setStatus("error");
        setMessage(json.error?.message ?? "Could not subscribe. Try again.");
        return;
      }

      setStatus("success");
      setMessage(json.data?.message ?? "You're subscribed!");
      if (!json.data?.alreadySubscribed) {
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className={compact ? "" : "rounded-2xl border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.8)] p-5 sm:p-6"}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="section-label">Newsletter</p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-[hsl(var(--foreground))]">Get tech updates by email</h3>
          <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Add your email and we&apos;ll notify you when new technical stories and software updates are published. No spam — just meaningful releases.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="newsletter-email">
              Email for newsletter
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={status === "loading"}
              className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.2)] disabled:opacity-60"
            />
            <Button type="submit" variant="accent" disabled={status === "loading"} className="shrink-0 rounded-xl px-5">
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subscribing…
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>

          {status === "success" ? (
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </p>
          ) : null}

          {status === "error" ? (
            <p className="mt-3 text-sm text-red-500" role="alert">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default NewsletterSignup;
