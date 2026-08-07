import Link from "next/link";
import { getStories } from "@/lib/data/stories.js";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/formatDate";

export const dynamic = "force-dynamic";

export const metadata = { title: "Developing Stories" };

export default async function StoriesPage() {
  const { stories } = await getStories({ limit: 30 });

  return (
    <PageContainer className="space-y-8 pb-16 pt-8">
      <header className="max-w-2xl border-b border-[hsl(var(--border))] pb-6">
        <p className="section-label">Story threads</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Developing stories</h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          Related articles grouped into evolving timelines — understand how events unfold over time.
        </p>
      </header>

      {stories.length ? (
        <ul className="space-y-4">
          {stories.map((story) => (
            <li key={story.id}>
              <Link href={`/stories/${story.slug}`} prefetch className="card-premium block p-5 transition hover:shadow-elevated sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold uppercase text-[hsl(var(--accent))]">{story.status}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">·</span>
                  <span className="text-[hsl(var(--muted-foreground))]">{story.category}</span>
                  {story.lastUpdatedAt ? (
                    <>
                      <span className="text-[hsl(var(--muted-foreground))]">·</span>
                      <span className="text-[hsl(var(--muted-foreground))]">Updated {formatRelativeTime(story.lastUpdatedAt)}</span>
                    </>
                  ) : null}
                </div>
                <h2 className="mt-2 font-serif text-xl font-semibold">{story.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {story.description || `${story.timeline?.length ?? 0} events · ${story.articleIds?.length ?? 0} articles`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No story threads yet" description="Open an article and view its timeline to start grouping related developments." />
      )}
    </PageContainer>
  );
}
