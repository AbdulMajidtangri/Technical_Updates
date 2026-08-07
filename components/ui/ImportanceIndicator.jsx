export function ImportanceIndicator({ score = 0, showLabel = true, className = "", inverted = false }) {
  const value = Number(score) || 0;
  const level = value >= 80 ? "high" : value >= 60 ? "medium" : "low";
  const colors = {
    high: "bg-rose-500",
    medium: "bg-amber-500",
    low: "bg-slate-400",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} title={`Importance ${value}`}>
      <div className={`flex h-1 w-12 overflow-hidden rounded-full ${inverted ? "bg-white/20" : "bg-[hsl(var(--muted))]"}`} aria-hidden="true">
        <div className={`h-full ${colors[level]}`} style={{ width: `${Math.min(100, Math.max(8, value))}%` }} />
      </div>
      {showLabel ? (
        <span className={`text-[11px] font-medium tabular-nums ${inverted ? "text-white/90" : "text-[hsl(var(--muted-foreground))]"}`}>{value}</span>
      ) : null}
    </div>
  );
}

export default ImportanceIndicator;