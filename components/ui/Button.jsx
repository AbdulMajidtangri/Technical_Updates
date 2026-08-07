export function Button({ children, variant = "primary", size = "md", className = "", type = "button", disabled = false, ...props }) {
  const variants = {
    primary: "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 focus-visible:outline-[hsl(var(--foreground))]",
    secondary: "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
    ghost: "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
    accent: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
    icon: "p-2",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;