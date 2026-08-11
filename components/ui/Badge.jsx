export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
    brand: "border border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]",
    outline: "border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] text-[hsl(var(--muted-foreground))]",
    success: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
    muted: "bg-[hsl(var(--surface))] text-[hsl(var(--muted-foreground))]",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
