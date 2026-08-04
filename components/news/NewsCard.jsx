'use client';

import Link from 'next/link';
import { Bookmark, CheckCircle2, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { getCategorySlug } from '@/lib/config/categories';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ImportanceIndicator } from '@/components/ui/ImportanceIndicator';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useReadArticles } from '@/hooks/useReadArticles';
import { ArticleImage } from './ArticleImage';

export function NewsCard({ article, variant = 'default' }) {
  const { isSaved, toggleSaved, hydrated: savedReady } = useSavedArticles();
  const { isRead, markRead, toggleRead, hydrated: readReady } = useReadArticles();

  if (!article?.slug) return null;

  const read = readReady && isRead(article.id);
  const saved = savedReady && isSaved(article.id);
  const categorySlug = getCategorySlug(article.category);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-800 ${
        read ? 'opacity-80' : ''
      }`}
    >
      <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        <ArticleImage src={article.imageUrl} alt="" className="transition duration-300 group-hover:scale-[1.02]" />
        {read ? (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-medium text-white">
            Read
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Link href={`/categories/${categorySlug}`}>
            <Badge variant="brand">{article.category}</Badge>
          </Link>
          {article.aiProcessed ? <Badge variant="success">AI</Badge> : null}
          {article.developerImpact ? (
            <Badge variant="outline">Dev {article.developerImpact}</Badge>
          ) : null}
        </div>

        <h3 className={`text-base font-semibold leading-snug sm:text-lg ${read ? 'text-[hsl(var(--muted-foreground))]' : ''}`}>
          <Link href={`/news/${article.slug}`} className="hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            {article.title}
          </Link>
        </h3>

        {variant !== 'compact' && article.summary ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {article.summary}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex flex-col gap-1">
            <span>{article.sourceName}</span>
            <time dateTime={article.publishedAt ?? undefined}>{formatRelativeTime(article.publishedAt)}</time>
          </div>
          <ImportanceIndicator score={article.importanceScore} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => toggleSaved(article.id)}
            aria-pressed={saved}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => toggleRead(article.id)} aria-pressed={read}>
            <CheckCircle2 className={`h-4 w-4 ${read ? 'text-emerald-600' : ''}`} />
            {read ? 'Unread' : 'Mark read'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              markRead(article.id);
              window.open(article.articleUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Source
          </Button>
        </div>
      </div>
    </article>
  );
}

export default NewsCard;