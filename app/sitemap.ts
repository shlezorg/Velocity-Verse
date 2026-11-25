import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { categories, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${site.url}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${site.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.url}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.url}/editorial-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${site.url}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${site.url}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category landing pages
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${site.url}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Article pages
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${site.url}/${article.category}/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
