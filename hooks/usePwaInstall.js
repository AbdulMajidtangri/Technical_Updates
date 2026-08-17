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

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    if (dismissed === "1") return;

    function onBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    }

    function onInstalled() {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (isIos() && !isStandalone()) {
      setShowIosHint(true);
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
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setCanInstall(false);
    setShowIosHint(false);
  }, []);

  return {
    canInstall,
    showIosHint,
    installed,
    install,
    dismiss,
  };
}

export default usePwaInstall;
