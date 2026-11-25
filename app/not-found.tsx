import Link from "next/link";
import { categories } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 min-h-[85vh] flex items-center justify-center">
      <div className="container-page max-w-xl text-center">
        <div className="glass-panel inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-4 py-1.5 mb-6 backdrop-blur-md">
          <span className="size-2 rounded-full bg-accent animate-ping" />
          <span className="telemetry-mono text-[11px] font-semibold tracking-wider text-accent uppercase">
            TELEMETRY SIGNAL LOST // ERROR 404
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-ink leading-none">
          Route Off-Track
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-secondary max-w-md mx-auto leading-relaxed">
          The dispatch, road test telemetry, or engineering dossier you requested does not exist at this coordinate or has been archived.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/25 hover:bg-accent-hover hover:shadow-accent/40 transition-all active:scale-[0.98]"
          >
            Return to Editorial Edition
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-line bg-surface/80 px-6 py-3 text-xs font-bold uppercase tracking-wider text-ink hover:border-line hover:bg-surface transition-all"
          >
            Search Publication Archive
          </Link>
        </div>

        <div className="mt-14 pt-8 border-t border-line/70">
          <p className="telemetry-mono text-[10px] uppercase font-bold tracking-wider text-muted mb-3.5">
            EXPLORE ACTIVE EDITORIAL BUREAUS
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="rounded-md border border-line bg-surface/50 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-ink hover:border-accent/40 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

