import Link from "next/link";
import { BRAND } from "@/lib/config/brand.js";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#latest", label: "Latest" },
  { href: "/categories", label: "Categories" },
  { href: "/saved", label: "Saved & offline" },
  { href: "/search", label: "Search" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-1">
          <p className="font-serif text-lg font-semibold">
            {BRAND.shortName}
            <span className="text-[hsl(var(--accent))]"> Atlas</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {BRAND.tagline} Your personal desk for technology, business, and world news — ranked, explained, and ready to read.
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
            {BRAND.description}
          </p>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border))] py-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
