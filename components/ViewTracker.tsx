"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ articleId }: { articleId: string }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Only track once per component lifecycle
    if (trackedRef.current) return;
    trackedRef.current = true;

    // Do not track if in preview mode or visibility is hidden
    if (typeof window === "undefined") return;
    if (window.location.search.includes("preview=true")) return;

    // Small delay to ensure legitimate human reading and avoid prefetch / quick bounce
    const timer = setTimeout(() => {
      try {
        const payload = JSON.stringify({
          articleId,
          referrer: document.referrer || "",
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/views", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Silently catch tracking errors
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [articleId]);

  return null;
}
