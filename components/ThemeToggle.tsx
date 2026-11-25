"use client";

import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`grid size-9 place-items-center rounded-md border border-line bg-surface text-muted ${className}`}
        aria-hidden="true"
      >
        <span className="size-4 opacity-0" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light editorial theme" : "Switch to dark cinematic theme"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative grid size-9 place-items-center rounded-md border border-line bg-surface/80 text-muted transition-all duration-200 hover:border-line hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      {isDark ? (
        // Sun icon (switching to light)
        <svg
          viewBox="0 0 24 24"
          className="size-4.5 fill-none stroke-current stroke-[1.8] transition-transform duration-300 group-hover:rotate-45"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon (switching to dark)
        <svg
          viewBox="0 0 24 24"
          className="size-4.5 fill-none stroke-current stroke-[1.8] transition-transform duration-300 group-hover:-rotate-12"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
