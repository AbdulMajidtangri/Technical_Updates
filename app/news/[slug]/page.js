import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlugOrId } from '@/lib/data/articles.js';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArticleHero } from '@/components/news/ArticleHero';
import { ArticleDetailActions } from '@/components/news/ArticleDetailActions';
import { ReadingGuide } from '@/components/intelligence/ReadingGuide';
import { ArticleIntelligence } from '@/components/intelligence/ArticleIntelligence';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlugOrId(slug);
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
  const article = await getArticleBySlugOrId(slug);
  if (!article) notFound();

  const originalText = article.description?.trim();

  return (
    <PageContainer narrow className="space-y-8 pb-16 pt-8">
      <ArticleHero article={article} />
      <ArticleDetailActions article={article} />

      <div className="grid gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Relevance</p>
          <p className="mt-1 font-serif text-xl font-semibold tabular-nums">{article.relevanceScore ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Importance</p>
          <p className="mt-1 font-serif text-xl font-semibold tabular-nums">{article.importanceScore ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Developer impact</p>
          <p className="mt-1 font-serif text-xl font-semibold">{article.developerImpact ?? 'Low'}</p>
        </div>
      </div>

      {article.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} prefetch>
              <Badge variant="outline">{tag}</Badge>
            </Link>
          ))}
        </div>
      ) : null}

      {(article.simpleExplanation || article.summary || article.whyItMatters) ? (
        <section aria-labelledby="ai-summary-heading" className="card-premium space-y-5 p-6 sm:p-8">
          <div className="border-b border-[hsl(var(--border))] pb-4">
            <p className="section-label">OpenAI summary</p>
            <h2 id="ai-summary-heading" className="mt-1 font-serif text-2xl font-semibold">In plain words</h2>
          </div>
          {article.simpleExplanation ? (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Simple explanation</h3>
              <p className="mt-2 text-base leading-relaxed">{article.simpleExplanation}</p>
            </div>
          ) : null}
          {article.summary ? (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Summary</h3>
              <p className="mt-2 text-base leading-relaxed">{article.summary}</p>
            </div>
          ) : null}
          {article.whyItMatters ? (
            <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Why it matters</h3>
              <p className="mt-2 leading-relaxed">{article.whyItMatters}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <ReadingGuide articleId={article.id} sourceUrl={article.articleUrl} />

      <div className="space-y-4">
        <div className="border-b border-[hsl(var(--border))] pb-3">
          <p className="section-label">Go deeper</p>
          <h2 className="mt-1 font-serif text-xl font-semibold">More analysis</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Optional panels — open only what you need: impact, connections, timeline, and scenarios.
          </p>
        </div>
        <ArticleIntelligence article={article} />
      </div>

      {originalText ? (
        <section aria-labelledby="original-content" className="space-y-3">
          <p className="section-label">Source material</p>
          <h2 id="original-content" className="section-title">Original excerpt</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-[hsl(var(--muted-foreground))]">{originalText}</p>
        </section>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Full content is available at the publisher.</p>
      )}
    </PageContainer>
  );
}
