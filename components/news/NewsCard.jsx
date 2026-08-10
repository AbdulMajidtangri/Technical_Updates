"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { getCategorySlug } from "@/lib/config/categories";
import { ImportanceIndicator } from "@/components/ui/ImportanceIndicator";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { useReadArticles } from "@/hooks/useReadArticles";
import { ArticleImage } from "./ArticleImage";

function CardActions({ article, saved, onToggleSave, onMarkRead }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onToggleSave}
        className="rounded p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
        aria-label={saved ? "Remove from saved" : "Save article"}
        aria-pressed={saved}
      >
        <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" : ""}`} />
      </button>
      <button
        type="button"
        onClick={() => {
          onMarkRead();
          window.open(article.articleUrl, "_blank", "noopener,noreferrer");
        }}
        className="rounded p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
        aria-label="Open original article"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CardMeta({ article, showCategory = true }) {
  const categorySlug = getCategorySlug(article.category);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[hsl(var(--muted-foreground))]">
      {showCategory && article.category ? (
        <>
          <Link
            href={`/categories/${categorySlug}`}
            prefetch
            className="font-medium uppercase tracking-wide text-[hsl(var(--accent))] hover:opacity-80"
          >
            {article.category}
          </Link>
          <span aria-hidden="true">·</span>
        </>
      ) : null}
      <span className="font-medium text-[hsl(var(--foreground))]">{article.sourceName}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt ?? undefined}>{formatRelativeTime(article.publishedAt)}</time>
    </div>
  );
}

function AiSummary({ article, compact = false }) {
  const text = article.simpleExplanation || article.summary;
  if (!text) return null;

  return (
    <div className={`rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] ${compact ? "mt-2 p-2.5" : "mt-3 p-3 sm:p-3.5"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">AI summary</p>
      <p className={`mt-1.5 leading-relaxed text-[hsl(var(--foreground))] ${compact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm"}`}>
        {text}
      </p>
    </div>
  );
}

function CardFooter({ article, saved, onToggleSave, onMarkRead }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-3">
      <ImportanceIndicator score={article.importanceScore} />
      <div className="flex items-center gap-2">
        <Link
          href={`/news/${article.slug}`}
          prefetch
          className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--accent))] hover:opacity-80"
        >
          Read more
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
        <CardActions article={article} saved={saved} onToggleSave={onToggleSave} onMarkRead={onMarkRead} />
      </div>
    </div>
  );
}

export function NewsCard({ article, variant = "default", featured = false, showCategory = true, offlineLinks = false }) {
  const { isSaved, toggleSaved, hydrated: savedReady } = useSavedArticles();
  const { isRead, markRead, hydrated: readReady } = useReadArticles();

  if (!article?.slug) return null;

  const read = readReady && isRead(article.id);
  const saved = savedReady && isSaved(article.id);
  const resolvedVariant = featured ? "featured" : variant;
  const mark = () => markRead(article.id);

  if (resolvedVariant === "list") {
    return (
      <article className={`group flex gap-4 py-5 sm:gap-5 sm:py-6 ${read ? "opacity-70" : ""}`}>
        <Link
          href={`/news/${article.slug}`}
          prefetch
          onClick={mark}
          className="relative block h-[72px] w-[96px] shrink-0 overflow-hidden rounded-md bg-[hsl(var(--surface))] sm:h-[88px] sm:w-[120px]"
        >
          <ArticleImage src={article.imageUrl} alt="" className="transition duration-300 group-hover:scale-[1.04]" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <CardMeta article={article} showCategory={showCategory} />
          <h3 className="mt-2 font-serif text-base font-semibold leading-snug sm:text-[1.05rem]">
            <Link href={`/news/${article.slug}`} prefetch onClick={mark} className="hover:text-[hsl(var(--accent))] transition-colors">
              {article.title}
            </Link>
          </h3>
          <AiSummary article={article} compact />
          <div className="mt-3 flex items-center justify-between gap-3">
            <ImportanceIndicator score={article.importanceScore} />
            <div className="flex items-center gap-2">
              <Link href={`/news/${article.slug}`} prefetch className="text-xs font-medium text-[hsl(var(--accent))] hover:opacity-80">
                Read more
              </Link>
              {offlineLinks && article.id ? (
                <Link href={`/saved/read/${article.id}`} className="text-xs font-medium text-[hsl(var(--foreground))] hover:opacity-80">
                  Read offline
                </Link>
              ) : null}
              <CardActions article={article} saved={saved} onToggleSave={() => toggleSaved(article.id, article)} onMarkRead={mark} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (resolvedVariant === "featured") {
    return (
      <article className={`card-premium group overflow-hidden transition-shadow hover:shadow-elevated lg:flex ${read ? "opacity-75" : ""}`}>
        <Link
          href={`/news/${article.slug}`}
          prefetch
          onClick={mark}
          className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-[hsl(var(--surface))] lg:aspect-auto lg:w-[52%] lg:min-h-[280px]"
        >
          <ArticleImage src={article.imageUrl} alt="" priority className="transition duration-500 group-hover:scale-[1.03]" />
          {read ? (
            <span className="absolute left-3 top-3 rounded bg-[hsl(var(--foreground))]/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--background))]">
              Read
            </span>
          ) : null}
        </Link>

        <div className="flex flex-1 flex-col p-5 sm:p-6 lg:py-8 lg:pl-8 lg:pr-7">
          <CardMeta article={article} showCategory={showCategory} />
          <h3 className="mt-3 font-serif text-xl font-semibold leading-snug sm:text-2xl lg:text-[1.65rem]">
            <Link href={`/news/${article.slug}`} prefetch onClick={mark} className="hover:text-[hsl(var(--accent))] transition-colors">
              {article.title}
            </Link>
          </h3>
          <AiSummary article={article} />
          <CardFooter article={article} saved={saved} onToggleSave={() => toggleSaved(article.id, article)} onMarkRead={mark} />
        </div>
      </article>
    );
  }

  const isCompact = resolvedVariant === "compact";

  return (
    <article className={`card-premium group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-elevated ${read ? "opacity-75" : ""}`}>
      <Link
        href={`/news/${article.slug}`}
        prefetch
        onClick={mark}
        className={`relative block shrink-0 overflow-hidden bg-[hsl(var(--surface))] ${isCompact ? "aspect-[3/2]" : "aspect-[4/3]"}`}
      >
        <ArticleImage src={article.imageUrl} alt="" className="transition duration-300 group-hover:scale-[1.03]" />
        {read ? (
          <span className="absolute left-2.5 top-2.5 rounded bg-[hsl(var(--foreground))]/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--background))]">
            Read
          </span>
        ) : null}
      </Link>

      <div className={`flex flex-1 flex-col ${isCompact ? "p-4" : "p-4 sm:p-5"}`}>
        <CardMeta article={article} showCategory={showCategory} />
        <h3 className={`mt-2 font-serif font-semibold leading-snug ${isCompact ? "text-[0.9375rem] line-clamp-3" : "text-base sm:text-lg line-clamp-2"}`}>
          <Link href={`/news/${article.slug}`} prefetch onClick={mark} className="hover:text-[hsl(var(--accent))] transition-colors">
            {article.title}
          </Link>
        </h3>
        {!isCompact ? <AiSummary article={article} /> : null}
        <CardFooter article={article} saved={saved} onToggleSave={() => toggleSaved(article.id, article)} onMarkRead={mark} />
      </div>
    </article>
  );
}

export default NewsCard;
