import Image from "next/image";
import type { ComparisonItem } from "@/lib/types";

export function ComparisonTable({ comparison }: { comparison: ComparisonItem }) {
  const { vehicleA, vehicleB, verdict, summary } = comparison;

  const rows = [
    { label: "Engine / Powertrain", valA: vehicleA.engine, valB: vehicleB.engine, isMono: false },
    { label: "Total System Power", valA: vehicleA.power, valB: vehicleB.power, highlight: true, isMono: true },
    { label: "Peak Torque", valA: vehicleA.torque, valB: vehicleB.torque, isMono: true },
    { label: "0–100 km/h (Acceleration)", valA: vehicleA.acceleration, valB: vehicleB.acceleration, highlight: true, isMono: true },
    { label: "Top Speed", valA: vehicleA.topSpeed, valB: vehicleB.topSpeed, isMono: true },
    { label: "Dry Curb Weight", valA: vehicleA.weight, valB: vehicleB.weight, isMono: true },
    { label: "Drive Configuration", valA: vehicleA.driveType, valB: vehicleB.driveType, isMono: false },
    { label: "Transmission", valA: vehicleA.transmission, valB: vehicleB.transmission, isMono: false },
    { label: "Base Pricing (Est.)", valA: vehicleA.price, valB: vehicleB.price, isMono: true },
    { label: "Defining Dynamic Feature", valA: vehicleA.keyFeature, valB: vehicleB.keyFeature, isMono: false },
  ];

  return (
    <div className="space-y-8 my-8">
      {/* Side-by-Side Visual Headers */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Vehicle A Card */}
        <div className="rounded-lg border border-line bg-card p-4 sm:p-6 text-center shadow-sm">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-surface-elevated mb-4 border border-line">
            <Image
              src={vehicleA.image}
              alt={vehicleA.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
            {vehicleA.brand}
          </span>
          <h3 className="font-display text-base sm:text-xl font-bold uppercase text-ink mt-1">
            {vehicleA.model}
          </h3>
          <p className="text-[11px] font-mono text-muted mt-0.5">{vehicleA.year} Edition</p>
        </div>

        {/* Vehicle B Card */}
        <div className="rounded-lg border border-line bg-card p-4 sm:p-6 text-center shadow-sm">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-surface-elevated mb-4 border border-line">
            <Image
              src={vehicleB.image}
              alt={vehicleB.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
            {vehicleB.brand}
          </span>
          <h3 className="font-display text-base sm:text-xl font-bold uppercase text-ink mt-1">
            {vehicleB.model}
          </h3>
          <p className="text-[11px] font-mono text-muted mt-0.5">{vehicleB.year} Edition</p>
        </div>
      </div>

      {/* Structured Comparison Specifications Matrix */}
      <div className="overflow-x-auto rounded-lg border border-line bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-elevated text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
              <th className="p-3.5 sm:p-4.5 w-1/3">Engineering Metric</th>
              <th className="p-3.5 sm:p-4.5 w-1/3 text-ink border-l border-line">{vehicleA.model}</th>
              <th className="p-3.5 sm:p-4.5 w-1/3 text-ink border-l border-line">{vehicleB.model}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-xs sm:text-sm">
            {rows.map((r, i) => (
              <tr key={i} className={`hover:bg-surface-elevated/40 transition-colors ${r.highlight ? "bg-accent-subtle/50" : ""}`}>
                <td className="p-3.5 sm:p-4.5 font-semibold text-secondary text-xs">
                  {r.label}
                </td>
                <td className={`p-3.5 sm:p-4.5 border-l border-line ${r.isMono ? "telemetry-mono" : ""} ${r.highlight ? "font-bold text-accent" : "text-ink"}`}>
                  {r.valA}
                </td>
                <td className={`p-3.5 sm:p-4.5 border-l border-line ${r.isMono ? "telemetry-mono" : ""} ${r.highlight ? "font-bold text-accent" : "text-ink"}`}>
                  {r.valB}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editorial Verdict Box */}
      <div className="rounded-lg border-l-4 border-accent border-y border-r border-line bg-surface-elevated p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
            VELOCITY VERSE Road & Track Verdict
          </span>
        </div>
        <h4 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink">
          {summary}
        </h4>
        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-secondary">
          {verdict}
        </p>
      </div>
    </div>
  );
}
