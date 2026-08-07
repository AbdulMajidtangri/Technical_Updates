"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { IntelligenceSection } from "./IntelligenceSection";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

export function TimelinePanel({ articleId }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (story || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed");
      setStory(json.data?.story ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Timeline unavailable");
    } finally {
      setLoading(false);
    }
  }

  const eventCount = story?.timeline?.length ?? 0;

  return (
    <IntelligenceSection
      id="timeline"
      label="Story timeline"
      title="How this story evolved"
      summary={eventCount ? `${eventCount} events in this story thread.` : "Track developments over time."}
    >
      {!story && !loading ? (
        <button type="button" onClick={load} className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium transition hover:bg-[hsl(var(--muted))]">
          View timeline
        </button>
      ) : null}
      {loading ? <IntelligenceSkeleton message="Building story timeline..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {story ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <span className="font-medium">{story.title}</span>
              <span className="mx-2 text-[hsl(var(--muted-foreground))]">·</span>
              <span className="rounded bg-[hsl(var(--surface))] px-2 py-0.5 text-xs uppercase">{story.status}</span>
            </p>
            {story.slug ? (
              <Link href={`/stories/${story.slug}`} className="link-accent text-sm font-medium">
                Full story →
              </Link>
            ) : null}
          </div>
          <ol className="relative space-y-0 border-l border-[hsl(var(--border))] pl-6">
            {story.timeline?.map((event, i) => (
              <li key={event.id ?? i} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-[hsl(var(--accent))] bg-[hsl(var(--card))]" />
                <time className="text-xs text-[hsl(var(--muted-foreground))]">
                  {event.date ? formatRelativeTime(event.date) : "—"}
                </time>
                <p className="mt-0.5 font-medium">{event.title}</p>
                {event.description ? (
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{event.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </IntelligenceSection>
  );
}

export default TimelinePanel;
