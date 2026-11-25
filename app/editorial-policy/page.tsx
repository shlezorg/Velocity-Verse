import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Editorial Policy & Standards | ${site.name}`,
  description: "Learn about the rigorous research, telemetry verification, and journalistic standards governing all VELOCITY VERSE reporting.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page max-w-4xl">
        <Breadcrumbs items={[{ label: "Editorial Policy" }]} />

        <div className="rounded-xl border border-line bg-card p-7 sm:p-11 mb-10 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
            Ethical Governance
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-ink">
            Editorial Policy & Verification Standards
          </h1>
          <p className="mt-3.5 text-xs sm:text-sm text-secondary leading-relaxed">
            At {site.name}, automotive journalism is held to strict technical rigor. We believe readers deserve uncompromising clarity, zero fabricated specifications, and absolute transparency regarding how vehicles are tested and evaluated.
          </p>
        </div>

        <div className="prose-editorial rounded-xl border border-line bg-card p-7 sm:p-11 space-y-6 shadow-sm">
          <h2>1. Data Verification & Telemetry Integrity</h2>
          <p>
            Whenever a vehicle&apos;s performance statistics (such as 0–100 km/h acceleration, 100–0 km/h braking distances, lateral G-forces, or lap times) are published, they must be derived from verified on-track satellite GPS logging (e.g. Racelogic VBOX systems) or explicitly credited as manufacturer-claimed figures.
          </p>
          <p>
            We strictly prohibit fabricating, guessing, or exaggerating vehicle horsepower, torque, top speed, or battery range.
          </p>

          <h2>2. The Multi-Tier Editorial Review Workflow</h2>
          <p>
            Every dispatch published on {site.name} follows a mandatory six-stage editorial progression:
          </p>
          <ol>
            <li><strong>Primary Research & Telemetry Logging:</strong> Conducted on-site by certified track drivers and technical correspondents.</li>
            <li><strong>Drafting & Technical Annotation:</strong> Authors cite engineering documentation, patent filings, or direct interviews with chief engineers.</li>
            <li><strong>Cross-Verification & Fact-Checking:</strong> A dedicated technical editor independently validates all chassis codes, displacement figures, and aerodynamic claims.</li>
            <li><strong>Copy Editing:</strong> Reviewing structure, linguistic clarity, and tone according to our publication stylebook.</li>
            <li><strong>Visual & Media Proofing:</strong> Ensuring all photography maintains editorial integrity with accurate captions and proper licensing.</li>
            <li><strong>Publication & Permanent Version Logging:</strong> Tracking any subsequent technical updates with visible timestamps.</li>
          </ol>

          <h2>3. Separation of Editorial & Commercial Operations</h2>
          <p>
            {site.name} enforces strict boundaries between its editorial coverage and advertising/commercial relationships. Advertising placements (such as banner slots or sponsored content) are visibly labeled and never influence our test driver verdicts, comparison winners, or review scores.
          </p>
          <p>
            Vehicle manufacturers never receive pre-publication copy approval for reviews or feature stories.
          </p>

          <h2>4. AI & Computational Tool Disclosure</h2>
          <p>
            While our newsroom may utilize computational tools for grammar auditing, data formatting, and telemetry chart generation, every article is researched, written, and verified by named human automotive professionals. We do not operate synthetic content mills.
          </p>

          <h2>5. Corrections & Transparency Policy</h2>
          <p>
            When errors of fact occur, {site.name} promptly issues corrections. Updates that alter the factual substance of a story are accompanied by an editor&apos;s note detailing what was changed and when.
          </p>
        </div>
      </div>
    </div>
  );
}
