import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Newsletter } from "@/components/Newsletter";
import { PopularStories } from "@/components/PopularStories";
import { SectionHeading } from "@/components/SectionHeading";
import { getArticlesByCategory, getPopular, articleHref, formatDate } from "@/lib/articles";
import { comparisons } from "@/lib/comparisons";
import { getCategory, site, categories } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = getCategory(slug as CategorySlug);
  if (!cat) return { title: "Category Not Found | " + site.name };

  return {
    title: `${cat.title} | ${site.name}`,
    description: cat.blurb,
    alternates: {
      canonical: `${site.url}/${cat.slug}`,
    },
    openGraph: {
      title: `${cat.title} | ${site.name}`,
      description: cat.blurb,
      url: `${site.url}/${cat.slug}`,
      type: "website",
      siteName: site.name,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const categoryInfo = getCategory(slug as CategorySlug);

  if (!categoryInfo) {
    notFound();
  }

  const [articles, popular] = await Promise.all([
    getArticlesByCategory(slug as CategorySlug),
    getPopular(5),
  ]);

  const leadStory = articles[0];
  const remainingStories = articles.slice(1);
  const isCompareCategory = slug === "compare";

  return (
    <>
      <div className="pt-24 pb-20 md:pt-32">
        <div className="container-page">
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: categoryInfo.title }]} />

          {/* Category Header Banner with Distinct Visual Layout */}
          <div className="relative overflow-hidden rounded-xl border border-line bg-card p-7 sm:p-11 mb-12 shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1/2 -z-10 opacity-15 [mask-image:linear-gradient(to_left,black,transparent)]">
              <Image
                src={categoryInfo.image}
                alt={categoryInfo.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="max-w-2xl">
              <span className="inline-block rounded-md bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Editorial Desk
              </span>
              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-ink">
                {categoryInfo.title}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-secondary leading-relaxed">
                {categoryInfo.blurb}
              </p>
              <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-muted">
                <span>{articles.length} In-Depth Stories Published</span>
                <span>•</span>
                <span>Updated Daily</span>
              </div>
            </div>
          </div>

          {/* If on Compare category, render the structured head-to-head comparison tool directly */}
          {isCompareCategory && comparisons.length > 0 && (
            <div className="mb-16 rounded-xl border border-line bg-card p-6 sm:p-9 shadow-sm">
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                  Featured Head-to-Head Specification Tool
                </span>
                <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold uppercase text-ink">
                  {comparisons[0].title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-secondary">
                  Structured vehicle telemetry breakdown comparing weight distribution, kilowatt outputs, and aerodynamic downforce figures.
                </p>
              </div>

              <ComparisonTable comparison={comparisons[0]} />
            </div>
          )}

          {/* Featured Lead Story for this Category */}
          {leadStory && (
            <div className="mb-14">
              <article className="group relative grid lg:grid-cols-12 rounded-xl border border-line bg-card overflow-hidden shadow-sm hover:border-line transition-all">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 overflow-hidden bg-surface-elevated">
                  <Image
                    src={leadStory.featuredImage?.src || "/images/hero.webp"}
                    alt={leadStory.featuredImage?.alt || leadStory.title}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent lg:hidden" />
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-9 lg:col-span-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                    Category Spotlight
                  </span>
                  <h2 className="mt-2.5 font-display text-xl sm:text-3xl font-extrabold uppercase text-ink leading-tight">
                    <Link href={articleHref(leadStory)} className="after:absolute after:inset-0 hover:text-accent transition-colors">
                      {leadStory.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-secondary line-clamp-3">
                    {leadStory.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-muted">
                    <span>By {leadStory.author.name}</span>
                    <time dateTime={leadStory.publishedAt}>{formatDate(leadStory.publishedAt)}</time>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Main Grid: Articles + Sidebar */}
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Articles Column (8 cols) */}
            <div className="lg:col-span-8">
              <SectionHeading id="category-articles" title={`All ${categoryInfo.label} Dispatches`} />

              {remainingStories.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {remainingStories.map((art) => (
                    <ArticleCard key={art.id} article={art} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-card p-10 text-center text-muted shadow-sm">
                  <p className="text-base text-ink font-display uppercase font-bold">More coverage arriving</p>
                  <p className="mt-1 text-xs">Our correspondents are preparing subsequent field reports for this category.</p>
                </div>
              )}

              {/* In-category banner ad */}
              <AdSlot slot="between-articles" className="mt-12" />
            </div>

            {/* Sticky Sidebar: Most Popular Across Velocity Verse (4 cols) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
              <div>
                <SectionHeading id="category-popular" title="Trending Across Velocity Verse" />
                <PopularStories articles={popular} />
              </div>

              <AdSlot slot="sidebar" />
            </aside>
          </div>
        </div>
      </div>

      <Newsletter />
    </>
  );
}
