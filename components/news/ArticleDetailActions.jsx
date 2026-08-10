'use client';

import Link from 'next/link';
import { Bookmark, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useReadArticles } from '@/hooks/useReadArticles';
import { useOfflineArticles } from '@/hooks/useOfflineArticles';

export function ArticleDetailActions({ article }) {
  const { isSaved, toggleSaved, hydrated: savedReady } = useSavedArticles();
  const { isRead, toggleRead, markRead, hydrated: readReady } = useReadArticles();
  const { isOffline, hydrated: offlineReady } = useOfflineArticles();

  if (!article?.id) return null;

  const saved = savedReady && isSaved(article.id);
  const read = readReady && isRead(article.id);
  const offline = offlineReady && isOffline(article.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => toggleSaved(article.id, article)}
        aria-pressed={saved}
      >
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
        {saved ? 'Saved for offline' : 'Save for offline'}
      </Button>
      {saved && offline ? (
        <Link href={`/saved/read/${article.id}`}>
          <Button type="button" variant="secondary">
            <Download className="h-4 w-4" />
            Read offline copy
          </Button>
        </Link>
      ) : null}
      <Button type="button" variant="ghost" onClick={() => toggleRead(article.id)} aria-pressed={read}>
        <CheckCircle2 className={`h-4 w-4 ${read ? 'text-emerald-600' : ''}`} />
        {read ? 'Mark unread' : 'Mark as read'}
      </Button>
      {article.articleUrl ? (
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            markRead(article.id);
            window.open(article.articleUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          <ExternalLink className="h-4 w-4" />
          Read original
        </Button>
      ) : null}
    </div>
  );
}

export default ArticleDetailActions;
