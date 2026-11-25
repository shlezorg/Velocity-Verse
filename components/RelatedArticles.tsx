import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/lib/types";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-stories-heading" className="mt-16 pt-12 border-t border-line">
      <div className="flex items-center gap-3 mb-8">
        <span className="h-0.5 w-6 bg-accent rounded-full" />
        <h2 id="related-stories-heading" className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
          Related Intelligence & Stories
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((art) => (
          <ArticleCard key={art.id} article={art} />
        ))}
      </div>
    </section>
  );
}
