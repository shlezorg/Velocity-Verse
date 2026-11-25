import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Automotive & Editorial Disclaimer | ${site.name}`,
  description: "Important editorial notice regarding track testing, performance claims, and non-commercial status.",
};

export default function DisclaimerPage() {
  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page max-w-4xl">
        <Breadcrumbs items={[{ label: "Disclaimer" }]} />

        <div className="rounded-xl border border-line bg-card p-7 sm:p-11 mb-10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Important Notice</span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase text-ink">
            Automotive & Editorial Disclaimer
          </h1>
          <p className="mt-2 text-xs text-muted">Published for Reader Transparency</p>
        </div>

        <div className="prose-editorial rounded-xl border border-line bg-card p-7 sm:p-11 space-y-6 shadow-sm">
          <div className="rounded-lg border-l-3 border-accent border-y border-r border-line bg-surface-elevated p-5 text-xs sm:text-sm text-secondary">
            <strong className="text-ink">CRITICAL NOTICE:</strong> {site.name} is strictly an editorial digital magazine and automotive journalism platform. <strong className="text-ink">We are NOT a car dealership, car broker, car retail marketplace, or car rental agency.</strong> We do not sell vehicles or arrange commercial vehicle purchases.
          </div>

          <h2>1. Professional Circuit Testing Environment</h2>
          <p>
            All high-speed acceleration tests, cornering evaluations, maximum downforce logging, and lap times featured across {site.name} are conducted by experienced professional test drivers on closed private racing circuits or derestricted sections of track under controlled safety conditions.
          </p>
          <p>
            Never attempt to replicate high-speed maneuvers, lap times, or aggressive driving techniques on public roads. Always obey local traffic laws and posted speed limits.
          </p>

          <h2>2. Specifications & Valuation Accuracy</h2>
          <p>
            While our editorial desk exercises the highest standards of diligence to verify all engine displacements, kilowatt outputs, torque curves, and estimated pricing, manufacturer specifications may change based on vehicle model year, market territory, or production series.
          </p>
          <p>
            Vehicles evaluated as prototypes or pre-production engineering mules are clearly designated in our reports.
          </p>

          <h2>3. Editorial Independence & Affiliate Disclosures</h2>
          <p>
            {site.name} reviews are conducted independently. While certain links on the site may occasionally generate standard affiliate revenue for editorial support, these commercial partnerships never dictate our journalistic evaluations, road test verdicts, or comparison results.
          </p>
        </div>
      </div>
    </div>
  );
}
