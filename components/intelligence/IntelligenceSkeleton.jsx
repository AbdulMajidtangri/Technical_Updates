export function IntelligenceSkeleton({ message = "Processing..." }) {
  return (
    <div className="space-y-3 py-2" role="status" aria-live="polite">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-[hsl(var(--muted))]" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-[hsl(var(--muted))]" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-[hsl(var(--muted))]" />
      </div>
    </div>
  );
}

export default IntelligenceSkeleton;
