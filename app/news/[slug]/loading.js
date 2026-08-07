import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function ArticleLoading() {
  return (
    <PageContainer className="max-w-4xl space-y-8 pb-16">
      <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <SkeletonCard />
    </PageContainer>
  );
}