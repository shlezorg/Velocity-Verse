"use client";

import { useEffect, useState, useTransition } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { categories } from "@/lib/site";
import type { Article } from "@/lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Load all published articles on client mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter articles based on query, category, and tags
  const filteredArticles = articles.filter((a) => {
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    const matchesTag = selectedTag === "all" || a.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.subtitle?.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesTag && matchesQuery;
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)));

  return (
    <div className="pt-24 pb-20 md:pt-32 min-h-screen">
      <div className="container-page">
        <Breadcrumbs items={[{ label: "Search" }]} />

        {/* Search Header Banner */}
        <div className="rounded-xl border border-line bg-card p-7 sm:p-11 mb-10 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Editorial Database Search
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-ink">
              Search The Archive
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-secondary">
              Find technical reviews, hypercar telemetry, engineering breakdowns, and industry dispatches.
            </p>

            {/* Search Input Box */}
            <div className="relative mt-7">
              <input
                type="text"
                autoFocus
                placeholder="Search by vehicle model, engineering term, or keyword (e.g. Ferrari, Hybrid, Aerodynamics)..."
                value={query}
                onChange={(e) => startTransition(() => setQuery(e.target.value))}
                className="w-full rounded-md border border-line bg-surface px-5 py-3.5 pl-12 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <svg
                viewBox="0 0 24 24"
                className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted fill-none stroke-current stroke-2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M16 16l4.5 4.5" />
              </svg>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Bar: Category Pills and Tag Filters */}
        <div className="mb-10 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Category Filter:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  selectedCategory === "all"
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-surface text-secondary hover:border-line hover:text-ink"
                }`}
              >
                All Categories ({articles.length})
              </button>
              {categories.map((c) => {
                const count = articles.filter((a) => a.category === c.slug).length;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                      selectedCategory === c.slug
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-surface text-secondary hover:border-line hover:text-ink"
                    }`}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {allTags.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Tag Filter:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedTag("all")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                    selectedTag === "all"
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-surface text-muted hover:border-line hover:text-ink"
                  }`}
                >
                  #all
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      selectedTag === tag
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-surface text-muted hover:border-line hover:text-ink"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count & Status */}
        <div className="flex items-center justify-between border-b border-line pb-4 mb-8">
          <p className="text-xs sm:text-sm font-semibold text-ink">
            {loading ? (
              "Querying editorial archive..."
            ) : (
              <>
                Found <span className="text-accent font-bold">{filteredArticles.length}</span>{" "}
                {filteredArticles.length === 1 ? "story" : "stories"}
                {query ? ` matching "${query}"` : ""}
              </>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="rounded-xl border border-line bg-card p-14 text-center">
              <svg
                viewBox="0 0 24 24"
                className="mx-auto size-10 text-muted fill-none stroke-current stroke-1.5 mb-3"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <h2 className="font-display text-xl font-bold uppercase text-ink">
                No stories found
              </h2>
              <p className="mt-1 text-xs text-secondary max-w-sm mx-auto">
                We couldn&apos;t find any stories matching your criteria. Try adjusting your search keywords or resetting the category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                  setSelectedTag("all");
                }}
                className="mt-5 rounded-md border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
