"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "techpulse-reading-settings";

const DEFAULTS = {
  textScale: 100,
  highContrast: false,
};

const SCALE_TO_FONT = {
  100: "",
  125: "125%",
  150: "150%",
  200: "200%",
};

const ReadingSettingsContext = createContext(undefined);

function applyReadingSettings(settings) {
  const root = document.documentElement;
  root.dataset.textScale = String(settings.textScale);
  root.style.fontSize = SCALE_TO_FONT[settings.textScale] ?? "";
  root.classList.toggle("high-contrast", settings.highContrast);
}

export function ReadingSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const next = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
      setSettings(next);
      applyReadingSettings(next);
    } catch {
      setSettings(DEFAULTS);
      applyReadingSettings(DEFAULTS);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyReadingSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, mounted]);

  function setTextScale(textScale) {
    setSettings((prev) => ({ ...prev, textScale }));
  }

  function toggleHighContrast() {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }

  return (
    <ReadingSettingsContext.Provider value={{ settings, setTextScale, toggleHighContrast, mounted }}>
      {children}
    </ReadingSettingsContext.Provider>
  );
}

export function useReadingSettings() {
  const ctx = useContext(ReadingSettingsContext);
  if (!ctx) {
    return { settings: DEFAULTS, setTextScale: () => {}, toggleHighContrast: () => {}, mounted: false };
  }
  return ctx;
}

export default ReadingSettingsProvider;
