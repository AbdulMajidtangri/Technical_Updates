export function ImportanceIndicator({ score = 0, showLabel = true, className = '' }) {
  const value = Number(score) || 0;
  const level = value >= 80 ? 'high' : value >= 60 ? 'medium' : 'low';
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-400',
  };
  const labels = { high: 'High impact', medium: 'Notable', low: 'Standard' };

  return (
    <div className={`flex items-center gap-2 ${className}`} title={`Importance ${value}`}>
      <div className="flex h-2 w-16 overflow-hidden rounded-full bg-[hsl(var(--muted))]" aria-hidden="true">
        <div className={`h-full ${colors[level]}`} style={{ width: `${Math.min(100, Math.max(8, value))}%` }} />
      </div>
      {showLabel ? (
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{value}</span>
      ) : null}
      <span className="sr-only">{labels[level]}</span>
    </div>
  );
}

export default ImportanceIndicator;