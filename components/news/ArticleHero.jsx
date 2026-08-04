import Link from 'next/link';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/formatDate';
import { getCategorySlug } from '@/lib/config/categories';
import { Badge } from '@/components/ui/Badge';
import { ImportanceIndicator } from '@/components/ui/ImportanceIndicator';
import { ArticleImage } from './ArticleImage';

export function ArticleHero({ article }) {
  if (!article) return null;

  const categorySlug = getCategorySlug(article.category);

  return (
    <header className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className="relative aspect-[21/9] min-h-[200px] w-full">
        <ArticleImage src={article.imageUrl} alt="" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mb-3 flex flex-wrap gap-2">
            <Link href={`/categories/${categorySlug}`}>
              <Badge variant="brand">{article.category}</Badge>
            </Link>
            {article.aiProcessed ? <Badge variant="success">AI analyzed</Badge> : null}
            {article.developerImpact ? <Badge variant="outline">Developer impact: {article.developerImpact}</Badge> : null}
          </div>
          <h1 className="max-w-4xl text-balance text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/85">
            <span>{article.sourceName}</span>
            <time dateTime={article.publishedAt ?? undefined} title={formatDateTime(article.publishedAt)}>
              {formatRelativeTime(article.publishedAt)}
            </time>
            <div className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">
              <ImportanceIndicator score={article.importanceScore} showLabel />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ArticleHero;