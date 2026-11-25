"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { nav, categories } from "@/lib/site";
import type { SessionUser } from "@/lib/auth";

const icon = "size-4.5 fill-none stroke-current stroke-[1.75]";

export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffUser, setStaffUser] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Suppress public header when inside admin editorial console
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check if an authorized staff member is signed in
  useEffect(() => {
    if (isAdminRoute) return;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setStaffUser(data.user);
        } else {
          setStaffUser(null);
        }
      })
      .catch(() => setStaffUser(null));
  }, [pathname, isAdminRoute]);

  // Keyboard shortcut: Cmd/Ctrl + K to open search modal, Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, searchOpen]);

  if (isAdminRoute) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solid || open
            ? "glass-header shadow-sm"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <span className="hidden sm:block">
              <Logo />
            </span>
            <span className="sm:hidden">
              <Logo compact />
            </span>
          </div>

          {/* Desktop Editorial Navigation */}
          <nav aria-label="Primary Editorial Sections" className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {nav.map((n) => {
                const isActive = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className={`relative py-1.5 text-xs font-bold tracking-wider uppercase transition-colors hover:text-ink ${
                        isActive ? "text-ink" : "text-muted hover:text-ink"
                      }`}
                    >
                      {n.label}
                      {isActive && (
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(229,9,25,0.6)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Action Controls: Search, Theme Toggle, Subscribe, Mobile Menu */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button with Cmd+K hint */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search articles (Cmd+K)"
              className="group flex items-center gap-2 h-9 px-3 rounded-md border border-line bg-surface/80 text-muted transition-all hover:border-line-highlight hover:text-ink hover:bg-surface"
            >
              <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16 16l4.5 4.5" />
              </svg>
              <span className="hidden md:inline-block text-xs text-muted group-hover:text-ink">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-line bg-surface-elevated px-1.5 py-0.5 text-[9px] font-mono text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Precision Theme Switcher */}
            <ThemeToggle />

            {/* Staff Editorial Console Link */}
            {staffUser && (
              <Link
                href="/admin"
                className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent-subtle px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-white"
              >
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                <span>Console ({staffUser.role})</span>
              </Link>
            )}

            {/* Editorial Subscribe CTA */}
            <Link
              href="#newsletter"
              className="hidden md:inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_15px_rgba(229,9,25,0.3)]"
            >
              Get Stories
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
              className="grid size-9 place-items-center rounded-md border border-line text-ink transition-colors hover:bg-surface xl:hidden"
            >
              <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
                <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Instant Search Modal Overlay */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search articles"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-line bg-surface p-6 shadow-2xl glass-panel animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <svg viewBox="0 0 24 24" className="size-5 text-accent stroke-[2] fill-none stroke-current">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16 16l4.5 4.5" />
                </svg>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search supercars, lap tests, telemetry, technology..."
                  className="w-full bg-transparent text-base sm:text-lg text-ink placeholder:text-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded border border-line px-2 py-0.5 text-xs text-muted hover:text-ink"
                >
                  ESC
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Quick Tags:</span>
                {["Ferrari", "Hypercar", "Hybrid", "Nürburgring", "Track Test", "EV", "Lamborghini"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(`/search?tag=${encodeURIComponent(tag)}`);
                    }}
                    className="rounded-md border border-line bg-surface-secondary px-2.5 py-1 text-[11px] text-secondary hover:text-accent hover:border-accent transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col justify-between overflow-y-auto glass-panel p-6 md:top-20 xl:hidden animate-in fade-in slide-in-from-top-4 duration-200 border-b border-line"
        >
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-3 w-full rounded-md border border-line bg-surface-elevated px-4 py-3 text-sm text-muted hover:border-accent hover:text-ink transition-colors"
              >
                <svg viewBox="0 0 24 24" className={icon}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16 16l4.5 4.5" />
                </svg>
                Search Velocity Verse archive...
              </button>
            </div>

            <nav aria-label="Mobile Navigation">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Sections</p>
              <ul className="divide-y divide-line">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-display text-xl font-bold uppercase tracking-wide text-ink transition-colors hover:text-accent"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Browse Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 4).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-line bg-surface-elevated p-3 text-xs font-semibold text-muted hover:text-ink hover:border-line transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-line mt-6 flex flex-col gap-3">
            {staffUser && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent-subtle py-2.5 text-xs font-bold uppercase tracking-wider text-accent"
              >
                Open Editorial Console ({staffUser.role})
              </Link>
            )}
            <Link
              href="#newsletter"
              onClick={() => setOpen(false)}
              className="block rounded-md bg-accent py-3 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-accent-hover transition-colors"
            >
              Get Latest Stories
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
