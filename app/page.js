import Link from "next/link";
import { getStats, getArticles } from "@/lib/data/articles.js";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopStoriesSection } from "@/components/news/TopStoriesSection";
import { NewsGrid } from "@/components/news/NewsGrid";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MissedNewsSection } from "@/components/intelligence/MissedNewsSection";
import { BriefingSection } from "@/components/intelligence/BriefingSection";
import { getDevelopingStories } from "@/lib/data/stories.js";
import { getCategorySlug } from "@/lib/config/categories";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { BRAND } from "@/lib/config/brand.js";

export const dynamic = "force-dynamic";

function aggregateTags(articles, limit = 12) {
  const counts = new Map();
  for (const article of articles) {
    for (const tag of article.tags ?? []) {
      const key = String(tag).trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag, count]) => ({ tag, count }));
}

function groupByCategory(articles, categoryNames) {
  const map = new Map();
  for (const name of categoryNames) map.set(name, []);
  for (const article of articles) {
    const list = map.get(article.category);
    if (list && list.length < 4) list.push(article);
  }
  return map;
}

function formatToday() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date());
}

export default async function HomePage() {
  let stats = null;
  let topNews = null;
  let latestNews = null;
  let dbError = null;

  let developingStories = [];

  try {
    [stats, topNews, latestNews] = await Promise.all([
      getStats(),
      getArticles({ limit: 20, importance: 60 }),
      getArticles({ limit: 40 }),
    ]);
    developingStories = await getDevelopingStories(6);
  } catch (error) {
    stats = null;
    dbError = error?.message ?? "Connection failed";
  }

  const dbConnected = stats !== null;
  const topArticles = topNews?.articles ?? [];
  const latestArticles = latestNews?.articles ?? [];
  const statsData = stats ?? { totalArticles: 0, articlesAnalyzed: 0, articlesToday: 0, importantArticles: 0, categories: [], lastUpdated: null };

  const aiHighlights = latestArticles.filter((a) => a.aiProcessed && (a.importanceScore ?? 0) >= 65).slice(0, 6);
  const trendingTags = aggregateTags(latestArticles);
  const topCategories = (statsData.categories ?? []).filter((c) => c.count > 0).slice(0, 4).map((c) => c.category);
  const categoryGroups = groupByCategory(latestArticles, topCategories);

  return (
    <>
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <PageContainer className="hero-panel animate-fade-up px-6 py-10 sm:px-10 sm:py-14 lg:py-16">
          <div className="hero-orb -left-20 -top-20 h-56 w-56 bg-[hsl(var(--accent)/0.2)]" aria-hidden="true" />
          <div className="hero-orb -right-16 top-8 h-48 w-48 bg-[hsl(var(--accent-secondary)/0.15)]" aria-hidden="true" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow-badge">{BRAND.name}</span>
              <p className="section-label mt-5">{formatToday()}</p>
              <h1 className="mt-3 font-serif text-[2rem] font-semibold leading-[1.08] sm:text-4xl lg:text-[3.25rem]">
                Don&apos;t just read the news.{" "}
                <span className="text-gradient">Understand what it means.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
                Your personal intelligence desk — curated stories, AI summaries, and a reading guide on every article.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/#briefing"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95"
                >
                  Start briefing
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.8)] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent)/0.4)]"
                >
                  Browse topics
                </Link>
              </div>
              {statsData.lastUpdated ? (
                <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                  Last sync {formatRelativeTime(statsData.lastUpdated)}
                </p>
              ) : null}
            </div>

            <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
              {[
                ["Articles", statsData.totalArticles],
                ["Analyzed", statsData.articlesAnalyzed],
                ["Today", statsData.articlesToday],
                ["Priority", statsData.importantArticles],
              ].map(([label, value]) => (
                <div key={label} className="stat-card">
                  <p className="stat-value">{Number(value).toLocaleString()}</p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="space-y-20 py-12 sm:py-16">
        {!dbConnected ? (
          <div role="alert" className="rounded-lg border border-amber-300/80 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
            <h2 className="font-serif text-lg font-semibold">Database not connected</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Only one <code className="rounded bg-[hsl(var(--muted))] px-1">MONGODB_URI</code> should be active in{" "}
              <code className="rounded bg-[hsl(var(--muted))] px-1">.env.local</code>. For Atlas, use the{" "}
              <code className="rounded bg-[hsl(var(--muted))] px-1">mongodb+srv://</code> string from Atlas → Connect, allow your IP in Network Access, then run{" "}
              <code className="rounded bg-[hsl(var(--muted))] px-1">npm run test:db</code> and restart the dev server.
            </p>
            {process.env.NODE_ENV === "development" && dbError ? (
              <p className="mt-3 rounded-md bg-[hsl(var(--muted))]/50 px-3 py-2 font-mono text-xs text-[hsl(var(--foreground))]">{dbError}</p>
            ) : null}
            <Link href="/admin" className="link-accent mt-4 inline-block text-sm font-medium">Admin setup →</Link>
          </div>
        ) : null}

        {dbConnected && !topArticles.length && !latestArticles.length ? (
          <div role="status" className="card-premium p-8 text-center">
            <h2 className="font-serif text-xl font-semibold">No articles in your library</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Run a sync from Admin to populate your dashboard.</p>
            <Link href="/admin" className="mt-6 inline-flex rounded-md bg-[hsl(var(--foreground))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--background))]">Open Admin</Link>
          </div>
        ) : null}

        {dbConnected && (topArticles.length || latestArticles.length) ? <BriefingSection /> : null}

        {topArticles.length ? <TopStoriesSection articles={topArticles} /> : null}

        <MissedNewsSection />

        {developingStories.length ? (
          <section className="space-y-6">
            <SectionHeader label="Stories" title="Developing stories" description="Ongoing events tracked across multiple articles." href="/stories" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {developingStories.map((story) => (
                <li key={story.id}>
                  <Link href={`/stories/${story.slug}`} prefetch className="card-premium block h-full p-5 transition hover:shadow-elevated">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--accent))]">{story.status}</p>
                    <h3 className="mt-2 font-serif text-lg font-semibold">{story.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">{story.description || `${story.timeline?.length ?? 0} developments tracked`}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section id="latest" className="scroll-mt-24 space-y-8">
          <SectionHeader label="Feed" title="Latest news" description="Recently collected and ranked stories across all sources." />
          {latestArticles.length ? <NewsGrid articles={latestArticles.slice(0, 12)} /> : <EmptyState title="No articles" description="Latest feed is empty." />}
        </section>

        {topCategories.length ? (
          <section className="space-y-12">
            <SectionHeader label="Topics" title="Browse by category" href="/categories" />
            {topCategories.map((category) => {
              const items = categoryGroups.get(category) ?? [];
              if (!items.length) return null;
              const slug = getCategorySlug(category);
              return (
                <div key={category} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                    <h3 className="font-serif text-xl font-semibold">{category}</h3>
                    <Link href={`/categories/${slug}`} prefetch className="link-accent text-sm font-medium">View all →</Link>
                  </div>
                  <NewsGrid articles={items} columns={3} variant="compact" showCategory={false} />
                </div>
              );
            })}
          </section>
        ) : null}

        {aiHighlights.length ? (
          <section className="space-y-8">
            <SectionHeader label="Analysis" title="Intelligence highlights" description="AI-processed stories with strong significance scores." />
            <NewsGrid articles={aiHighlights} columns={3} />
          </section>
        ) : null}

        {trendingTags.length ? (
          <section className="card-premium p-6 sm:p-8">
            <SectionHeader label="Trends" title="Popular tags" />
            <div className="mt-6 flex flex-wrap gap-2">
              {trendingTags.map(({ tag, count }) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} prefetch>
                  <Badge variant="outline" className="cursor-pointer px-3 py-1 normal-case tracking-normal hover:bg-[hsl(var(--muted))]">
                    {tag}
                    <span className="ml-1.5 opacity-60">({count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </PageContainer>
    </>
  );
}