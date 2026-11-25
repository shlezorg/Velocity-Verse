import Link from "next/link";
import { ArticleImage } from "./ArticleImage";
import { articleHref, formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/site";
import type { Article } from "@/lib/types";

export function ArticleCard({
  article: a,
  large = false,
  priority = false,
}: {
  article: Article;
  large?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col rounded-lg border border-line bg-card shadow-sm transition-all duration-300 hover:border-line-highlight hover:shadow-card motion-reduce:transform-none overflow-hidden ${
        large ? "md:col-span-2" : ""
      }`}
    >
      {/* Card Image Container */}
      <div
        className={`relative overflow-hidden bg-surface-elevated ${
          large ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[16/10]"
        }`}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transform-none">
          <ArticleImage
            image={a.featuredImage}
            sizes={
              large
                ? "(min-width:1024px) 66vw, 100vw"
                : "(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            }
            priority={priority}
          />
        </div>

        {/* Category Pill Tag with Refined Glass Surface */}
        <div className="absolute left-3.5 top-3.5 z-10">
          <span className="inline-block rounded-xs glass-panel px-2.5 py-1 text-[9.5px] font-mono font-bold uppercase tracking-wider text-accent border border-line/80 shadow-xs">
            {categoryLabel(a.category)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <h3
            className={`font-display font-bold uppercase leading-[1.08] tracking-tight text-ink transition-colors group-hover:text-accent ${
              large ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl"
            }`}
          >
            <Link href={articleHref(a)} className="focus:outline-none after:absolute after:inset-0">
              {a.title}
            </Link>
          </h3>

          <p className="mt-2.5 line-clamp-2 text-xs sm:text-sm leading-relaxed text-secondary font-normal">
            {a.excerpt}
          </p>
        </div>

        {/* Card Footer Metadata */}
        <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] font-mono text-muted">
          <div className="flex items-center gap-1.5">
            <span className="text-secondary">{a.author.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
            <span>•</span>
            <span className="text-accent">{a.readingTime}m read</span>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Accent Indicator */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </article>
  );
}
