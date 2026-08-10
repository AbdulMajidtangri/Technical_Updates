"use client";

import { useEffect, useRef, useState } from "react";
import { Type } from "lucide-react";
import { useReadingSettings } from "@/components/providers/ReadingSettingsProvider";

const SCALES = [
  { value: 100, label: "Normal" },
  { value: 125, label: "Large" },
  { value: 150, label: "Extra large" },
  { value: 200, label: "Maximum" },
];

export function ReadingSettingsButton() {
  const { settings, setTextScale, toggleHighContrast, mounted } = useReadingSettings();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
        aria-label="Reading settings"
        aria-expanded={open}
      >
        <Type className="h-[18px] w-[18px]" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Text size
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SCALES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTextScale(value)}
                className={`rounded-md px-2 py-2 text-left text-sm transition ${
                  settings.textScale === value
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                    : "bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))]"
                }`}
                aria-pressed={settings.textScale === value}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleHighContrast}
            className={`mt-3 w-full rounded-md px-3 py-2 text-sm font-medium transition ${
              settings.highContrast
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            }`}
            aria-pressed={settings.highContrast}
          >
            {settings.highContrast ? "High contrast on" : "High contrast off"}
          </button>

          <p className="mt-3 text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            Applies to the whole page, including articles.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default ReadingSettingsButton;
