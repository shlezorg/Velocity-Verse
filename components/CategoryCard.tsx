import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  slug: string;
  title: string;
  blurb: string;
  image?: string;
  icon?: string;
}

export function CategoryCard({ slug, title, blurb, image, icon }: { slug: string; title: string; blurb: string; image?: string; icon?: string }) {
  const defaultImage = image || "/images/hero.webp";

  const renderIcon = (name?: string) => {
    switch (name) {
      case "bolt":
      case "supercars":
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-accent fill-none stroke-current stroke-2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      case "zap":
      case "electric":
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-cyan-500 fill-none stroke-current stroke-2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        );
      case "gauge":
      case "reviews":
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-accent fill-none stroke-current stroke-2">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a8 8 0 10-14.8 0" />
            <path d="M12 12l3-3" />
          </svg>
        );
      case "cpu":
      case "technology":
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-accent fill-none stroke-current stroke-2">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
          </svg>
        );
      case "scale":
      case "compare":
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-accent fill-none stroke-current stroke-2">
            <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
          </svg>
        );
      case "newspaper":
      case "news":
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-accent fill-none stroke-current stroke-2">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2H4zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
          </svg>
        );
      case "book":
      case "guides":
      default:
        return (
          <svg viewBox="0 0 24 24" className="size-5 text-accent fill-none stroke-current stroke-2">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
        );
    }
  };

  return (
    <Link
      href={`/${slug}`}
      className="group relative flex min-h-[250px] flex-col justify-end overflow-hidden rounded-lg border border-line bg-card p-6 shadow-sm transition-all duration-300 hover:border-line-highlight hover:shadow-card"
    >
      {/* Background Image with subtle zoom */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={defaultImage}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
        />
        {/* Editorial Gradient Layer for high text contrast in both themes */}
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/85 to-bg/40 transition-colors group-hover:from-bg/95" />
      </div>

      {/* Top Icon Pill */}
      <div className="absolute top-5 left-5 grid size-10 place-items-center rounded-sm glass-panel border border-line/80 shadow-xs transition-transform duration-300 group-hover:scale-105">
        {renderIcon(icon || slug)}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-1.5 line-clamp-2 max-w-sm text-xs leading-relaxed text-secondary font-normal">
          {blurb}
        </p>

        <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-accent transition-all group-hover:translate-x-1">
          <span>Explore Department</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>

      {/* Bottom Accent line */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
      />
    </Link>
  );
}
