import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#latest", label: "Latest" },
  { href: "/categories", label: "Categories" },
  { href: "/saved", label: "Saved" },
  { href: "/search", label: "Search" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-1">
          <p className="font-serif text-lg font-semibold">TechPulse AI</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            A professional news intelligence dashboard for technology, business, and global developments.
          </p>
        </div>
        <div>
          <p className="section-label mb-4">Navigate</p>
          <ul className="space-y-2.5 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="section-label mb-4">About</p>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Built for calm, professional news reading with AI summaries and a personal reading guide.
          </p>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border))] py-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} TechPulse AI. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;