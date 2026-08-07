import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoryBySlug } from "@/lib/data/stories.js";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { ArticleImage } from "@/components/news/ArticleImage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title, description: story.description };
}

export default async function StoryPage({ params }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <PageContainer className="space-y-8 pb-16 pt-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">{story.status}</Badge>
          <Badge variant="outline">{story.category}</Badge>
          {story.lastUpdatedAt ? (
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Last updated {formatRelativeTime(story.lastUpdatedAt)}
            </span>
          ) : null}
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{story.title}</h1>
        {story.description ? (
          <p className="max-w-3xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">{story.description}</p>
        ) : null}
        {story.keyEntities?.length ? (
          <div className="flex flex-wrap gap-2">
            {story.keyEntities.map((e) => (
              <Badge key={e} variant="outline">{e}</Badge>
            ))}
          </div>
        ) : null}
      </header>

      <section className="space-y-6">
        <h2 className="section-title">Timeline</h2>
        <ol className="relative space-y-0 border-l border-[hsl(var(--border))] pl-8">
          {story.timeline?.map((event, i) => (
            <li key={event.id ?? i} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[33px] top-1.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--accent))] bg-[hsl(var(--card))]" />
              <time className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
              </time>
              <p className="mt-1 font-serif text-lg font-semibold">{event.title}</p>
              {event.description ? (
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{event.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {story.articles?.length ? (
        <section className="space-y-4">
          <h2 className="section-title">Related articles</h2>
          <ul className="divide-y divide-[hsl(var(--border))] rounded-lg border border-[hsl(var(--border))]">
            {story.articles.map((article) => (
              <li key={article.id} className="flex gap-4 p-4 sm:p-5">
                <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--surface))] sm:block">
                  <ArticleImage src={article.imageUrl} alt="" />
                </div>
                <div className="min-w-0">
                  <Link href={`/news/${article.slug}`} className="font-serif font-semibold hover:text-[hsl(var(--accent))]">
                    {article.title}
                  </Link>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {article.sourceName} · {formatRelativeTime(article.publishedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageContainer>
  );
}
