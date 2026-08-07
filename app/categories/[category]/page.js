import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getArticles, getStats } from '@/lib/data/articles.js';
import { getCategoryBySlug } from '@/lib/config/categories';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewsGrid } from '@/components/news/NewsGrid';
import { FilterBar } from '@/components/news/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CATEGORIES } from '@/lib/config/categories';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const name = getCategoryBySlug(slug);
  return { title: name ?? 'Category' };
}

export default async function CategoryArticlesPage({ params, searchParams }) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const categoryName = getCategoryBySlug(slug);
  if (!categoryName) notFound();

  const [newsData, stats] = await Promise.all([
    getArticles({
      category: categoryName,
      limit: 24,
      importance: sp.importance,
      developerImpact: sp.developerImpact,
      source: sp.source,
      dateFrom: sp.dateFrom ?? sp.from,
      dateTo: sp.dateTo ?? sp.to,
    }),
    getStats(),
  ]);

  const articles = newsData?.articles ?? [];
  const sources = (stats?.sources ?? []).map((s) => s.source).filter(Boolean);

  return (
    <PageContainer className="space-y-8 pb-16 pt-8">
      <header className="max-w-2xl border-b border-[hsl(var(--border))] pb-6">
        <p className="section-label">Category</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{categoryName}</h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this topic
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <FilterBar categories={CATEGORIES} sources={sources.slice(0, 30)} />
      </Suspense>
      {articles.length ? (
        <NewsGrid articles={articles} layout="list" showCategory={false} />
      ) : (
        <EmptyState title="No articles" description="Try adjusting filters or collect more news." />
      )}
    </PageContainer>
  );
}