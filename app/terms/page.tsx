import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms of Use | ${site.name}`,
  description: "Terms and conditions governing the access and usage of VELOCITY VERSE digital editorial media.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page max-w-4xl">
        <Breadcrumbs items={[{ label: "Terms of Use" }]} />

        <div className="rounded-xl border border-line bg-card p-7 sm:p-11 mb-10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Legal & Compliance</span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase text-ink">
            Terms of Use
          </h1>
          <p className="mt-2 text-xs text-muted">Last Updated: October 2026</p>
        </div>

        <div className="prose-editorial rounded-xl border border-line bg-card p-7 sm:p-11 space-y-6 shadow-sm">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or reading {site.name}, you agree to abide by these Terms of Use and all applicable laws and regulations. If you do not agree, you are prohibited from using or accessing this site.
          </p>

          <h2>2. Intellectual Property Rights</h2>
          <p>
            All editorial prose, investigative reports, photographic assets, charts, technical diagrams, and branding elements published on {site.name} are the proprietary intellectual property of {site.name} and protected by international copyright laws.
          </p>
          <p>
            You may quote brief excerpts (up to 75 words) with prominent attribution and a direct clickable link to the original article URL. Automated scraping or uncredited reproduction of entire articles is strictly prohibited.
          </p>

          <h2>3. Disclaimers & Limitation of Liability</h2>
          <p>
            The materials on {site.name} are provided on an &apos;as is&apos; basis for general enthusiast entertainment and journalistic information. In no event shall {site.name} be liable for any damages arising out of the use or inability to use the materials.
          </p>
        </div>
      </div>
    </div>
  );
}
