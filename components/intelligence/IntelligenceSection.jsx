"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function IntelligenceSection({ id, label, title, summary, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="card-premium overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-[hsl(var(--surface))]/50 sm:p-6"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <div className="min-w-0">
          <p className="section-label">{label}</p>
          <h2 id={`${id}-heading`} className="mt-1 font-serif text-lg font-semibold sm:text-xl">
            {title}
          </h2>
          {summary && !open ? (
            <p className="mt-1 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">{summary}</p>
          ) : null}
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div id={`${id}-panel`} className="border-t border-[hsl(var(--border))] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default IntelligenceSection;
