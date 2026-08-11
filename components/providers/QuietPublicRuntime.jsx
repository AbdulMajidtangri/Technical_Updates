"use client";

import { useEffect } from "react";

/**
 * Keeps the public-site browser console clean:
 * - swallows unhandled fetch/JSON promise rejections from background features
 * - does not affect /admin (owner debugging)
 */
export function QuietPublicRuntime() {
  useEffect(() => {
    function onUnhandledRejection(event) {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");

      if (
        reason instanceof TypeError ||
        /fetch|network|Load failed|Failed to fetch|JSON|Unexpected token|aborted/i.test(message)
      ) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);

  return null;
}

export default QuietPublicRuntime;
