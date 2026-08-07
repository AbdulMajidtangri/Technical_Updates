import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function CategoryLoading() {
  return (
    <PageContainer className="space-y-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </PageContainer>
  );
}