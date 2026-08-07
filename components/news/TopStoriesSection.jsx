import { NewsCard } from "./NewsCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function TopStoriesSection({ articles = [] }) {
  const stories = [...articles]
    .sort((a, b) => (b.importanceScore ?? 0) - (a.importanceScore ?? 0))
    .slice(0, 5);

  if (!stories.length) return null;

  const [lead, ...rest] = stories;

  return (
    <section aria-labelledby="top-stories-heading" className="space-y-8">
      <SectionHeader
        label="Priority briefing"
        title="Top stories"
        description="Highest-ranked developments based on importance, relevance, and recency."
        href="/#latest"
      />

      <div className="space-y-6">
        <NewsCard article={lead} featured />
        <div className="grid gap-5 sm:grid-cols-2">
          {rest.map((article) => (
            <NewsCard key={article.id ?? article.slug} article={article} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopStoriesSection;