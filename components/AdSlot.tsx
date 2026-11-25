type Slot = "top-banner" | "in-content" | "sidebar" | "between-articles" | "footer";
const size: Record<Slot, string> = {
  "top-banner": "min-h-[90px]", "in-content": "min-h-[250px]", sidebar: "min-h-[250px]", "between-articles": "min-h-[250px]", footer: "min-h-[90px]",
};

// Renders nothing until NEXT_PUBLIC_ADS_ENABLED=true, so no empty boxes ship by default.
// When enabled it reserves space (no layout shift); mount the ad unit inside the <aside>.
export function AdSlot({ slot, className = "" }: { slot: Slot; className?: string }) {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "true") return null;
  return <aside aria-label="Advertisement" data-ad-slot={slot} className={`${size[slot]} ${className}`} />;
}
