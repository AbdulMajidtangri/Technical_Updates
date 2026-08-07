export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
    brand: "bg-[hsl(var(--surface))] text-[hsl(var(--accent))] ring-1 ring-[hsl(var(--border))]",
    outline: "border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))]",
    success: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
    muted: "bg-[hsl(var(--surface))] text-[hsl(var(--muted-foreground))]",
  };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;