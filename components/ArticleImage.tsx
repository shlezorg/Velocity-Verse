import Image from "next/image";
import type { Article } from "@/lib/types";

// Fills a `relative` parent. Falls back to a branded placeholder until real photography is attached.
export function ArticleImage({ image, sizes, priority }: { image: Article["featuredImage"]; sizes: string; priority?: boolean }) {
  if (image) return <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />;
  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-linear-to-br from-card via-surface to-bg">
      <Image src="/brand/mark.webp" alt="" width={1030} height={540} sizes="160px" className="w-1/3 opacity-20 mix-blend-lighten" />
    </div>
  );
}
