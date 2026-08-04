import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SkeletonCard } from '@/components/ui/Skeleton';
import SearchPageContent from './SearchPageContent';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </PageContainer>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}