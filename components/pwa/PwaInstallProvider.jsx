"use client";

import { createContext, useContext } from "react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const PwaInstallContext = createContext(null);

export function PwaInstallProvider({ children }) {
  const value = usePwaInstall();
  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstallContext() {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    return {
      canInstall: false,
      showIosHint: false,
      showAndroidMenuHint: false,
      installed: false,
      visible: false,
      install: async () => false,
      dismiss: () => {},
    };
  }
  return ctx;
}

export default PwaInstallProvider;
