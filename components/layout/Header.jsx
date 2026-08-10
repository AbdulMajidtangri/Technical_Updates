"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" prefetch onClick={closeMenu} className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--foreground))] text-xs font-bold tracking-wider text-[hsl(var(--background))]">
            TP
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">TechPulse</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <ReadingSettingsButton />
          <Link
            href="/search"
            prefetch
            className="rounded-md p-2.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
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
        <nav className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} onNavigate={closeMenu} className="block w-full rounded-md px-3 py-2.5" />
            ))}
            <NavLink href="/knowledge" label="My learning" onNavigate={closeMenu} className="block w-full rounded-md px-3 py-2.5" />
            <NavLink href="/stories" label="Stories" onNavigate={closeMenu} className="block w-full rounded-md px-3 py-2.5" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export default Header;
