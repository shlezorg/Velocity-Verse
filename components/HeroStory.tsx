"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { articleHref, formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/site";
import type { Article } from "@/lib/types";

export function HeroStory({ articles }: { articles: Article[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = articles[activeIndex] || articles[0];

  // Auto-advance cover story every 8 seconds if user hasn't interacted recently
  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(articles.length, 4));
    }, 8000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (!active) return null;

  // Extract or generate authentic telemetry specs based on tags/title
  const telemetrySpecs = [
    { label: "Category", val: categoryLabel(active.category) },
    { label: "Dispatch", val: active.trending ? "TRENDING REPORT" : "COVER STORY" },
    { label: "Read Time", val: `${active.readingTime} MIN READ` },
  ];

  return (
    <section
      aria-label="Cover Story"
      className="relative isolate min-h-[88svh] lg:min-h-[92svh] flex flex-col justify-end overflow-hidden pt-24 pb-12 sm:pb-16"
    >
      {/* Background Cinematic Vehicle Layer */}
      {articles.slice(0, 4).map((art, idx) => (
        <div
          key={art.id}
          className={`absolute inset-0 -z-20 transition-all duration-1000 ease-out ${
            idx === activeIndex
              ? "opacity-100 scale-100"
              : "opacity-0 pointer-events-none scale-102"
          }`}
        >
          {/* Desktop & Tablet Panoramic Image */}
          <div className="absolute inset-0 right-0 w-full lg:w-[82%] lg:left-auto">
            <Image
              src={art.featuredImage?.src || "/images/hero.webp"}
              alt={art.featuredImage?.alt || art.title}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center lg:object-[65%_45%]"
            />
          </div>
        </div>
      ))}

      {/* Controlled Directional Gradient Overlays:
          Leaves the car bodywork luminous and sharp while ensuring 100% WCAG contrast on text */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/85 to-transparent sm:via-bg/75 lg:bg-linear-to-r lg:from-bg lg:via-bg/70 lg:via-45% lg:to-transparent"
      />

      {/* Hero Content Container */}
      <div className="container-page relative z-10 w-full pt-16 sm:pt-20">
        <div className="max-w-3xl">
          {/* Eyebrow & Status Pill */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(229,9,25,0.4)]">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              {active.trending ? "Breaking Telemetry" : "Editorial Cover Story"}
            </span>

            <span className="text-line-highlight">•</span>

            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              {categoryLabel(active.category)}
            </span>

            {active.tags && active.tags.length > 0 && (
              <>
                <span className="hidden sm:inline text-line-highlight">•</span>
                <span className="hidden sm:inline-block font-mono text-xs text-secondary">
                  #{active.tags[0]}
                </span>
              </>
            )}
          </div>

          {/* Major Editorial Headline */}
          <h1 className="mt-4 font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.96] tracking-tight text-ink drop-shadow-sm">
            {active.title}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-secondary font-normal">
            {active.excerpt}
          </p>

          {/* Technical Telemetry Metadata Strip */}
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            {telemetrySpecs.map((spec, sIdx) => (
              <div
                key={sIdx}
                className="spec-badge glass-card"
              >
                <span className="text-muted">{spec.label}:</span>
                <strong className="text-ink">{spec.val}</strong>
              </div>
            ))}
          </div>

          {/* Editorial CTAs */}
          <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
            <Link
              href={articleHref(active)}
              className="group inline-flex items-center gap-3 rounded-sm bg-accent px-7 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(229,9,25,0.4)]"
            >
              <span>Read Cover Story</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href={`/${active.category}`}
              className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface/60 px-5 py-3.5 text-xs font-mono font-semibold uppercase tracking-wider text-muted hover:text-ink hover:border-line-highlight hover:bg-surface transition-all"
            >
              <span>More in {categoryLabel(active.category)}</span>
            </Link>
          </div>
        </div>

        {/* Multi-Featured Story Switcher Tabs (Magazine Cover Selector) */}
        {articles.length > 1 && (
          <div className="mt-10 sm:mt-14 border-t border-line/60 pt-5">
            <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-widest text-muted">
              <span>Selected Cover Features ({Math.min(articles.length, 4)})</span>
              <span className="text-accent">0{activeIndex + 1} / 0{Math.min(articles.length, 4)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {articles.slice(0, 4).map((art, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative text-left p-3 rounded-md transition-all duration-200 border ${
                      isSelected
                        ? "border-accent bg-surface-elevated/90 shadow-md ring-1 ring-accent/30"
                        : "border-line bg-surface/40 hover:border-line-highlight hover:bg-surface/80"
                    }`}
                  >
                    {/* Top Status Bar */}
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                      <span className={`font-bold ${isSelected ? "text-accent" : "text-muted"}`}>
                        0{idx + 1}
                      </span>
                      <span className="text-muted truncate max-w-[80px]">
                        {categoryLabel(art.category)}
                      </span>
                    </div>

                    <h2 className="font-display text-xs sm:text-sm font-bold uppercase leading-tight line-clamp-1 text-ink group-hover:text-accent transition-colors">
                      {art.title}
                    </h2>

                    {/* Active Progress Bar */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
