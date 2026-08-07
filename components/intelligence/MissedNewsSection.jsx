"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useInterestProfile } from "@/hooks/useInterestProfile";
import { useReadArticles } from "@/hooks/useReadArticles";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IntelligenceSkeleton } from "@/components/intelligence/IntelligenceSkeleton";
import { TrustBadge } from "@/components/intelligence/TrustBadge";
import { formatRelativeTime } from "@/lib/utils/formatDate";

export function MissedNewsSection() {
  const { interestProfile, hydrated: profileReady } = useInterestProfile();
  const { readIds, hydrated: readReady } = useReadArticles();
  const { savedIds, hydrated: savedReady } = useSavedArticles();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profileReady || !readReady || !savedReady || loaded) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/ai/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            readIds,
            savedIds,
            interestProfile,
            limit: 5,
            useAi: readIds.length >= 3,
          }),
        });
        const json = await res.json();
        if (!cancelled && json.success) {
          setItems(json.data?.items ?? []);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [profileReady, readReady, savedReady, readIds, savedIds, interestProfile, loaded]);

  if (!loaded && loading) {
    return (
      <section className="space-y-4">
        <SectionHeader label="Discovery" title="You may have missed" description="Important stories connected to your interests." />
        <IntelligenceSkeleton message="Finding relevant stories you haven't seen..." />
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="space-y-6">
      <SectionHeader label="Discovery" title="You may have missed" description="Important stories connected to your reading history — not random recommendations." />
      <ul className="card-premium divide-y divide-[hsl(var(--border))]">
        {items.map((item) => (
          <li key={item.articleId} className="p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <TrustBadge level="AI_ANALYSIS" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Personalized</span>
            </div>
            {item.article?.slug ? (
              <Link href={`/news/${item.article.slug}`} className="font-serif text-lg font-semibold hover:text-[hsl(var(--accent))]">
                {item.article.title}
              </Link>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{item.reason}</p>
            {item.article?.publishedAt ? (
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                {item.article.sourceName} · {formatRelativeTime(item.article.publishedAt)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MissedNewsSection;
