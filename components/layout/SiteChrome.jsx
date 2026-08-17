"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchProvider } from "@/components/search/SearchProvider";
import { RouteProgress } from "@/components/navigation/RouteProgress";
import { PrefetchRoutes } from "@/components/navigation/PrefetchRoutes";
import { QuietPublicRuntime } from "@/components/providers/QuietPublicRuntime";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

export function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return children;
  }

  return (
    <PwaInstallProvider>
      <SearchProvider>
        <PwaRegister />
        <QuietPublicRuntime />
        <RouteProgress />
        <PrefetchRoutes />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <InstallPrompt />
      </SearchProvider>
    </PwaInstallProvider>
  );
}

export default SiteChrome;
