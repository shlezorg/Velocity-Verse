import Image from "next/image";
import Link from "next/link";
import { articleHref, formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/site";
import type { Article } from "@/lib/types";

export function FeaturedArticle({ article: a }: { article: Article }) {
  return (
    <section aria-labelledby="editorial-spotlight" className="relative my-12 rounded-lg border border-line bg-card overflow-hidden shadow-sm">
      <div className="grid lg:grid-cols-12 items-stretch">
        {/* Large Image on Left/Side */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:col-span-7 overflow-hidden bg-surface-elevated">
          <Image
            src={a.featuredImage?.src || "/images/hero.webp"}
            alt={a.featuredImage?.alt || a.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out hover:scale-101"
          />
        </div>

        {/* Article Information on Right */}
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:col-span-5 lg:p-10">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-accent" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
              Editorial Spotlight
            </span>
            <span className="text-line-highlight">•</span>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted">
              {categoryLabel(a.category)}
            </span>
          </div>

          <h2 id="editorial-spotlight" className="mt-3.5 font-display text-2xl font-bold uppercase leading-[1.05] tracking-tight text-ink sm:text-3xl lg:text-4xl">
            <Link href={articleHref(a)} className="hover:text-accent transition-colors">
              {a.title}
            </Link>
          </h2>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-secondary font-normal">
            {a.excerpt}
          </p>

          {/* Author Details with Avatar */}
          <div className="mt-6 flex items-center gap-3.5 border-t border-line/70 pt-4">
            {a.author.avatar && (
              <div className="relative size-9 overflow-hidden rounded-full border border-line shrink-0">
                <Image
                  src={a.author.avatar}
                  alt={a.author.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-ink">{a.author.name}</p>
              <p className="text-[10px] font-mono text-muted">{a.author.role}</p>
            </div>
            <div className="ml-auto text-right text-[11px] font-mono text-muted">
              <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
              <p className="text-accent">{a.readingTime}m read</p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={articleHref(a)}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_15px_rgba(229,9,25,0.3)]"
            >
              <span>Read Full Feature</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
