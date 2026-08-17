"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent — install UI still works where supported without SW
    });
  }, []);

  return null;
}

export default PwaRegister;
