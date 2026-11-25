"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { categories, site } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-line bg-surface pt-16 pb-12 text-sm text-muted">
      <div className="container-page">
        {/* Top Grid: Brand Statement & Navigation Columns */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 pb-14 border-b border-line">
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Logo />
            <p className="font-display text-base font-bold uppercase tracking-wider text-ink">
              {site.tagline}
            </p>
            <p className="max-w-md text-xs leading-relaxed text-secondary sm:text-sm">
              An international digital automotive publication dedicated to world-class reporting on hypercars, electric performance, racing engineering, telemetry track tests, and buying guides.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-secondary">
                <span className="size-1.5 rounded-full bg-accent" />
                Independent Editorial Standards
              </span>
            </div>
          </div>

          {/* Categories (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-4">
              Editorial Sections
            </h3>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs sm:text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className="text-secondary transition-colors hover:text-ink hover:underline underline-offset-4 decoration-accent"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal Links (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-ink mb-4">
              Publication & Trust
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-secondary transition-colors hover:text-ink">
                  About VELOCITY VERSE
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-secondary transition-colors hover:text-ink">
                  Contact & Press Inquiries
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="text-secondary transition-colors hover:text-ink">
                  Editorial Policy & Fact-Checking
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-secondary transition-colors hover:text-ink">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-secondary transition-colors hover:text-ink">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-secondary transition-colors hover:text-ink">
                  Automotive Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-secondary transition-colors hover:text-ink">
                  XML Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Standards */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row">
          <p>© {currentYear} {site.name}. All rights reserved.</p>
          <p className="text-muted">
            Engineered for pure speed, technical clarity, and editorial integrity.
          </p>
        </div>
      </div>
    </footer>
  );
}
