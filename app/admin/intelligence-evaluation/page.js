"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

export default function IntelligenceEvaluationPage() {
  const [articleId, setArticleId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadCached() {
    if (!articleId.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/intelligence/article/${articleId.trim()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function runActionPlanner() {
    if (!articleId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intelligence/action-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: articleId.trim(), force: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData((prev) => ({ ...(prev ?? {}), actionPlanner: json.data, articleId: articleId.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ActionPlanner failed");
    } finally {
      setLoading(false);
    }
  }

  async function runLearnPath() {
    if (!articleId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intelligence/learn-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: articleId.trim(), force: true, knowledgeProfile: { concepts: {} } }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setData((prev) => ({ ...(prev ?? {}), learnPath: json.data, articleId: articleId.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "LearnPath failed");
    } finally {
      setLoading(false);
    }
  }

  const ap = data?.actionPlanner;
  const lp = data?.learnPath;

  return (
    <PageContainer className="space-y-8 py-10">
      <header>
        <p className="section-label">Developer only</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Intelligence evaluation</h1>
        <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">
          Inspect structured ActionPlanner and LearnPath outputs. No hidden chain-of-thought — only scores, evidence, and decisions.
        </p>
      </header>

      <div className="card-premium max-w-xl space-y-4 p-6">
        <label className="block text-sm font-medium">
          Article ID
          <input
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            placeholder="MongoDB article _id"
            className="mt-1 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={loadCached}>
            Load cached
          </Button>
          <Button type="button" disabled={loading} onClick={runActionPlanner}>
            Run ActionPlanner
          </Button>
          <Button type="button" disabled={loading} onClick={runLearnPath}>
            Run LearnPath
          </Button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      {ap ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">ActionPlanner</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {["status", "relevanceScore", "urgencyScore", "confidenceScore"].map((key) => (
              <div key={key} className="rounded-md border border-[hsl(var(--border))] p-3 text-sm">
                <p className="text-[11px] uppercase text-[hsl(var(--muted-foreground))]">{key}</p>
                <p className="mt-1 font-medium">{String(ap[key] ?? "—")}</p>
              </div>
            ))}
          </div>
          {ap._debug ? (
            <pre className="max-h-72 overflow-auto rounded-md bg-[hsl(var(--muted))] p-4 text-xs">
              {JSON.stringify(ap._debug, null, 2)}
            </pre>
          ) : null}
          <pre className="max-h-96 overflow-auto rounded-md bg-[hsl(var(--muted))] p-4 text-xs">
            {JSON.stringify(ap, null, 2)}
          </pre>
        </section>
      ) : null}

      {lp ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">LearnPath</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{lp.learningSummary}</p>
          {lp._debug ? (
            <pre className="max-h-72 overflow-auto rounded-md bg-[hsl(var(--muted))] p-4 text-xs">
              {JSON.stringify(lp._debug, null, 2)}
            </pre>
          ) : null}
          <pre className="max-h-96 overflow-auto rounded-md bg-[hsl(var(--muted))] p-4 text-xs">
            {JSON.stringify(lp, null, 2)}
          </pre>
        </section>
      ) : null}
    </PageContainer>
  );
}
