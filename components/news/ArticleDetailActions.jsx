'use client';

import { Bookmark, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useReadArticles } from '@/hooks/useReadArticles';

export function ArticleDetailActions({ article }) {
  const { isSaved, toggleSaved, hydrated: savedReady } = useSavedArticles();
  const { isRead, toggleRead, markRead, hydrated: readReady } = useReadArticles();

  if (!article?.id) return null;

  const saved = savedReady && isSaved(article.id);
  const read = readReady && isRead(article.id);

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={() => toggleSaved(article.id)} aria-pressed={saved}>
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
        {saved ? 'Saved' : 'Save article'}
      </Button>
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