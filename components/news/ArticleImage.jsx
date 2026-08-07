"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";

function normalizeImageUrl(src) {
  if (!src) return "";
  try {
    const url = new URL(src);
    if (url.protocol === "http:") { url.protocol = "https:"; return url.toString(); }
    return src;
  } catch { return src; }
}

export function ArticleImage({ src, alt, className = "", priority = false }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = normalizeImageUrl(src);
  const showFallback = !imageSrc || failed;

  if (showFallback) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-[hsl(var(--surface))] ${className}`} aria-hidden={!alt}>
        <Newspaper className="h-8 w-8 text-[hsl(var(--muted-foreground))]/40" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || ""}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

export default ArticleImage;