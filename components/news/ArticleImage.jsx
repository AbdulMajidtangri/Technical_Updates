'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Newspaper } from 'lucide-react';

export function ArticleImage({ src, alt, className = '', priority = false, sizes = '(max-width: 768px) 100vw, 33vw' }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-brand-900 ${className}`}
        aria-hidden={!alt}
      >
        <Newspaper className="h-10 w-10 text-brand-500/70" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || ''}
      fill
      className={`object-cover ${className}`}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

export default ArticleImage;