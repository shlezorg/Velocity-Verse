"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ImageAsset } from "@/lib/types";

interface Props {
  images: ImageAsset[];
  onChange: (next: ImageAsset[]) => void;
  onUploadingChange?: (loading:boolean) => void;
}

export function GalleryUploader({images, onChange, onUploadingChange}:Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const slots = 10 - images.length;

  async function upload(files:FileList|null) {
    if (!files?.length) return;
    if (files.length > slots) { setError(`Only ${slots} more photos can be added (10 maximum).`); return; }
    for (const file of Array.from(files)) {
      if (!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type) || file.size > 10*1024*1024) {
        setError(`${file.name}: JPG, PNG, WebP or AVIF only; maximum 10 MB each.`);
        return;
      }
    }
    setError(""); setLoading(true); onUploadingChange?.(true);
    const body = new FormData();
    Array.from(files).forEach(file => body.append("files",file));
    try {
      const res = await fetch("/api/media/upload",{method:"POST",body});
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.images)) throw new Error(data.error || "Upload failed");
      onChange([...images,...(data.images as ImageAsset[])].slice(0,10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload photos.");
    } finally {
      setLoading(false); onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  function move(i:number,shift:number) {
    const j = i+shift;
    if (j<0 || j>=images.length) return;
    const next=[...images]; [next[i],next[j]]=[next[j],next[i]];
    onChange(next);
  }
  function modify(i:number,patch:Partial<ImageAsset>) {
    onChange(images.map((img,index) => index===i ? {...img,...patch} : img));
  }

  return (
    <section className="rounded-lg border border-line bg-card p-4 sm:p-5 space-y-4 shadow-sm" aria-label="Article photo gallery">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h3 className="font-display font-bold text-lg uppercase text-ink">Story photo gallery</h3>
          <p className="mt-1 text-xs text-secondary">Upload the same 10 car photos you use for your Facebook post.</p>
        </div>
        <span className="text-accent font-mono font-bold text-xs">{images.length} / 10</span>
      </div>
      <label className={`group flex flex-col items-center justify-center text-center min-h-28 border border-dashed border-accent/50 bg-surface p-5 transition-colors ${slots && !loading ? "cursor-pointer hover:bg-accent/10":"opacity-60 cursor-not-allowed"}`}>
        <span aria-hidden="true" className="text-2xl text-accent mb-1">＋</span>
        <span className="font-mono font-semibold text-xs uppercase text-ink">{loading ? "Uploading photographs…" : `Choose photos from your device`}</span>
        <span className="text-[11px] text-muted mt-1">JPG, PNG, WebP, AVIF • Up to 10 MB each • {slots} slots left</span>
        <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" disabled={slots===0 || loading}
          className="sr-only" onChange={e => void upload(e.target.files)} aria-label="Upload up to ten article photographs" />
      </label>
      {error && <p role="alert" className="text-xs text-accent">{error}</p>}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-secondary">The first photo is your article cover. Use the arrows to reorder photos; readers will see them in this sequence.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {images.map((img,i) => (
              <div key={img.src} className="min-w-0 border border-line bg-surface p-2">
                <div className="relative aspect-[16/10] bg-black">
                  <Image src={img.src} alt={img.alt || `Photo ${i+1}`} fill sizes="(min-width:768px) 300px, 100vw" className="object-cover" />
                  <span className="absolute top-2 left-2 bg-black/80 px-2 py-1 font-mono text-[10px] text-white">{i===0?"COVER":`PHOTO ${i+1}`}</span>
                </div>
                <label className="block mt-2 text-[10px] font-mono uppercase text-muted">Photo description</label>
                <input value={img.alt || ""} aria-label={`Description for photo ${i+1}`}
                  onChange={e=>modify(i,{alt:e.target.value})} maxLength={300}
                  className="mt-1 block w-full rounded-sm bg-input border border-line text-xs p-2 text-ink" />
                <label className="block mt-2 text-[10px] font-mono uppercase text-muted">Optional photo caption</label>
                <input value={img.caption || ""} aria-label={`Caption for photo ${i+1}`}
                  onChange={e=>modify(i,{caption:e.target.value})} maxLength={500}
                  placeholder="Example: Rear wing and active aerodynamics"
                  className="mt-1 block w-full rounded-sm bg-input border border-line text-xs p-2 text-ink" />
                <div className="flex gap-1 mt-2 items-center">
                  <button type="button" onClick={()=>move(i,-1)} disabled={i===0}
                    className="border border-line px-3 py-1 text-xs text-secondary disabled:opacity-30" aria-label={`Move photo ${i+1} earlier`}>←</button>
                  <button type="button" onClick={()=>move(i,1)} disabled={i===images.length-1}
                    className="border border-line px-3 py-1 text-xs text-secondary disabled:opacity-30" aria-label={`Move photo ${i+1} later`}>→</button>
                  {i!==0 && <button type="button" onClick={()=>move(i,-i)} className="border border-accent/40 px-2 py-1 text-[10px] text-accent">Set cover</button>}
                  <button type="button" onClick={()=>onChange(images.filter((_,j)=>j!==i))}
                    className="ml-auto text-[10px] text-accent underline underline-offset-2">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
