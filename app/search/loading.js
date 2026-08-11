import { PageContainer } from "@/components/layout/PageContainer";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <PageContainer className="space-y-8 py-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
      <div className="h-12 max-w-2xl animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
