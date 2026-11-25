import type { CategorySlug } from "./types";

// Single source of truth for VELOCITY VERSE brand identity
export const site = {
  name: "VELOCITY VERSE",
  tagline: "Where Speed Meets the Future",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description: "A premium automotive digital magazine and editorial media platform covering supercars, electric performance, engineering breakthroughs, track reviews, and buying guides worldwide.",
  foundedYear: 2026,
  publisher: "Velocity Verse Media Group",
  contactEmail: "editorial@velocityverse.com",
} as const;

export const categories: { 
  slug: CategorySlug; 
  label: string; 
  title: string; 
  blurb: string;
  image: string;
  icon: string;
}[] = [
  { 
    slug: "supercars", 
    label: "Supercars", 
    title: "Supercars & Hypercars", 
    blurb: "The fastest, rarest, and most ambitious engineering achievements on four wheels.",
    image: "/images/ferrari-supercar.jpg",
    icon: "bolt"
  },
  { 
    slug: "electric", 
    label: "Electric", 
    title: "Electric Performance", 
    blurb: "High-voltage performance, battery innovation, and EV engineering reshaping automotive speed.",
    image: "/images/electric-hypercar.jpg",
    icon: "zap"
  },
  { 
    slug: "reviews", 
    label: "Reviews", 
    title: "Car Reviews & Track Tests", 
    blurb: "Uncompromising, data-driven verdicts on how performance cars drive, feel, and perform at the limit.",
    image: "/images/porsche-track.jpg",
    icon: "gauge"
  },
  { 
    slug: "technology", 
    label: "Technology", 
    title: "Automotive Technology", 
    blurb: "Active aerodynamics, carbon-ceramic composites, silicon carbide inverters, and racing telemetry.",
    image: "/images/cockpit-technology.jpg",
    icon: "cpu"
  },
  { 
    slug: "compare", 
    label: "Compare", 
    title: "Editorial Comparisons", 
    blurb: "Head-to-head engineering breakdowns and side-by-side performance spec analyses.",
    image: "/images/supercar-comparison.jpg",
    icon: "scale"
  },
  { 
    slug: "news", 
    label: "News", 
    title: "Automotive News & Concepts", 
    blurb: "Global automotive developments, world debuts, and industry trends reported with editorial depth.",
    image: "/images/news-car-reveal.jpg",
    icon: "newspaper"
  },
  { 
    slug: "guides", 
    label: "Guides", 
    title: "Buying & Ownership Guides", 
    blurb: "Essential, research-led acquisition guides for collectors, track enthusiasts, and performance drivers.",
    image: "/images/buying-guide.jpg",
    icon: "book"
  },
];

export const nav = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Reviews", href: "/reviews" },
  { label: "Supercars", href: "/supercars" },
  { label: "Electric", href: "/electric" },
  { label: "Technology", href: "/technology" },
  { label: "Compare", href: "/compare" },
  { label: "Guides", href: "/guides" },
];

export const categoryLabel = (slug: CategorySlug) => categories.find((c) => c.slug === slug)?.label ?? slug;
export const getCategory = (slug: CategorySlug) => categories.find((c) => c.slug === slug);
