"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to join newsletter. Please try again.");
      } else {
        setSubmitted(true);
        setMessage(data.message || "Thank you for subscribing to VELOCITY VERSE.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="my-16 border-y border-line bg-surface py-16 md:my-20 md:py-20"
    >
      <div className="container-page text-center">
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-line bg-surface-elevated px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent mb-4">
            <span className="size-1.5 rounded-full bg-accent" />
            Weekly Editorial Intelligence
          </div>

          <h2
            id="newsletter-heading"
            className="font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl"
          >
            Stay Ahead of the Latest Automotive News
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
            Essential engineering breakdowns, track reviews, and exclusive supercar scoops delivered directly to your inbox every Thursday.
          </p>

          {submitted ? (
            <div className="mt-7 inline-flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-emerald-600 dark:text-emerald-400">
              <svg viewBox="0 0 24 24" className="size-4.5 fill-none stroke-current stroke-2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-medium text-xs sm:text-sm">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-line bg-surface-elevated px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-sm disabled:opacity-50"
              >
                {loading ? "Joining..." : "Get the Stories"}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-xs text-rose-500">{error}</p>
          )}

          <p className="mt-4 text-[11px] text-muted">
            Strictly editorial. No promotional spam. Unsubscribe anytime with one click.
          </p>
        </div>
      </div>
    </section>
  );
}
