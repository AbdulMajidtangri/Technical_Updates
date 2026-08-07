const TRUST_STYLES = {
  CONFIRMED: {
    label: "Confirmed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  REPORTED: {
    label: "Reported",
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-800 dark:text-blue-300",
  },
  AI_ANALYSIS: {
    label: "AI analysis",
    dot: "bg-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-800 dark:text-violet-300",
  },
  SCENARIO: {
    label: "Scenario",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-800 dark:text-amber-300",
  },
  UNKNOWN: {
    label: "Unknown",
    dot: "bg-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    text: "text-slate-700 dark:text-slate-300",
  },
};

export function TrustBadge({ level = "AI_ANALYSIS", className = "" }) {
  const style = TRUST_STYLES[level] ?? TRUST_STYLES.AI_ANALYSIS;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}

export function TrustNotice({ children, level = "AI_ANALYSIS" }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
      <TrustBadge level={level} />
      <p className="flex-1 leading-relaxed">{children}</p>
    </div>
  );
}

export default TrustBadge;
