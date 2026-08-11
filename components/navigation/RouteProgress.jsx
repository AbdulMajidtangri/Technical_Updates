"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setActive(true);
    setWidth(18);

    const t1 = setTimeout(() => setWidth(62), 120);
    const t2 = setTimeout(() => setWidth(88), 280);

    timerRef.current = setTimeout(() => {
      setWidth(100);
      setTimeout(() => {
        setActive(false);
        setWidth(0);
      }, 180);
    }, 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!active && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[300] h-0.5 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-secondary))] transition-[width] duration-200 ease-out shadow-glow"
      style={{ width: `${width}%` }}
      aria-hidden="true"
    />
  );
}

export default RouteProgress;
