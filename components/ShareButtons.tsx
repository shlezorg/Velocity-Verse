"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1">Share:</span>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="grid size-8.5 place-items-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-line hover:text-ink hover:bg-surface-elevated"
      >
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="grid size-8.5 place-items-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-blue-500 hover:text-blue-500 hover:bg-surface-elevated"
      >
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="grid size-8.5 place-items-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-emerald-500 hover:text-emerald-500 hover:bg-surface-elevated"
      >
        <svg viewBox="0 0 24 24" className="size-3.5 fill-none stroke-current stroke-2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link to article"
        className="relative grid size-8.5 place-items-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent hover:bg-surface-elevated"
      >
        <svg viewBox="0 0 24 24" className="size-3.5 fill-none stroke-current stroke-2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-in fade-in">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
}
