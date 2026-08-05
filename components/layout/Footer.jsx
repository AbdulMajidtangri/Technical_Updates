import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold">TechPulse AI</p>
          <p className="mt-1 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
            Personal news intelligence — collect, rank, and explain technology stories with AI.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[hsl(var(--muted-foreground))]" aria-label="Footer">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <Link href="/#latest" className="hover:text-brand-600">Latest</Link>
          <Link href="/categories" className="hover:text-brand-600">Categories</Link>
          <Link href="/saved" className="hover:text-brand-600">Saved</Link>
          <Link href="/search" className="hover:text-brand-600">Search</Link>
          <Link href="/admin" className="hover:text-brand-600">Admin</Link>
        </nav>
      </div>
      <div className="border-t border-[hsl(var(--border))] py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} TechPulse AI
      </div>
    </footer>
  );
}

export default Footer;