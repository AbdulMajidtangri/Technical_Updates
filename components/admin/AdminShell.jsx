"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  LayoutDashboard,
  Lock,
  Newspaper,
  Shield,
} from "lucide-react";
import { useAdminSecret } from "@/hooks/useAdminSecret";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AdminGate } from "./AdminGate";
import { AdminGate } from "./AdminGate";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/news", label: "News pipeline", icon: Newspaper },
  { href: "/admin/intelligence", label: "Intelligence", icon: Brain },
];

export function AdminShell({ children, serverAuthenticated = false }) {
  const pathname = usePathname();
  const { unlocked, hydrated, lock } = useAdminSecret();

  const authenticated = serverAuthenticated || unlocked;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading control center...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminGate />;
  }

  return (
    <div className="min-h-screen bg-[hsl(260_18%_5%)] text-[hsl(38_22%_94%)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[hsl(260_16%_7%)] lg:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <BrandLogo size="sm" variant="light" />
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/50">Control Center</p>
          </div>

          <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 p-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              View public site
            </Link>
            <button
              type="button"
              onClick={lock}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"
            >
              <Lock className="h-4 w-4" />
              Lock control center
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-[hsl(222_47%_6%)] px-4 py-4 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Shield className="h-3.5 w-3.5" />
              Private operations — not linked from the public site
            </div>
            <div className="flex gap-2 lg:hidden">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-2 py-1 text-xs ${
                    pathname === href || pathname.startsWith(`${href}/`)
                      ? "bg-white/10 text-white"
                      : "text-white/60"
                  }`}
                >
                  {label.split(" ")[0]}
                </Link>
              ))}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AdminShell;
