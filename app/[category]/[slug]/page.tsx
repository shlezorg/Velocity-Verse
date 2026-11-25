import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { AuthorCard } from "@/components/AuthorCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Newsletter } from "@/components/Newsletter";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedArticles } from "@/components/RelatedArticles";
import { ShareButtons } from "@/components/ShareButtons";
import { ArticleGallery } from "@/components/ArticleGallery";
import { ViewTracker } from "@/components/ViewTracker";
import { getArticleBySlug, getRelatedArticles, formatDate } from "@/lib/articles";
import { getComparisonBySlug } from "@/lib/comparisons";
import { categoryLabel, site } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticleBySlug(category, slug);
  if (!article) return { title: "Article Not Found | " + site.name };

  const pageUrl = `${site.url}/${article.category}/${article.slug}`;
  const ogImg = article.ogImage || article.featuredImage?.src || "/og-default.jpg";

  return {
    title: `${article.title} | ${site.name}`,
    description: article.excerpt || article.subtitle,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      url: pageUrl,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 675,
          alt: article.featuredImage?.alt || article.title,
        },
      ],
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImg],
      creator: article.author.twitter || "@velocityverse",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const article = await getArticleBySlug(category, slug);

  if (!article) {
    notFound();
  }

  const [related, comparison] = await Promise.all([
    getRelatedArticles(article, 3),
    article.category === "compare" ? getComparisonBySlug(article.slug) : Promise.resolve(undefined),
  ]);

  const articleUrl = `${site.url}/${article.category}/${article.slug}`;

  // Schema.org Article Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.featuredImage?.src ? `${site.url}${article.featuredImage.src}` : `${site.url}/og-default.jpg`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [
      {
        "@type": "Person",
        name: article.author.name,
        jobTitle: article.author.role,
        url: `${site.url}/authors/${article.author.slug}`,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/brand/mark.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  return (
    <>
      {/* Sticky Reading Progress Indicator */}
      <ReadingProgress />

      {/* Real view tracking recorder */}
      <ViewTracker articleId={article.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pt-24 pb-20 md:pt-32">
        <div className="container-page">
          {/* Breadcrumbs Navigation */}
          <Breadcrumbs
            items={[
              { label: categoryLabel(article.category), href: `/${article.category}` },
              { label: article.title },
            ]}
          />

          {/* Article Header */}
          <header className="mx-auto max-w-4xl text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/${article.category}`}
                className="rounded-xs bg-accent px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover shadow-xs"
              >
                {categoryLabel(article.category)}
              </Link>
              {article.trending && (
                <span className="rounded-xs border border-accent/40 bg-accent-subtle px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                  Trending Dispatch
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold uppercase leading-[1.02] tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="mt-4 text-base leading-relaxed text-secondary sm:text-lg lg:text-xl font-normal">
                {article.subtitle}
              </p>
            )}

            {/* Author Byline & Timestamps */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4 text-xs font-mono text-muted">
              <div className="flex items-center gap-3">
                {article.author.avatar && (
                  <div className="relative size-10 overflow-hidden rounded-full border border-line bg-surface-elevated shrink-0">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-bold text-ink text-xs sm:text-sm">{article.author.name}</p>
                  <p className="text-[10px] text-accent font-semibold">{article.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-muted">Published: </span>
                  <time dateTime={article.publishedAt} className="text-secondary font-medium">
                    {formatDate(article.publishedAt)}
                  </time>
                </div>
                <span>•</span>
                <div>
                  <span className="text-muted">Reading time: </span>
                  <span className="text-accent font-medium">{article.readingTime} min</span>
                </div>
              </div>
            </div>
          </header>

          {/* Published multi-photo gallery, or original cinematic cover for older posts */}
          {(article.gallery?.length ?? 0) > 0 ? (
            <ArticleGallery images={article.gallery!} title={article.title} />
          ) : article.featuredImage && (
            <div className="my-10 mx-auto max-w-5xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-surface-elevated shadow-sm">
                <Image
                  src={article.featuredImage.src}
                  alt={article.featuredImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 1100px, 100vw"
                  className="object-cover"
                />
              </div>
              {article.featuredImage.caption && (
                <div className="mt-2.5 flex items-center justify-between text-xs text-muted">
                  <p className="italic">{article.featuredImage.caption}</p>
                  {article.featuredImage.credit && (
                    <span className="text-[11px] font-mono text-muted">
                      Photo: {article.featuredImage.credit}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Editorial Content Layout with Sticky Share Bar */}
          <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Desktop Sticky Share Column (2 cols) */}
            <aside className="hidden lg:block lg:col-span-2">
              <div className="sticky top-28 space-y-6 border-l border-line pl-4">
                <ShareButtons url={articleUrl} title={article.title} />

                <div className="pt-6 border-t border-line text-xs space-y-2">
                  <p className="font-bold uppercase tracking-wider text-muted text-[10px]">Filed Under</p>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/search?tag=${encodeURIComponent(t)}`}
                        className="rounded-md bg-surface-elevated px-2 py-1 text-[11px] text-secondary hover:text-ink hover:bg-card border border-line transition-colors"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Editorial Text Column (8 cols, max width ~740px for comfortable reading) */}
            <div className="lg:col-span-8 lg:col-start-3">
              {/* Mobile Share Bar */}
              <div className="lg:hidden mb-8 p-3.5 rounded-lg border border-line bg-card flex items-center justify-between">
                <ShareButtons url={articleUrl} title={article.title} />
              </div>

              {/* In-content Comparison Table if this is a comparison article */}
              {comparison && (
                <div className="mb-10">
                  <ComparisonTable comparison={comparison} />
                </div>
              )}

              {/* Prose Editorial Content with Dual-Theme Typography */}
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(article.content),
                }}
              />

              {/* In-Content Ad Slot */}
              <AdSlot slot="in-content" className="my-10" />

              {/* Article Tags Footer */}
              <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted mr-2">
                  Article Tags:
                </span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?tag=${encodeURIComponent(tag)}`}
                    className="rounded-md border border-line bg-card px-3 py-1 text-xs text-secondary hover:border-accent hover:text-accent transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Editorial Fact-Check & Verification Callout */}
              <div className="my-10 rounded-xl border-l-3 border-accent border-y border-r border-line bg-surface-elevated p-5 text-xs text-secondary leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-ink mb-1">
                  VELOCITY VERSE Editorial Transparency Notice
                </p>
                <p>
                  All technical data, engine outputs, and telemetry metrics in this report are independently verified by our engineering desk. Vehicles tested on track are subject to standard temperature and tire-pressure correction protocols.
                </p>
              </div>

              {/* Author Profile Box */}
              <div className="mt-12">
                <AuthorCard author={article.author} />
              </div>
            </div>
          </div>

          {/* Related Articles Section */}
          <div className="mx-auto max-w-5xl">
            <RelatedArticles articles={related} />
          </div>
        </div>
      </article>

      <Newsletter />
    </>
  );
}

// Lightweight, safe editorial markdown renderer with security sanitization
function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:[^"']*/gi, "");
}

function renderMarkdown(md: string): string {
  // First sanitize any raw malicious HTML injection
  const safeMd = sanitizeHtml(md.trim());
  let html = safeMd;

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

  // Horizontal Rule
  html = html.replace(/^---$/gim, '<hr />');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Tables
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow
      .split('|')
      .map((h: string) => h.trim())
      .filter((h: string) => h.length > 0)
      .map((h: string) => `<th>${h}</th>`)
      .join('');

    const rows = bodyRows
      .trim()
      .split('\n')
      .map((row: string) => {
        const cells = row
          .split('|')
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 0)
          .map((c: string) => `<td>${c}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Bullet Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>[\r\n]*)+)/gim, '<ul>$1</ul>');

  // Paragraphs
  const blocks = html.split(/\n\s*\n/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<table') ||
      trimmed.startsWith('<hr')
    ) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
  });

  return formattedBlocks.join('\n');
}
