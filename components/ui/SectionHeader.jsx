import Link from "next/link";

export function SectionHeader({ label, title, description, href, linkText = "View all" }) {
  return (
    <div className="section-divider flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {label ? <p className="section-label">{label}</p> : null}
        <h2 className="section-title mt-1">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} prefetch className="link-accent shrink-0 text-sm font-medium">
          {linkText} →
        </Link>
      ) : null}
    </div>
  );
}

export default SectionHeader;