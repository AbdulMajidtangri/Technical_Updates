'use client';

import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStored(JSON.parse(item));
      }
    } catch {
      // ignore read errors
    }
    setHydrated(true);
  }, [key]);

  const setValue = useCallback(
    (value) => {
      setStored((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore write errors
        }
        return next;
      });
    },
    [key],
  );

  return [stored, setValue, hydrated];
}

export default useLocalStorage;