"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { BRAND } from "@/lib/config/brand.js";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { usePwaInstallContext } from "@/components/pwa/PwaInstallProvider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#latest", label: "Latest" },
  { href: "/categories", label: "Categories" },
  { href: "/saved", label: "Saved & offline" },
  { href: "/search", label: "Search" },
];

function InstallAppLink() {
  const { canInstall, visible, install } = usePwaInstallContext();

  if (!visible && !canInstall) return null;

  return (
    <li>
      <button
        type="button"
        onClick={() => install()}
        className="inline-flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Install app
      </button>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="footer-glow mt-auto bg-[hsl(var(--surface)/0.6)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-1">
          <BrandLogo size="sm" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {BRAND.tagline} A calm, designed reading experience with AI clarity on every story.
          </p>
        </div>
        <div>
          <p className="section-label mb-4">Navigate</p>
          <ul className="space-y-3 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
                  {link.label}
                </Link>
              </li>
            ))}
            <InstallAppLink />
          </ul>
        </div>
        <div>
          <p className="section-label mb-4">About</p>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {BRAND.description}
          </p>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border)/0.6)] py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} {BRAND.name}. Crafted for thoughtful readers.
      </div>
    </footer>
  );
}

export default Footer;
