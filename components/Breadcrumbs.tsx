import Link from "next/link";
import { site } from "@/lib/site";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? `${site.url}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            <span className="text-muted/60">/</span>
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-ink capitalize">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink font-semibold truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
