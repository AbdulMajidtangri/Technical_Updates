import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchAPI } from '@/lib/api/serverFetch';
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

function buildQuery(categoryName, searchParams) {
  const qs = new URLSearchParams();
  qs.set('category', categoryName);
  qs.set('limit', '24');
  const keys = ['importance', 'developerImpact', 'source', 'dateFrom', 'dateTo'];
  for (const key of keys) {
    const value = searchParams[key];
    if (value) qs.set(key, String(value));
  }
  return qs.toString();
}

export default async function CategoryArticlesPage({ params, searchParams }) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const categoryName = getCategoryBySlug(slug);

  if (!categoryName) notFound();

  const [newsData, stats] = await Promise.all([
    fetchAPI(`/api/news?${buildQuery(categoryName, sp)}`, { next: { revalidate: 0 } }),
    fetchAPI('/api/stats'),
  ]);

  const articles = newsData?.articles ?? [];
  const sources = (stats?.sources ?? []).map((s) => s.source).filter(Boolean);

  return (
    <PageContainer className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600">Category</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{categoryName}</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">{articles.length} articles shown</p>
      </div>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <FilterBar categories={CATEGORIES} sources={sources.slice(0, 30)} />
      </Suspense>

      {articles.length ? <NewsGrid articles={articles} /> : <EmptyState title="No articles" description="Try adjusting filters or collect more news." />}
    </PageContainer>
  );
}