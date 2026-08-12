"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function NavLink({ href, label, onNavigate, className = "", pill = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [path, hash] = href.includes("#") ? href.split("#") : [href, null];
  const basePath = path || "/";

  const active =
    href === "/"
      ? pathname === "/"
      : hash
        ? pathname === "/"
        : pathname === basePath || pathname.startsWith(`${basePath}/`);

  function handleClick(e) {
    if (hash) {
      e.preventDefault();
      onNavigate?.();
      if (pathname === "/") {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `/#${hash}`);
      } else {
        router.push(`/#${hash}`);
      }
      return;
    }
    onNavigate?.();
  }

  const pillActive = pill && active && !hash;
  const base = pill
    ? `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 ${className}`
    : `relative px-3 py-2 text-[13px] font-medium tracking-wide transition-colors ${className}`;

  const colors = pillActive
    ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm ring-1 ring-[hsl(var(--border)/0.8)]"
    : pill
      ? "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--card)/0.6)] hover:text-[hsl(var(--foreground))]"
      : active
        ? "text-[hsl(var(--foreground))]"
        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]";

  return (
    <Link href={href} prefetch onClick={handleClick} className={`${base} ${colors}`}>
      {label}
      {!pill && active && !hash ? (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[hsl(var(--foreground))]" aria-hidden="true" />
      ) : null}
    </Link>
  );
}

export default NavLink;
