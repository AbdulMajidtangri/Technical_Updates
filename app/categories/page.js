import Link from 'next/link';
import { fetchAPI } from '@/lib/api/serverFetch';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategorySlug } from '@/lib/config/categories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Categories',
};

export default async function CategoriesPage() {
  const data = await fetchAPI('/api/categories');
  const categories = data?.categories ?? [];
  const withArticles = categories.filter((c) => c.count > 0);

  return (
    <PageContainer>
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
        <p className="mt-3 text-[hsl(var(--muted-foreground))]">
          Explore technology news grouped by topic. Counts reflect articles in your library.
        </p>
      </div>

      {withArticles.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`/categories/${getCategorySlug(cat.name)}`}
                className="flex h-full flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{cat.name}</h2>
                  <Badge variant={cat.count ? 'brand' : 'outline'}>{cat.count}</Badge>
                </div>
                {cat.description ? (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-[hsl(var(--muted-foreground))]">{cat.description}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No categories yet" description="Collect articles to see category breakdowns." />
      )}
    </PageContainer>
  );
}