"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "techpulse-admin-unlocked";
const SECRET_KEY = "techpulse-cron-secret";

export function useAdminSecret() {
  const [secret, setSecretState] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedSecret = sessionStorage.getItem(SECRET_KEY) ?? "";
    const savedUnlock = sessionStorage.getItem(STORAGE_KEY) === "true";
    setSecretState(savedSecret);
    setUnlocked(savedUnlock && !!savedSecret);
    setHydrated(true);
  }, []);

  const saveSecret = useCallback((value) => {
    const trimmed = value.trim();
    setSecretState(trimmed);
    if (trimmed) {
      sessionStorage.setItem(SECRET_KEY, trimmed);
    } else {
      sessionStorage.removeItem(SECRET_KEY);
    }
  }, []);

  const unlock = useCallback(
    (value) => {
      const trimmed = (value ?? secret).trim();
      if (!trimmed) return false;
      saveSecret(trimmed);
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
      return true;
    },
    [saveSecret, secret],
  );

  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  }, []);

  return {
    secret,
    unlocked,
    hydrated,
    saveSecret,
    unlock,
    lock,
  };
}

export default useAdminSecret;
