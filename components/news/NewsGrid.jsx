import { NewsCard } from './NewsCard';

export function NewsGrid({ articles = [], columns = 3 }) {
  if (!articles.length) return null;

  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 xl:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 gap-6 ${colClass}`}>
      {articles.map((article) => (
        <NewsCard key={article.id ?? article.slug} article={article} />
      ))}
    </div>
  );
}

export default NewsGrid;