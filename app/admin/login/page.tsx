"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Check credentials.");
        return;
      }

      startTransition(() => {
        router.push(from);
        router.refresh();
      });
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    }
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Editorial Branding */}
      <div className="mb-8 text-center">
        <div className="inline-block mb-4">
          <Logo />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span className="telemetry-mono text-[10px] font-semibold tracking-wider text-accent uppercase">
            EDITORIAL CMS // OPS CONSOLE
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-ink">
          Staff Authentication
        </h1>
        <p className="mt-2 text-xs text-secondary max-w-xs mx-auto">
          Restricted access for editors, correspondents, and publication administrators.
        </p>
      </div>

      {/* Login Panel Glass Card */}
      <div className="glass-panel rounded-2xl border border-line bg-card/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-accent/40 bg-accent/10 p-3.5 text-xs font-semibold text-accent flex items-start gap-2.5"
          >
            <svg viewBox="0 0 20 20" className="size-4 shrink-0 fill-current mt-0.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="staff-email"
              className="block telemetry-mono text-[10px] uppercase tracking-wider text-muted mb-1.5 font-bold"
            >
              Editorial Email Address
            </label>
            <input
              id="staff-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@velocityverse.com"
              className="w-full rounded-lg border border-line bg-surface/75 px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="staff-password"
                className="block telemetry-mono text-[10px] uppercase tracking-wider text-muted font-bold"
              >
                Access Key / Passphrase
              </label>
            </div>
            <input
              id="staff-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full rounded-lg border border-line bg-surface/75 px-3.5 py-2.5 font-mono text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-accent py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-accent/40 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          >
            {isPending ? "Verifying Credentials..." : "Access Editorial Console →"}
          </button>
        </form>

        {/* Quick Staff Credentials Info for Demo/Test Use with 1-Click Autofill */}
        <div className="mt-7 border-t border-line/80 pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="telemetry-mono text-[10px] font-bold uppercase tracking-wider text-muted">
              Pre-Configured Staff Roles:
            </span>
            <span className="text-[10px] text-accent/80 font-mono">1-Click Fill</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin@velocityverse.com", "VelocityVercs2026!Admin")}
              className="w-full flex items-center justify-between rounded-md border border-line/70 bg-surface/40 hover:bg-surface hover:border-accent/40 p-2 text-left transition-all group"
            >
              <div>
                <span className="text-[11px] font-bold text-ink group-hover:text-accent">Administrator</span>
                <span className="block telemetry-mono text-[9px] text-muted">Full publishing, database & user rights</span>
              </div>
              <span className="telemetry-mono text-[10px] text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                Auto-fill ↵
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("editor@velocityverse.com", "VelocityVercs2026!Editor")}
              className="w-full flex items-center justify-between rounded-md border border-line/70 bg-surface/40 hover:bg-surface hover:border-accent/40 p-2 text-left transition-all group"
            >
              <div>
                <span className="text-[11px] font-bold text-ink group-hover:text-accent">Chief Editor</span>
                <span className="block telemetry-mono text-[9px] text-muted">Article review, publishing & analytics</span>
              </div>
              <span className="telemetry-mono text-[10px] text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                Auto-fill ↵
              </span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("author@velocityverse.com", "VelocityVercs2026!Author")}
              className="w-full flex items-center justify-between rounded-md border border-line/70 bg-surface/40 hover:bg-surface hover:border-accent/40 p-2 text-left transition-all group"
            >
              <div>
                <span className="text-[11px] font-bold text-ink group-hover:text-accent">Correspondent / Author</span>
                <span className="block telemetry-mono text-[9px] text-muted">Draft creation & editorial submissions</span>
              </div>
              <span className="telemetry-mono text-[10px] text-accent font-semibold group-hover:translate-x-0.5 transition-transform">
                Auto-fill ↵
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="telemetry-mono text-[11px] text-muted hover:text-ink transition-colors"
        >
          ← Return to VELOCITY VERSE Public Edition
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="text-center text-xs text-muted font-mono">
            Loading authentication console...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

