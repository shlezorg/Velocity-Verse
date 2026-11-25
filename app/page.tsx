import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryCard } from "@/components/CategoryCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { EditorialGrid } from "@/components/EditorialGrid";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { HeroStory } from "@/components/HeroStory";
import { Newsletter } from "@/components/Newsletter";
import { PopularStories } from "@/components/PopularStories";
import { SectionHeading } from "@/components/SectionHeading";
import { getFeatured, getLatest, getPopular, getTrending } from "@/lib/articles";
import { comparisons } from "@/lib/comparisons";
import { categories } from "@/lib/site";

export default async function HomePage() {
  const [featuredArticles, latest, popular] = await Promise.all([
    getFeatured(4),
    getLatest(8),
    getPopular(5),
  ]);

  const heroArticles = featuredArticles.length > 0 ? featuredArticles : latest.slice(0, 4);
  const primaryHero = heroArticles[0];

  // Secondary editorial highlight for the split spotlight
  const spotlightArticle = latest.find((a) => a.id !== primaryHero?.id) || latest[0];

  // Articles for the magazine-style asymmetric editorial grid
  const editorialGridArticles = latest.filter((a) => a.id !== primaryHero?.id && a.id !== spotlightArticle?.id);

  // Featured head-to-head comparison
  const featuredComparison = comparisons[0];

  return (
    <>
      {/* 1. Hero / Featured Cover Story Carousel with Telemetry Badges */}
      {heroArticles.length > 0 && <HeroStory articles={heroArticles} />}

      <div className="container-page py-14 sm:py-20">
        {/* Discreet Non-Intrusive Ad Banner Slot */}
        <AdSlot slot="top-banner" className="mb-14" />

        {/* 2. Latest Field Dispatches & Ranked Popular Telemetry Sidebar */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Main Column: Latest Dispatches (8 cols) */}
          <section aria-labelledby="latest-stories" className="lg:col-span-8">
            <SectionHeading id="latest-stories" title="Latest Field Reports & Telemetry" href="/news" />
            {latest.length === 0 ? (
              <div className="rounded-lg border border-line bg-card p-12 text-center text-muted">
                <p className="text-base font-semibold text-ink">No stories published yet.</p>
                <p className="text-xs mt-1">Check back soon for new dispatches from our editorial desk.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {latest.slice(0, 4).map((a, i) => (
                  <ArticleCard key={a.id} article={a} large={i === 0} priority={i === 0} />
                ))}
              </div>
            )}
          </section>

          {/* Sticky Sidebar: Most Read Articles with Real Recorded Views (4 cols) */}
          <aside aria-labelledby="popular-ranked" className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div>
              <SectionHeading id="popular-ranked" title="Trending Telemetry & Reads" />
              <PopularStories articles={popular} />
            </div>

            {/* Sidebar Ad Slot */}
            <AdSlot slot="sidebar" />
          </aside>
        </div>

        {/* 3. Head-to-Head Specification Tool: Technical Breakdown */}
        {featuredComparison && (
          <section aria-labelledby="head-to-head" className="mt-16 sm:mt-24 rounded-lg border border-line bg-surface p-6 sm:p-10 shadow-sm glass-card">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-line">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
                    Editorial Showdown
                  </span>
                </div>
                <h2 id="head-to-head" className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-ink">
                  Head-to-Head Technical Matrix
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-secondary font-normal">
                  Side-by-side engineering telemetry comparing hybrid outputs, downforce levels, and transmission architectures.
                </p>
              </div>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent hover:underline underline-offset-4 shrink-0"
              >
                <span>All Comparisons ({comparisons.length})</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ComparisonTable comparison={featuredComparison} />
          </section>
        )}

        {/* 4. Featured Editorial Spotlight (Split side-by-side) */}
        {spotlightArticle && (
          <div className="mt-16 sm:mt-24">
            <FeaturedArticle article={spotlightArticle} />
          </div>
        )}

        {/* 5. Magazine Asymmetric Editorial Grid */}
        {editorialGridArticles.length > 0 && (
          <section aria-labelledby="editorial-desk" className="mt-16 sm:mt-24">
            <SectionHeading id="editorial-desk" title="From The Editorial Desk" href="/supercars" />
            <EditorialGrid articles={editorialGridArticles} />
          </section>
        )}

        {/* Discreet In-Content Banner Slot */}
        <AdSlot slot="between-articles" className="my-16" />

        {/* 6. Explore Visual Category Cards */}
        <section aria-labelledby="explore-categories" className="mt-16 sm:mt-24">
          <div className="mb-8">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-accent" />
              <h2 id="explore-categories" className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Automotive Departments & Bureaus
              </h2>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-secondary font-normal">
              Specialized desks covering every echelon of speed, from silicon-carbide EV inverters to naturally aspirated atmospheric V12s.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard
                key={c.slug}
                slug={c.slug}
                title={c.title}
                blurb={c.blurb}
                image={c.image}
                icon={c.icon}
              />
            ))}
          </div>
        </section>
      </div>

      {/* 7. Newsletter Subscription */}
      <Newsletter />
    </>
  );
}
