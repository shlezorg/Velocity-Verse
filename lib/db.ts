import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { Article, ArticleStatus, CategorySlug, Author, ImageAsset } from "./types";
import type { UserRecord } from "./auth";
import { site } from "./site";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "velocity_verse.db");

let _db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec("PRAGMA busy_timeout = 10000;");
    _db.exec("PRAGMA journal_mode = WAL;");
    _db.exec("PRAGMA foreign_keys = ON;");
    try {
      initSchema(_db);
    } catch (err: any) {
      if (err?.code !== "ERR_SQLITE_ERROR" && !err?.message?.includes("locked")) {
        throw err;
      }
    }
  }
  return _db;
}

function initSchema(db: DatabaseSync) {
  // 1. Articles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      featured INTEGER NOT NULL DEFAULT 0,
      trending INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      reading_time INTEGER NOT NULL DEFAULT 5,
      tags TEXT NOT NULL,
      featured_image TEXT,
      author TEXT NOT NULL,
      author_id TEXT NOT NULL,
      seo_title TEXT,
      seo_description TEXT,
      canonical_url TEXT,
      og_image TEXT,
      published_at TEXT,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_articles_status_pub ON articles(status, published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
  `);

  // Existing installs retain their articles; add the gallery column once.
  const columns = db.prepare("PRAGMA table_info(articles)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "gallery_images")) {
    db.exec("ALTER TABLE articles ADD COLUMN gallery_images TEXT NOT NULL DEFAULT '[]';");
  }

  // 2. Users table (for secure staff authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Article Views table (real view tracking with deduplication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS article_views (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      visitor_hash TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_views_art_visitor ON article_views(article_id, visitor_hash, created_at);
    CREATE INDEX IF NOT EXISTS idx_views_art_date ON article_views(article_id, created_at);
  `);

  // 4. Newsletter Subscribers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      source TEXT,
      created_at TEXT NOT NULL
    );
  `);

}

// Convert SQLite row to typed Article
function rowToArticle(row: any): Article {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as CategorySlug,
    title: row.title,
    subtitle: row.subtitle || "",
    excerpt: row.excerpt,
    content: row.content,
    status: row.status as ArticleStatus,
    featured: Boolean(row.featured),
    trending: Boolean(row.trending),
    views: Number(row.views || 0),
    readingTime: Number(row.reading_time || 5),
    tags: JSON.parse(row.tags || "[]"),
    featuredImage: row.featured_image ? JSON.parse(row.featured_image) : null,
    gallery: row.gallery_images ? JSON.parse(row.gallery_images) : [],
    author: JSON.parse(row.author),
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    canonicalUrl: row.canonical_url || undefined,
    ogImage: row.og_image || undefined,
    publishedAt: row.published_at || row.created_at,
    updatedAt: row.updated_at,
  };
}

// Seed initial articles if table is empty
export function seedInitialArticles(articles: Article[]) {
  try {
    const db = getDb();
    const count = db.prepare("SELECT COUNT(*) as count FROM articles").get() as { count: number };
    if (count.count > 0) return;

    const stmt = db.prepare(`
      INSERT INTO articles (
        id, slug, category, title, subtitle, excerpt, content, status,
        featured, trending, views, reading_time, tags, featured_image,
        author, author_id, seo_title, seo_description, canonical_url,
        og_image, published_at, updated_at, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    const now = new Date().toISOString();
    for (const a of articles) {
      stmt.run(
        a.id,
        a.slug,
        a.category,
        a.title,
        a.subtitle || null,
        a.excerpt,
        a.content,
        a.status,
        a.featured ? 1 : 0,
        a.trending ? 1 : 0,
        0, // Real recorded views only!
        a.readingTime,
        JSON.stringify(a.tags || []),
        a.featuredImage ? JSON.stringify(a.featuredImage) : null,
        JSON.stringify(a.author),
        a.author.id,
        a.seoTitle || null,
        a.seoDescription || null,
        a.canonicalUrl || `${site.url}/${a.category}/${a.slug}`,
        a.ogImage || null,
        a.publishedAt,
        a.updatedAt || now,
        a.publishedAt || now
      );
    }
  } catch (err: any) {
    if (err?.code !== "ERR_SQLITE_ERROR" && !err?.message?.includes("locked")) {
      console.error("Seed error:", err);
    }
  }
}

// DB Operations for Articles
export function dbGetAllArticles(includeAll = false): Article[] {
  const db = getDb();
  let query = "SELECT * FROM articles";
  if (!includeAll) {
    const nowIso = new Date().toISOString();
    query += ` WHERE status = 'PUBLISHED' AND published_at <= '${nowIso}' ORDER BY published_at DESC`;
  } else {
    query += " ORDER BY created_at DESC";
  }
  const rows = db.prepare(query).all();
  return rows.map(rowToArticle);
}

export function dbGetArticleBySlug(category: string, slug: string): Article | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM articles WHERE category = ? AND slug = ?").get(category, slug);
  return row ? rowToArticle(row) : null;
}

export function dbGetArticleById(id: string): Article | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(id);
  return row ? rowToArticle(row) : null;
}

export function dbCreateArticle(data: Omit<Article, "id" | "views">): Article {
  const db = getDb();
  const id = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO articles (
      id, slug, category, title, subtitle, excerpt, content, status,
      featured, trending, views, reading_time, tags, featured_image,
      author, author_id, seo_title, seo_description, canonical_url,
      og_image, published_at, updated_at, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    data.slug,
    data.category,
    data.title,
    data.subtitle || null,
    data.excerpt,
    data.content,
    data.status,
    data.featured ? 1 : 0,
    data.trending ? 1 : 0,
    0, // Initial views
    data.readingTime || 5,
    JSON.stringify(data.tags || []),
    data.featuredImage ? JSON.stringify(data.featuredImage) : null,
    JSON.stringify(data.author),
    data.author.id,
    data.seoTitle || null,
    data.seoDescription || null,
    data.canonicalUrl || `${site.url}/${data.category}/${data.slug}`,
    data.ogImage || null,
    data.publishedAt || now,
    now,
    now
  );

  if (Array.isArray(data.gallery)) {
    db.prepare("UPDATE articles SET gallery_images = ? WHERE id = ?")
      .run(JSON.stringify(data.gallery.slice(0, 10)), id);
  }
  return dbGetArticleById(id)!;
}

export function dbUpdateArticle(id: string, updates: Partial<Article>): Article | null {
  const db = getDb();
  const existing = dbGetArticleById(id);
  if (!existing) return null;

  const merged: Article = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    UPDATE articles SET
      slug = ?, category = ?, title = ?, subtitle = ?, excerpt = ?,
      content = ?, status = ?, featured = ?, trending = ?, reading_time = ?,
      tags = ?, featured_image = ?, author = ?, seo_title = ?,
      seo_description = ?, canonical_url = ?, og_image = ?, published_at = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    merged.slug,
    merged.category,
    merged.title,
    merged.subtitle || null,
    merged.excerpt,
    merged.content,
    merged.status,
    merged.featured ? 1 : 0,
    merged.trending ? 1 : 0,
    merged.readingTime,
    JSON.stringify(merged.tags || []),
    merged.featuredImage ? JSON.stringify(merged.featuredImage) : null,
    JSON.stringify(merged.author),
    merged.seoTitle || null,
    merged.seoDescription || null,
    merged.canonicalUrl || null,
    merged.ogImage || null,
    merged.publishedAt,
    merged.updatedAt,
    id
  );

  if (updates.gallery !== undefined) {
    db.prepare("UPDATE articles SET gallery_images = ? WHERE id = ?")
      .run(JSON.stringify((updates.gallery || []).slice(0, 10)), id);
  }
  return dbGetArticleById(id);
}

export function dbDeleteArticle(id: string): boolean {
  const db = getDb();
  const info = db.prepare("DELETE FROM articles WHERE id = ?").run(id);
  return info.changes > 0;
}

// REAL VIEW TRACKING with deduplication and bot rejection
export function dbRecordArticleView(
  articleId: string,
  visitorHash: string,
  referrer = "",
  userAgent = ""
): { recorded: boolean; currentViews: number } {
  const db = getDb();
  const article = dbGetArticleById(articleId);
  if (!article) return { recorded: false, currentViews: 0 };

  // Check if this visitor already recorded a view on this article in the last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const recent = db
    .prepare(
      "SELECT id FROM article_views WHERE article_id = ? AND visitor_hash = ? AND created_at > ?"
    )
    .get(articleId, visitorHash, thirtyMinutesAgo);

  if (recent) {
    return { recorded: false, currentViews: article.views };
  }

  // Record view event
  const viewId = `vw-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO article_views (id, article_id, visitor_hash, referrer, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(viewId, articleId, visitorHash, referrer.substring(0, 500), userAgent.substring(0, 500), now);

  // Increment view count on article
  db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").run(articleId);

  return { recorded: true, currentViews: article.views + 1 };
}

// REAL ANALYTICS CALCULATIONS (No fake numbers!)
export function dbGetAnalytics() {
  const db = getDb();

  const totalPublishedRow = db
    .prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'PUBLISHED'")
    .get() as { count: number };
  const totalDraftsRow = db
    .prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'DRAFT'")
    .get() as { count: number };
  const totalScheduledRow = db
    .prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'SCHEDULED'")
    .get() as { count: number };

  const totalViewsRow = db
    .prepare("SELECT SUM(views) as sum FROM articles")
    .get() as { sum: number | null };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const viewsTodayRow = db
    .prepare("SELECT COUNT(*) as count FROM article_views WHERE created_at >= ?")
    .get(todayStart.toISOString()) as { count: number };

  const topArticleRow = db
    .prepare("SELECT id, title, slug, category, views FROM articles WHERE status = 'PUBLISHED' ORDER BY views DESC LIMIT 1")
    .get() as { id: string; title: string; slug: string; category: string; views: number } | undefined;

  const recentViews = db
    .prepare(`
      SELECT av.created_at, av.referrer, a.title, a.category, a.slug
      FROM article_views av
      JOIN articles a ON av.article_id = a.id
      ORDER BY av.created_at DESC
      LIMIT 10
    `)
    .all();

  return {
    publishedArticles: totalPublishedRow.count,
    draftArticles: totalDraftsRow.count,
    scheduledArticles: totalScheduledRow.count,
    totalViews: totalViewsRow.sum || 0,
    viewsToday: viewsTodayRow.count,
    topArticle: topArticleRow || null,
    recentActivity: recentViews,
  };
}

// User Authentication DB methods
export function dbGetUserByEmail(email: string): UserRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    passwordHash: row.password_hash,
    salt: row.salt,
    avatar: row.avatar,
    createdAt: row.created_at,
  };
}

// Newsletter subscriber persistence
export function dbSubscribeNewsletter(email: string, source = "website"): { success: boolean; alreadySubscribed: boolean } {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();

  const existing = db
    .prepare("SELECT id, status FROM newsletter_subscribers WHERE email = ?")
    .get(cleanEmail) as { id: string; status: string } | undefined;

  if (existing) {
    return { success: true, alreadySubscribed: true };
  }

  const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO newsletter_subscribers (id, email, status, source, created_at)
    VALUES (?, ?, 'ACTIVE', ?, ?)
  `).run(id, cleanEmail, source, new Date().toISOString());

  return { success: true, alreadySubscribed: false };
}
