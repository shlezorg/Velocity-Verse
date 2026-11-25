export type ArticleStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";
export type CategorySlug = "news" | "reviews" | "supercars" | "electric" | "technology" | "compare" | "guides";

export interface ImageAsset {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string; // Markdown formatted rich editorial content
  featuredImage: ImageAsset | null;
  gallery?: ImageAsset[]; // Up to ten uploaded photos, in editorial display order
  author: Author;
  category: CategorySlug;
  tags: string[];
  publishedAt: string; // ISO 8601
  updatedAt: string;
  readingTime: number; // minutes
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  status: ArticleStatus;
  featured: boolean;
  trending: boolean;
  views: number;
}

export interface VehicleSpec {
  name: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  power: string; // e.g. "1,000 hp (735 kW)"
  torque: string; // e.g. "800 Nm (590 lb-ft)"
  acceleration: string; // e.g. "2.5s (0-100 km/h)"
  topSpeed: string; // e.g. "340 km/h (211 mph)"
  weight: string; // e.g. "1,570 kg"
  price: string; // e.g. "$525,000"
  driveType: string; // e.g. "All-Wheel Drive (e-AWD)"
  transmission: string; // e.g. "8-speed Dual-Clutch F1"
  image: string;
  keyFeature: string;
}

export interface ComparisonItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: CategorySlug;
  publishedAt: string;
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
  verdict: string;
  summary: string;
}
