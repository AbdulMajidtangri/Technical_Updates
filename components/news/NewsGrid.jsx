import { NewsCard } from './NewsCard';

export function NewsGrid({
  articles = [],
  columns = 3,
  layout = 'grid',
  showCategory = true,
  variant = 'default',
  offlineLinks = false,
}) {
  if (!articles.length) return null;

  if (layout === 'list') {
    return (
      <div className="card-premium divide-y divide-[hsl(var(--border))] px-4 sm:px-6">
        {articles.map((article) => (
          <NewsCard
            key={article.id ?? article.slug}
            article={article}
            variant="list"
            showCategory={showCategory}
            offlineLinks={offlineLinks}
          />
        ))}
      </div>
    );
  }

  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 xl:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 gap-5 ${colClass}`}>
      {articles.map((article) => (
        <NewsCard
          key={article.id ?? article.slug}
          article={article}
          variant={variant}
          showCategory={showCategory}
        />
      ))}
    </div>
  );
}

export default NewsGrid;
