"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES = ["/", "/search", "/categories", "/saved", "/knowledge", "/stories"];

export function PrefetchRoutes() {
  const router = useRouter();

  useEffect(() => {
    for (const route of ROUTES) {
      router.prefetch(route);
    }
  }, [router]);

  return null;
}

export default PrefetchRoutes;
