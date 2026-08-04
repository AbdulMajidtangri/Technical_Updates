import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <PageContainer>
      <div className="space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}