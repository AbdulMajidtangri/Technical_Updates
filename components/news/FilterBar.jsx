'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/Button';

const IMPACTS = ['High', 'Medium', 'Low'];

export function FilterBar({ categories = [], sources = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) params.delete(key);
      else params.set(key, value);
      params.delete('page');
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const clearAll = () => {
    startTransition(() => router.push('?', { scroll: false }));
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          Category
          <select
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
            value={searchParams.get('category') ?? ''}
            onChange={(e) => update('category', e.target.value)}
            disabled={pending}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          Min importance
          <select
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
            value={searchParams.get('importance') ?? ''}
            onChange={(e) => update('importance', e.target.value)}
            disabled={pending}
          >
            <option value="">Any</option>
            <option value="90">90+</option>
            <option value="75">75+</option>
            <option value="60">60+</option>
            <option value="40">40+</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          Developer impact
          <select
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
            value={searchParams.get('developerImpact') ?? ''}
            onChange={(e) => update('developerImpact', e.target.value)}
            disabled={pending}
          >
            <option value="">Any</option>
            {IMPACTS.map((impact) => (
              <option key={impact} value={impact}>
                {impact}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          Source
          <select
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
            value={searchParams.get('source') ?? ''}
            onChange={(e) => update('source', e.target.value)}
            disabled={pending}
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          From date
          <input
            type="date"
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
            value={searchParams.get('dateFrom') ?? ''}
            onChange={(e) => update('dateFrom', e.target.value)}
            disabled={pending}
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={clearAll} disabled={pending}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

export default FilterBar;