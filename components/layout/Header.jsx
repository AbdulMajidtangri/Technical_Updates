"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { ReadingSettingsButton } from "@/components/accessibility/ReadingSettingsButton";
import { NavLink } from "@/components/navigation/NavLink";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#briefing", label: "Briefing" },
  { href: "/categories", label: "Browse" },
  { href: "/saved", label: "Saved" },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" prefetch onClick={closeMenu} className="group transition-opacity hover:opacity-90">
          <BrandLogo size="md" />
        </Link>

        <nav className="nav-rail" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} pill />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ReadingSettingsButton />
          <Link
            href="/search"
            prefetch
            className="group flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--muted)/0.45)] px-3 py-2 text-[13px] font-medium text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--accent)/0.35)] hover:text-[hsl(var(--foreground))] max-sm:p-2.5"
            aria-label="Search"
          >
            <Search className="h-[17px] w-[17px]" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.95)] px-4 py-3 backdrop-blur-xl md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} onNavigate={closeMenu} pill className="block w-full rounded-xl px-3 py-2.5" />
            ))}
            <NavLink href="/knowledge" label="My learning" onNavigate={closeMenu} pill className="block w-full rounded-xl px-3 py-2.5" />
            <NavLink href="/stories" label="Stories" onNavigate={closeMenu} pill className="block w-full rounded-xl px-3 py-2.5" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export default Header;
