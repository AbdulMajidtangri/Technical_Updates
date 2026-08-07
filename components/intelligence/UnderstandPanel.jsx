"use client";

import { useState } from "react";
import Link from "next/link";
import { IntelligenceSection } from "./IntelligenceSection";
import { TrustBadge, TrustNotice } from "./TrustBadge";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

async function fetchIntelligence(endpoint, articleId, extra = {}) {
  const res = await fetch(`/api/ai/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, ...extra }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

function Field({ label, value, trust = "AI_ANALYSIS" }) {
  if (!value) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <TrustBadge level={trust} />
      </div>
      <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{value}</p>
    </div>
  );
}

export function UnderstandPanel({ articleId, preview }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (data || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchIntelligence("understand", articleId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze this story");
    } finally {
      setLoading(false);
    }
  }

  const summary = preview?.simpleExplanation || preview?.summary || "AI explanation of what happened and why it matters.";

  return (
    <IntelligenceSection
      id="understand"
      label="Understand this"
      title="What does this mean?"
      summary={summary}
      defaultOpen={Boolean(preview?.whatHappened || preview?.simpleExplanation)}
    >
      {!data && !loading ? (
        <button
          type="button"
          onClick={load}
          className="rounded-md bg-[hsl(var(--foreground))] px-4 py-2 text-sm font-medium text-[hsl(var(--background))] transition hover:opacity-90"
        >
          Generate understanding
        </button>
      ) : null}
      {loading ? <IntelligenceSkeleton message="Analyzing this story..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {data ? (
        <div className="space-y-5">
          <TrustNotice level="AI_ANALYSIS">AI-generated intelligence based on the source article. Facts are labeled where possible.</TrustNotice>
          <Field label="What happened?" value={data.whatHappened} trust="CONFIRMED" />
          <Field label="Simple explanation" value={data.simpleExplanation} trust="AI_ANALYSIS" />
          <Field label="Why it matters" value={data.whyItMatters} trust="AI_ANALYSIS" />
          {data.whatChanged ? <Field label="What changed?" value={data.whatChanged} trust="AI_ANALYSIS" /> : null}
          {data.keyFacts?.length ? (
            <div>
              <h3 className="mb-2 text-sm font-medium">Key facts</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {data.keyFacts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.unknowns?.length ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-medium">What is still unknown</h3>
                <TrustBadge level="UNKNOWN" />
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[hsl(var(--muted-foreground))]">
                {data.unknowns.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {data.affectedGroups?.length ? (
            <div>
              <h3 className="mb-2 text-sm font-medium">Who is affected</h3>
              <ul className="space-y-2">
                {data.affectedGroups.map((g) => (
                  <li key={g.group} className="text-sm">
                    <span className="font-medium">{g.group}:</span> {g.explanation}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      {!data && !loading && preview?.simpleExplanation ? (
        <div className="mt-4 space-y-3 border-t border-[hsl(var(--border))] pt-4">
          <Field label="Quick summary" value={preview.simpleExplanation} trust="AI_ANALYSIS" />
          {preview.whyItMatters ? <Field label="Why it matters" value={preview.whyItMatters} trust="AI_ANALYSIS" /> : null}
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default UnderstandPanel;
