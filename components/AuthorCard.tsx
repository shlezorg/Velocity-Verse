import Image from "next/image";
import type { Author } from "@/lib/types";

export function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-xl border border-line bg-card p-6 md:p-7 shadow-xs">
      {author.avatar && (
        <div className="relative size-16 sm:size-18 shrink-0 overflow-hidden rounded-full border border-line bg-surface-elevated">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            sizes="72px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-ink">
              {author.name}
            </h4>
            <p className="text-xs font-semibold text-accent">{author.role}</p>
          </div>
          {author.twitter && (
            <span className="text-xs text-muted font-mono">{author.twitter}</span>
          )}
        </div>

        {author.bio && (
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-secondary">
            {author.bio}
          </p>
        )}
      </div>
    </div>
  );
}
