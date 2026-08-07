"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function NavLink({ href, label, onNavigate, className = "" }) {
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

  return (
    <Link
      href={href}
      prefetch
      onClick={handleClick}
      className={`relative px-3 py-2 text-[13px] font-medium tracking-wide transition-colors ${className} ${
        active
          ? "text-[hsl(var(--foreground))]"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      }`}
    >
      {label}
      {active && !hash ? (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[hsl(var(--accent))]" aria-hidden="true" />
      ) : null}
    </Link>
  );
}

export default NavLink;