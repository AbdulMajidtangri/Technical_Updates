import Link from 'next/link';
import { Flame } from 'lucide-react';
import { NewsCard } from './NewsCard';

export function TopStoriesSection({ articles = [] }) {
  const stories = [...articles]
    .sort((a, b) => (b.importanceScore ?? 0) - (a.importanceScore ?? 0))
    .slice(0, 6);

  if (!stories.length) return null;

  const [lead, ...rest] = stories;

  return (
    <section aria-labelledby="top-stories-heading" className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Flame className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wide">Top stories</span>
          </div>
          <h2 id="top-stories-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            What matters right now
          </h2>
        </div>
        <Link href="/#latest" className="text-sm font-medium text-brand-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:row-span-2">
          <NewsCard article={lead} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.slice(0, 4).map((article) => (
            <NewsCard key={article.id ?? article.slug} article={article} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopStoriesSection;