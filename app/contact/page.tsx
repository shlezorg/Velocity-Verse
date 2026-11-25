"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page">
        <Breadcrumbs items={[{ label: "Contact" }]} />

        <div className="rounded-xl border border-line bg-card p-7 sm:p-12 mb-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Communications & Inquiries
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-ink">
              Connect With The Desk
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-secondary leading-relaxed">
              Whether you are an automotive manufacturer press officer, an engineering source, or an enthusiast reader with a scoop, we welcome your correspondence.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-line bg-card p-6 space-y-2.5 shadow-xs">
              <h3 className="font-display text-lg font-bold uppercase text-ink">
                Editorial Headquarters
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                {site.name} Media Group<br />
                International Automotive Bureau<br />
                Global Editorial Correspondents: Modena, Nürburg, Silverstone, Tokyo
              </p>
            </div>

            <div className="rounded-xl border border-line bg-card p-6 space-y-2.5 shadow-xs">
              <h3 className="font-display text-lg font-bold uppercase text-ink">
                Direct Channels
              </h3>
              <div className="space-y-2 text-xs">
                <p>
                  <span className="text-muted">General Editorial:</span>{" "}
                  <a href={`mailto:${site.contactEmail}`} className="text-ink hover:text-accent font-mono transition-colors">
                    {site.contactEmail}
                  </a>
                </p>
                <p>
                  <span className="text-muted">Press & Fleet:</span>{" "}
                  <span className="text-ink font-mono">press@velocityverse.com</span>
                </p>
                <p>
                  <span className="text-muted">Confidential Tips:</span>{" "}
                  <span className="text-ink font-mono">tips@velocityverse.com</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface-elevated p-6 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1">
                Fact-Checking Protocol
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                For corrections or verification requests regarding previously published test telemetry or technical specifications, please contact our Managing Editor directly with documentation citations.
              </p>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-line bg-card p-7 sm:p-9 shadow-sm">
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink mb-5">
              Send An Editorial Dispatch
            </h3>

            {submitted ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-7 text-center">
                <div className="size-11 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="font-display text-xl font-bold uppercase text-ink">
                  Message Dispatched
                </h4>
                <p className="mt-1.5 text-xs text-secondary">
                  Thank you for reaching out. Our editorial desk reviews all incoming communications during European market hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 rounded-md border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@domain.com"
                      className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                    Subject / Topic Area
                  </label>
                  <select className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-xs text-ink font-semibold focus:border-accent focus:outline-none">
                    <option>Editorial Story Pitch / Lead</option>
                    <option>OEM Press Fleet & Launch Inquiry</option>
                    <option>Fact-Checking or Data Clarification</option>
                    <option>Syndication / Commercial Licensing</option>
                    <option>General Reader Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                    Message Content
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide detailed information, vehicle references, or embargo dates..."
                    className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-accent px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {loading ? "Transmitting..." : "Submit Dispatch"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
