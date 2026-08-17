"use client";

import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "inkwell-install-dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isMobile() {
  if (typeof window === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    function onBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
      setShowMobileHint(true);
    }

    function onInstalled() {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      setShowMobileHint(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (isMobile() && !isStandalone()) {
      setShowMobileHint(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);

    if (outcome === "accepted") {
      setInstalled(true);
      setShowMobileHint(false);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setCanInstall(false);
    setShowMobileHint(false);
  }, []);

  const visible = !installed && !dismissed && showMobileHint;

  return {
    canInstall,
    showIosHint: isIos(),
    showAndroidMenuHint: !isIos() && isMobile() && !canInstall,
    installed,
    visible,
    install,
    dismiss,
  };
}

export default usePwaInstall;
