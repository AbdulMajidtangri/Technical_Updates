import Link from "next/link";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/formatDate";
import { getCategorySlug } from "@/lib/config/categories";
import { Badge } from "@/components/ui/Badge";
import { ImportanceIndicator } from "@/components/ui/ImportanceIndicator";
import { ArticleImage } from "./ArticleImage";

export function ArticleHero({ article }) {
  if (!article) return null;
  const categorySlug = getCategorySlug(article.category);

  return (
    <header className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-card">
      <div className="relative aspect-[21/9] min-h-[220px] w-full bg-[hsl(var(--surface))]">
        <ArticleImage src={article.imageUrl} alt="" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--foreground))]/90 via-[hsl(var(--foreground))]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link href={`/categories/${categorySlug}`} prefetch>
              <Badge variant="muted" className="!bg-white/15 !text-white ring-white/20">{article.category}</Badge>
            </Link>
            {article.aiProcessed ? <Badge variant="muted" className="!bg-white/10 !text-white/90 ring-white/15">Analyzed</Badge> : null}
          </div>
          <h1 className="max-w-4xl font-serif text-2xl font-semibold leading-tight text-white sm:text-4xl">{article.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="font-medium text-white">{article.sourceName}</span>
            <span>·</span>
            <time dateTime={article.publishedAt ?? undefined} title={formatDateTime(article.publishedAt)}>
              {formatRelativeTime(article.publishedAt)}
            </time>
            <ImportanceIndicator score={article.importanceScore} inverted />
          </div>
        </div>
      </div>
    </header>
  );
}

export default ArticleHero;