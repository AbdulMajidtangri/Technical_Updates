"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, WifiOff } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { getOfflineArticle } from "@/lib/offline/articleCache.js";
import { Badge } from "@/components/ui/Badge";

export default function OfflineReadPage() {
  const params = useParams();
  const id = params?.id;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getOfflineArticle(String(id))
      .then((doc) => {
        if (cancelled) return;
        if (!doc) setMissing(true);
        else setArticle(doc);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageContainer narrow className="py-16">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Opening offline article...</p>
      </PageContainer>
    );
  }

  if (missing || !article) {
    return (
      <PageContainer narrow className="space-y-4 py-16">
        <h1 className="font-serif text-2xl font-semibold">Not available offline</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          This article was not saved for offline reading. Save it while online, then open it here without internet.
        </p>
        <Link href="/saved" className="text-sm font-medium text-[hsl(var(--accent))]">
          Go to saved & offline
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow className="space-y-8 pb-16 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/saved"
          className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Saved & offline
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--surface))] px-3 py-1 text-xs font-medium ring-1 ring-[hsl(var(--border))]">
          <WifiOff className="h-3.5 w-3.5" />
          Offline copy
        </span>
      </div>

      <header className="space-y-4 border-b border-[hsl(var(--border))] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.category ? <Badge variant="outline">{article.category}</Badge> : null}
          <span className="text-sm text-[hsl(var(--muted-foreground))]">{article.sourceName}</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">{article.title}</h1>
        {article.savedAt ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Saved for offline on {new Date(article.savedAt).toLocaleString()}
          </p>
        ) : null}
      </header>

      {(article.simpleExplanation || article.summary) ? (
        <section className="card-premium space-y-4 p-6">
          <h2 className="font-serif text-xl font-semibold">In plain words</h2>
          {article.simpleExplanation ? (
            <p className="leading-relaxed">{article.simpleExplanation}</p>
          ) : null}
          {article.summary ? (
            <p className="leading-relaxed text-[hsl(var(--muted-foreground))]">{article.summary}</p>
          ) : null}
          {article.whyItMatters ? (
            <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Why it matters
              </p>
              <p className="mt-2 leading-relaxed">{article.whyItMatters}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {article.keyFacts?.length ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">Key facts</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {article.keyFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.description ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">Original excerpt</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-[hsl(var(--muted-foreground))]">
            {article.description}
          </p>
        </section>
      ) : null}

      {article.articleUrl ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Source link is available when you are back online:{" "}
          <span className="break-all text-[hsl(var(--foreground))]">{article.articleUrl}</span>
        </p>
      ) : null}
    </PageContainer>
  );
}
