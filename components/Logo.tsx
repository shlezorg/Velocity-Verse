import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name}, home`}
      className="group inline-flex items-center gap-2.5 select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
      <span className="relative block h-12 w-[76px] sm:h-14 sm:w-[88px] overflow-hidden rounded-sm bg-black border border-white/10">
        <Image src="/brand/velocity-verse-emblem.webp" alt="Velocity Verse red and silver speedometer emblem"
          fill sizes="88px" className="object-contain" priority />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="flex items-baseline gap-1 font-display font-bold uppercase tracking-tight text-lg sm:text-xl">
            <span className="text-ink">VELOCITY</span>
            <span className="text-accent">VERSE</span>
          </span>
          <span className="mt-1.5 text-[8px] font-mono uppercase tracking-[0.11em] text-muted">
            Where speed meets the future
          </span>
        </span>
      )}
    </Link>
  );
}
