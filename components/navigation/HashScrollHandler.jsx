'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;
    const scroll = () => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    scroll();
    const t = setTimeout(scroll, 150);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}

export default HashScrollHandler;