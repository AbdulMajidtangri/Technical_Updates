import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CategoriesLoading() {
  return (
    <PageContainer>
      <Skeleton className="mb-4 h-10 w-48" />
      <Skeleton className="mb-8 h-6 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </PageContainer>
  );
}