import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${site.name}`,
  description: "Learn how VELOCITY VERSE protects your data, respects reader privacy, and handles cookies.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page max-w-4xl">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

        <div className="rounded-xl border border-line bg-card p-7 sm:p-11 mb-10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Legal & Compliance</span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase text-ink">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-muted">Effective Date: October 1, 2026</p>
        </div>

        <div className="prose-editorial rounded-xl border border-line bg-card p-7 sm:p-11 space-y-6 shadow-sm">
          <h2>1. Introduction</h2>
          <p>
            {site.name} (&quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;) values your privacy. This policy outlines how information is collected, used, and safeguarded when you access our digital magazine, read articles, or subscribe to our newsletter.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            <strong>Information You Voluntarily Provide:</strong> When subscribing to the {site.name} Dispatch newsletter or contacting our editorial bureau, you provide your email address and name. We never sell, rent, or trade reader email addresses to third parties.
          </p>
          <p>
            <strong>Technical Log Data:</strong> We automatically record standard server log information, including your IP address, browser type, referring pages, and device operating system, solely to maintain site speed, uptime, and security.
          </p>

          <h2>3. Cookies & Analytics</h2>
          <p>
            We utilize essential session cookies to remember your display preferences and ensure seamless navigation across categories. Anonymous aggregated analytics help us determine which vehicle reviews and engineering topics resonate most with our readership.
          </p>

          <h2>4. Data Retention & Security</h2>
          <p>
            We implement modern encryption standards across all data transmissions. You may request the deletion of your newsletter subscription or personal data at any time by contacting our data officer at privacy@velocityverse.com.
          </p>
        </div>
      </div>
    </div>
  );
}
