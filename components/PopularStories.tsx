import Image from "next/image";
import Link from "next/link";
import { articleHref, formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/site";
import type { Article } from "@/lib/types";

export function PopularStories({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <ol className="divide-y divide-line rounded-lg border border-line bg-card shadow-sm overflow-hidden">
      {articles.map((a, i) => (
        <li key={a.id} className="group relative p-4 transition-colors hover:bg-surface-elevated/70">
          <div className="flex items-center gap-3.5">
            {/* Rank Number (01, 02...) with automotive speedometer styling */}
            <span
              className={`font-mono text-xl font-bold tracking-tight shrink-0 w-7 ${
                i === 0 ? "text-accent" : i === 1 ? "text-accent/80" : "text-muted"
              }`}
            >
              0{i + 1}
            </span>

            {/* Thumbnail Image */}
            <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-surface-elevated border border-line">
              <Image
                src={a.featuredImage?.src || "/images/hero.webp"}
                alt={a.featuredImage?.alt || a.title}
                fill
                sizes="56px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Headline and Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted">
                <span className="text-accent font-bold">{categoryLabel(a.category)}</span>
                {a.views > 0 ? (
                  <span className="text-secondary font-mono">{a.views.toLocaleString()} views</span>
                ) : (
                  <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                )}
              </div>

              <h4 className="mt-1 font-display text-sm sm:text-base font-bold uppercase leading-snug tracking-tight text-ink transition-colors group-hover:text-accent line-clamp-2">
                <Link href={articleHref(a)} className="focus:outline-none after:absolute after:inset-0">
                  {a.title}
                </Link>
              </h4>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
