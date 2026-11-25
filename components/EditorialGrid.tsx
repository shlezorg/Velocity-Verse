import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "./ArticleCard";
import { articleHref, formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/site";
import type { Article } from "@/lib/types";

export function EditorialGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  const lead = articles[0];
  const stacked = articles.slice(1, 3);
  const bottomCards = articles.slice(3, 6);

  return (
    <div className="space-y-6">
      {/* Top Asymmetric Tier: 1 Lead Large Article + 2 Vertically Stacked Stories */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Lead Story: 8 Columns */}
        {lead && (
          <div className="lg:col-span-8">
            <article className="group relative flex h-full flex-col justify-end overflow-hidden rounded-lg border border-line bg-card shadow-sm min-h-[420px] lg:min-h-[480px]">
              <Image
                src={lead.featuredImage?.src || "/images/hero.webp"}
                alt={lead.featuredImage?.alt || lead.title}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-101"
              />
              {/* High-Contrast Gradient Overlay for text legibility */}
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-transparent" />

              <div className="relative z-10 p-6 sm:p-9 text-white">
                <span className="inline-block rounded-xs bg-accent px-2.5 py-1 text-[9.5px] font-mono font-bold uppercase tracking-wider text-white shadow-xs">
                  {categoryLabel(lead.category)}
                </span>

                <h3 className="mt-3.5 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl group-hover:text-accent transition-colors">
                  <Link href={articleHref(lead)} className="after:absolute after:inset-0">
                    {lead.title}
                  </Link>
                </h3>

                <p className="mt-2.5 line-clamp-2 max-w-xl text-xs sm:text-sm text-zinc-300">
                  {lead.excerpt}
                </p>

                <div className="mt-5 flex items-center gap-3.5 text-xs font-mono text-zinc-300">
                  <span>By {lead.author.name}</span>
                  <span>•</span>
                  <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time>
                  <span>•</span>
                  <span className="text-accent">{lead.readingTime}m read</span>
                </div>
              </div>

              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
              />
            </article>
          </div>
        )}

        {/* Stacked Stories: 4 Columns */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          {stacked.map((art) => (
            <article
              key={art.id}
              className="group relative flex flex-1 flex-col justify-between rounded-lg border border-line bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-line-highlight hover:shadow-card"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                  {categoryLabel(art.category)}
                </span>
                <h4 className="mt-2 font-display text-base sm:text-lg font-bold uppercase leading-snug tracking-tight text-ink group-hover:text-accent transition-colors">
                  <Link href={articleHref(art)} className="after:absolute after:inset-0">
                    {art.title}
                  </Link>
                </h4>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-secondary font-normal">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] font-mono text-muted">
                <span>{art.author.name}</span>
                <time dateTime={art.publishedAt}>{formatDate(art.publishedAt)}</time>
              </div>

              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>
      </div>

      {/* Bottom Tier: 3 Equal Magazine Cards */}
      {bottomCards.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bottomCards.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      )}
    </div>
  );
}
