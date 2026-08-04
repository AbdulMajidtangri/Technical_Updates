export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
    brand: 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
    outline: 'border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))]',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;