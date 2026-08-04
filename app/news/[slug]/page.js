import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api/serverFetch';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArticleHero } from '@/components/news/ArticleHero';
import { ArticleDetailActions } from '@/components/news/ArticleDetailActions';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await fetchAPI(`/api/news/${encodeURIComponent(slug)}`);
  const article = data?.article;
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.summary || article.simpleExplanation || undefined,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const data = await fetchAPI(`/api/news/${encodeURIComponent(slug)}`);
  const article = data?.article;

  if (!article) notFound();

  const hasAi = article.aiProcessed && (article.summary || article.simpleExplanation || article.whyItMatters);
  const originalText = article.description?.trim();

  return (
    <PageContainer className="max-w-4xl space-y-8 pb-16">
      <ArticleHero article={article} />
      <ArticleDetailActions article={article} />

      <div className="grid gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Relevance</p>
          <p className="mt-1 font-semibold tabular-nums">{article.relevanceScore ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Importance</p>
          <p className="mt-1 font-semibold tabular-nums">{article.importanceScore ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Developer impact</p>
          <p className="mt-1 font-semibold">{article.developerImpact ?? 'Low'}</p>
        </div>
      </div>

      {article.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
              <Badge variant="outline">{tag}</Badge>
            </Link>
          ))}
        </div>
      ) : null}

      {hasAi ? (
        <section aria-labelledby="ai-summary" className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 dark:border-brand-900 dark:bg-brand-950/30">
          <h2 id="ai-summary" className="text-lg font-semibold text-brand-800 dark:text-brand-200">
            AI intelligence brief
          </h2>
          {article.simpleExplanation ? (
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Plain explanation</h3>
              <p className="mt-2 leading-relaxed">{article.simpleExplanation}</p>
            </div>
          ) : null}
          {article.summary ? (
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Summary</h3>
              <p className="mt-2 leading-relaxed">{article.summary}</p>
            </div>
          ) : null}
          {article.whyItMatters ? (
            <div>
              <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Why it matters</h3>
              <p className="mt-2 leading-relaxed">{article.whyItMatters}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {originalText ? (
        <section aria-labelledby="original-content" className="space-y-3">
          <h2 id="original-content" className="text-lg font-semibold">
            Original excerpt
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed text-[hsl(var(--muted-foreground))]">{originalText}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Sourced from the publisher feed; AI sections above are generated for quick scanning.
          </p>
        </section>
      ) : null}

      {!hasAi && !originalText ? (
        <p className="text-[hsl(var(--muted-foreground))]">Full content is available at the publisher.</p>
      ) : null}
    </PageContainer>
  );
}