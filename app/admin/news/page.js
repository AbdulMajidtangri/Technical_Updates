"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2, Rss, Sparkles, Zap } from "lucide-react";
import { useAdminSecret } from "@/hooks/useAdminSecret";
import { Button } from "@/components/ui/Button";

async function callProtectedApi(path, secret) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cron-secret": secret,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? json.error ?? "Request failed");
  return json.data;
}

const STEPS = [
  {
    id: "collect",
    title: "Collect RSS",
    description: "Download new stories from your configured feeds.",
    icon: Rss,
    path: "/api/news/collect",
  },
  {
    id: "process",
    title: "Process with AI",
    description: "Summarize, score, and categorize collected articles.",
    icon: Sparkles,
    path: "/api/news/process",
  },
  {
    id: "sync",
    title: "Full sync",
    description: "Collect + process in one step — recommended for daily use.",
    icon: Zap,
    path: "/api/news/sync",
    recommended: true,
  },
];

function summarizeResult(data, stepId) {
  if (!data || typeof data !== "object") return "Completed successfully.";

  if (stepId === "collect") {
    return `${data.newArticles ?? 0} new articles · ${data.duplicates ?? 0} duplicates · ${data.feedsProcessed ?? 0} feeds`;
  }

  if (stepId === "process") {
    const stats = data.stats ?? data;
    return `${stats.succeeded ?? 0} analyzed · ${stats.failed ?? 0} failed · ${stats.remaining ?? 0} still pending`;
  }

  if (stepId === "sync") {
    const c = data.collect ?? {};
    const p = data.process ?? {};
    return `${c.newArticles ?? 0} new collected · ${p.succeeded ?? 0} AI analyzed · ${p.remaining ?? 0} pending`;
  }

  return "Completed successfully.";
}

export default function AdminNewsPage() {
  const { secret } = useAdminSecret();
  const [running, setRunning] = useState("");
  const [error, setError] = useState("");
  const [log, setLog] = useState([]);

  function pushLog(type, message) {
    setLog((prev) => [
      { id: `${Date.now()}-${prev.length}`, type, message, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9),
    ]);
  }

  async function runStep(step) {
    if (!secret.trim()) {
      setError("Operations key missing. Lock and unlock the control center again.");
      return;
    }
    setRunning(step.id);
    setError("");
    pushLog("info", `Starting ${step.title.toLowerCase()}...`);
    try {
      const data = await callProtectedApi(step.path, secret.trim());
      pushLog("success", `${step.title}: ${summarizeResult(data, step.id)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      pushLog("error", `${step.title} failed — ${msg}`);
    } finally {
      setRunning("");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--accent))]">
          News pipeline
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-white">Keep your feed fresh</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          Run these steps when you want new stories on the homepage. For daily use,{' '}
          <strong className="text-white">Full sync</strong> is enough.
        </p>
      </header>

      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isRunning = running === step.id;
          const done = log.some((entry) => entry.type === "success" && entry.message.startsWith(step.title));

          return (
            <article
              key={step.id}
              className={`rounded-2xl border p-5 transition ${
                step.recommended
                  ? "border-[hsl(var(--accent))]/35 bg-[hsl(var(--accent))]/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-[hsl(var(--accent))]" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                        Step {index + 1}
                      </p>
                      {step.recommended ? (
                        <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-1 font-serif text-xl font-semibold text-white">{step.title}</h2>
                    <p className="mt-1 text-sm text-white/55">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isRunning ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--accent))]" />
                  ) : done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-white/20" />
                  )}
                  <Button
                    type="button"
                    variant={step.recommended ? "accent" : "secondary"}
                    className={step.recommended ? "" : "border-white/15 bg-transparent text-white hover:bg-white/5"}
                    disabled={!!running}
                    onClick={() => runStep(step)}
                  >
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      {log.length ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-serif text-lg font-semibold text-white">Activity</h2>
          <ul className="mt-4 space-y-2">
            {log.map((entry) => (
              <li
                key={entry.id}
                className={`flex items-start justify-between gap-4 rounded-lg px-3 py-2 text-sm ${
                  entry.type === "success"
                    ? "bg-emerald-500/10 text-emerald-100"
                    : entry.type === "error"
                      ? "bg-red-500/10 text-red-100"
                      : "bg-white/5 text-white/70"
                }`}
              >
                <span>{entry.message}</span>
                <span className="shrink-0 text-xs opacity-60">{entry.time}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
