import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";
import { authors } from "@/lib/articles";

export const metadata: Metadata = {
  title: `About ${site.name} | The Automotive Intelligence Platform`,
  description: "Learn about VELOCITY VERSE, our editorial standards, our test drivers, and our mission to report where speed meets the future.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page">
        <Breadcrumbs items={[{ label: "About" }]} />

        <div className="rounded-xl border border-line bg-card p-7 sm:p-12 mb-12 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Our Heritage & Vision
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-ink">
              Where Speed Meets The Future
            </h1>
            <p className="mt-3.5 text-sm sm:text-base text-secondary leading-relaxed">
              Founded in 2026, {site.name} was established with a singular editorial conviction: that the automotive world is undergoing its most radical transformation since the invention of the assembly line, and that enthusiasts deserve journalism equal to the engineering brilliance of the machines themselves.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid gap-6 sm:grid-cols-3 mb-16">
          <div className="rounded-xl border border-line bg-card p-6 shadow-xs">
            <span className="font-mono text-xl font-bold text-accent">01</span>
            <h3 className="font-display text-xl font-bold uppercase text-ink mt-2.5">
              Telemetry Over Hype
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
              We do not accept manufacturer press releases at face value. Our reviews are verified using high-precision VBOX satellite telemetry, optical tire pyrometers, and verified corner-weight scales.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card p-6 shadow-xs">
            <span className="font-mono text-xl font-bold text-accent">02</span>
            <h3 className="font-display text-xl font-bold uppercase text-ink mt-2.5">
              Independent Verdicts
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
              Our editorial desk maintains absolute independence from automakers and advertisers. A car earns its praise through chassis dynamics, steering honesty, and powertrain execution.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card p-6 shadow-xs">
            <span className="font-mono text-xl font-bold text-accent">03</span>
            <h3 className="font-display text-xl font-bold uppercase text-ink mt-2.5">
              Engineering Depth
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
              From silicon carbide inverters to synthetic e-fuel combustion chemistry, we explain the foundational physics behind modern performance cars for discerning international readers.
            </p>
          </div>
        </div>

        {/* Editorial Team */}
        <section className="rounded-xl border border-line bg-card p-7 sm:p-10 mb-16 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Editorial Roster
            </span>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold uppercase text-ink">
              The Drivers & Technical Minds
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {Object.values(authors).map((author) => (
              <div key={author.id} className="rounded-lg border border-line bg-surface p-5 flex flex-col justify-between">
                <div>
                  <div className="relative size-16 overflow-hidden rounded-full border border-line mb-3.5 bg-surface-elevated">
                    <Image
                      src={author.avatar || "/images/author-avatar.jpg"}
                      alt={author.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold uppercase text-ink">
                    {author.name}
                  </h3>
                  <p className="text-xs font-semibold text-accent mt-0.5">{author.role}</p>
                  <p className="text-xs text-secondary mt-2.5 leading-relaxed">{author.bio}</p>
                </div>
                {author.twitter && (
                  <p className="mt-4 pt-3 border-t border-line/60 font-mono text-[11px] text-muted">
                    {author.twitter}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Mission CTA */}
        <div className="rounded-xl border border-line bg-surface p-8 sm:p-10 text-center shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink">
            Have a story lead or vehicle tip?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-secondary max-w-md mx-auto">
            Our editorial desk welcomes confidential testing notes, spy photography, and technical engineering briefings.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-md bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent-hover transition-colors"
            >
              Contact The Editorial Desk
            </Link>
            <Link
              href="/editorial-policy"
              className="rounded-md border border-line bg-surface-elevated px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-ink transition-colors"
            >
              Read Editorial Standards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
