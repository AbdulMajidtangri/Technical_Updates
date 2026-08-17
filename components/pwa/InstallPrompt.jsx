"use client";

import { Download, MoreVertical, Share, X } from "lucide-react";
import { usePwaInstallContext } from "@/components/pwa/PwaInstallProvider";
import { BRAND } from "@/lib/config/brand.js";
import { Button } from "@/components/ui/Button";

export function InstallPrompt() {
  const { canInstall, showIosHint, showAndroidMenuHint, visible, install, dismiss } = usePwaInstallContext();

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={`Install ${BRAND.name}`}
      className="fixed bottom-4 left-4 right-4 z-[150] mx-auto max-w-lg rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-elevated sm:left-auto sm:right-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--foreground))] text-sm font-bold text-[hsl(var(--background))]">
          {BRAND.monogram}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-serif text-base font-semibold">Install {BRAND.shortName}</p>
          {canInstall ? (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Add {BRAND.name} to your home screen for quick access, like an app.
            </p>
          ) : showIosHint ? (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              On iPhone/iPad: tap <Share className="mx-0.5 inline h-3.5 w-3.5" aria-hidden="true" /> Share, then{" "}
              <strong className="font-medium text-[hsl(var(--foreground))]">Add to Home Screen</strong>.
            </p>
          ) : showAndroidMenuHint ? (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Tap <MoreVertical className="mx-0.5 inline h-3.5 w-3.5" aria-hidden="true" /> menu in Chrome, then{" "}
              <strong className="font-medium text-[hsl(var(--foreground))]">Install app</strong> or{" "}
              <strong className="font-medium text-[hsl(var(--foreground))]">Add to Home screen</strong>.
            </p>
          ) : (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Install this site from your browser menu for app-like access.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {canInstall ? (
              <Button type="button" variant="primary" size="sm" onClick={() => install()}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Install
              </Button>
            ) : null}
            <Button type="button" variant="secondary" size="sm" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
