"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageAsset } from "@/lib/types";

export function ArticleGallery({ images, title }: { images: ImageAsset[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const count = images.length;
  const active = images[Math.min(index, count - 1)];
  useEffect(() => setIndex(0), [images]);
  useEffect(() => {
    if (!lightbox) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [lightbox]);
  if (!count || !active) return null;
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  const handleKeys = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  };
  return (
    <section aria-label={`${title} photo gallery`} className="my-10 mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="font-mono uppercase text-[10px] tracking-[0.22em] text-accent">Velocity Verse / Photo story</p>
          <h2 className="font-display font-bold uppercase text-xl sm:text-2xl text-ink">
            The gallery <span className="text-muted font-normal">/ {count} photographs</span>
          </h2>
        </div>
        <span className="font-mono text-sm text-secondary tabular-nums" aria-live="polite">
          {String(index+1).padStart(2,"0")} / {String(count).padStart(2,"0")}
        </span>
      </div>
      <div className="relative" tabIndex={0} onKeyDown={handleKeys}
        onTouchStart={e => setTouchStart(e.changedTouches[0]?.screenX ?? null)}
        onTouchEnd={e => {
          if (touchStart === null) return;
          const delta = (e.changedTouches[0]?.screenX ?? touchStart) - touchStart;
          if (Math.abs(delta) > 48) go(delta < 0 ? 1 : -1);
          setTouchStart(null);
        }}>
        <button type="button" onClick={() => setLightbox(true)}
          className="relative block w-full aspect-[16/9] bg-black overflow-hidden rounded-sm border border-line group cursor-zoom-in"
          aria-label={`Enlarge photograph ${index+1} of ${count}`}>
          <Image key={active.src} src={active.src} alt={active.alt || `${title} photograph ${index+1}`}
            fill priority={index === 0} sizes="(min-width:1280px) 1024px, 100vw"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.012]" />
          <span className="absolute bottom-4 right-4 rounded-sm bg-black/75 px-3 py-1.5 text-[10px] font-mono text-white">
            View fullscreen ↗
          </span>
        </button>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)}
              aria-label="Previous photograph"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-10 sm:size-12 grid place-items-center bg-black/75 text-white border border-white/30 hover:bg-accent transition-colors text-2xl shadow-lg">
              ‹
            </button>
            <button type="button" onClick={() => go(1)}
              aria-label="Next photograph"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 size-10 sm:size-12 grid place-items-center bg-black/75 text-white border border-white/30 hover:bg-accent transition-colors text-2xl shadow-lg">
              ›
            </button>
          </>
        )}
      </div>
      <div className="flex items-start justify-between gap-5 mt-3 mb-5 text-xs">
        <p className="italic text-secondary max-w-2xl">{active.caption || active.alt || title}</p>
        <p className="font-mono text-[10px] whitespace-nowrap text-muted">← → to browse</p>
      </div>
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-3" role="group" aria-label="Choose a gallery photograph">
          {images.map((img,i) => (
            <button key={`${img.src}-${i}`} type="button" onClick={() => setIndex(i)}
              aria-label={`View photograph ${i+1}`} aria-current={i===index ? "true" : undefined}
              className={`relative shrink-0 w-20 sm:w-28 aspect-[5/3] bg-black overflow-hidden border-2 transition-colors ${i===index?"border-accent":"border-line hover:border-secondary"}`}>
              <Image src={img.src} alt="" fill sizes="112px" className="object-cover" />
              <span className="absolute left-1 bottom-1 bg-black/70 px-1 text-[9px] text-white font-mono">{i+1}</span>
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label="Fullscreen article gallery"
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center p-4 sm:p-10"
          onKeyDown={handleKeys} tabIndex={-1}>
          <button type="button" onClick={() => setLightbox(false)}
            aria-label="Close fullscreen gallery" className="absolute right-5 top-4 z-20 text-white bg-white/15 hover:bg-accent px-4 py-2 text-xs font-mono uppercase">
            Close ×
          </button>
          <div className="relative w-full flex-1 max-h-[82vh]">
            <Image src={active.src} alt={active.alt || title} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-between gap-6 w-full max-w-2xl mt-4 text-white">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="px-5 py-2 border border-white/30 hover:bg-accent">←</button>
            <span className="font-mono text-sm">{index+1} / {count}</span>
            <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="px-5 py-2 border border-white/30 hover:bg-accent">→</button>
          </div>
        </div>
      )}
    </section>
  );
}
