"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/site";
import type { Article, ArticleStatus, CategorySlug, ImageAsset } from "@/lib/types";
import { GalleryUploader } from "@/components/GalleryUploader";
import type { SessionUser } from "@/lib/auth";
import { formatDate, articleHref } from "@/lib/format";

interface AnalyticsData {
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalViews: number;
  viewsToday: number;
  topArticle: { id: string; title: string; slug: string; category: string; views: number } | null;
  recentActivity: Array<{ created_at: string; referrer: string; title: string; category: string; slug: string }>;
}

interface MediaItem {
  id: string;
  name: string;
  src: string;
  category: string;
  dimensions: string;
  aspect: string;
}

const MEDIA_LIBRARY_ITEMS: MediaItem[] = [
  { id: "med-1", name: "Ferrari Flagship Twilight Pass", src: "/images/ferrari-supercar.jpg", category: "supercars", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-2", name: "Exposed Hybrid Powertrain Chassis", src: "/images/hybrid-hypercar.jpg", category: "technology", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-3", name: "Electric Hypercar Circuit Testing", src: "/images/electric-hypercar.jpg", category: "electric", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-4", name: "Head-to-Head Comparison Studio", src: "/images/supercar-comparison.jpg", category: "compare", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-5", name: "Digital Cockpit Telemetry Display", src: "/images/cockpit-technology.jpg", category: "technology", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-6", name: "Nürburgring Apex Limit Assessment", src: "/images/porsche-track.jpg", category: "reviews", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-7", name: "Collector Portfolio Acquisition Lineup", src: "/images/buying-guide.jpg", category: "guides", dimensions: "2400 × 1350", aspect: "16:9" },
  { id: "med-8", name: "International Motor Show Concept Debut", src: "/images/news-car-reveal.jpg", category: "news", dimensions: "2400 × 1350", aspect: "16:9" },
];

export default function AdminPage() {
  const router = useRouter();

  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core Data
  const [articles, setArticles] = useState<Article[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<"overview" | "articles" | "editor" | "fast-editor" | "analytics" | "media">("overview");

  // Article Management State: Search, Filter, Sort, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "views-desc" | "title-asc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Editing Article State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [editorPreview, setEditorPreview] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    category: "supercars" as CategorySlug,
    excerpt: "",
    content: "",
    status: "DRAFT" as ArticleStatus,
    featured: false,
    trending: false,
    readingTime: 5,
    tags: "Supercars, Engineering",
    imageSrc: "/images/ferrari-supercar.jpg",
    imageAlt: "Automotive editorial photography",
    gallery: [] as ImageAsset[],
    authorName: "Marcus Vance",
    scheduledAt: "",
    seoTitle: "",
    seoDescription: "",
  });

  // Fast Editor State
  const [fastTitle, setFastTitle] = useState("");
  const [fastCategory, setFastCategory] = useState<CategorySlug>("news");
  const [fastExcerpt, setFastExcerpt] = useState("");
  const [fastContent, setFastContent] = useState("");
  const [fastImage, setFastImage] = useState("/images/news-car-reveal.jpg");
  const [fastGallery, setFastGallery] = useState<ImageAsset[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [fastStatus, setFastStatus] = useState<ArticleStatus>("PUBLISHED");

  // Feedback Notifications
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive Modals
  const [previewModalArticle, setPreviewModalArticle] = useState<Article | null>(null);
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState<Article | null>(null);
  const [mediaDetailItem, setMediaDetailItem] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // 1. Verify Authentication & Role
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/admin/login?from=/admin");
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user?.name) {
          setFormData((prev) => ({ ...prev, authorName: data.user.name }));
        }
      } catch {
        router.push("/admin/login?from=/admin");
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch all articles & live analytics
  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles?all=true");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchArticles();
      fetchAnalytics();
    }
  }, [authLoading, currentUser, fetchArticles, fetchAnalytics]);

  // Sign out handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  // Generate URL slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Handle switching to Edit Mode
  const handleEdit = (article: Article) => {
    setEditingArticleId(article.id);
    setFormData({
      title: article.title,
      subtitle: article.subtitle || "",
      slug: article.slug,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      status: article.status,
      featured: article.featured,
      trending: article.trending,
      readingTime: article.readingTime,
      tags: (article.tags || []).join(", "),
      imageSrc: article.featuredImage?.src || "/images/hero.webp",
      imageAlt: article.featuredImage?.alt || "",
      gallery: article.gallery || [],
      authorName: article.author.name,
      scheduledAt: article.status === "SCHEDULED" && article.publishedAt ? article.publishedAt.slice(0, 16) : "",
      seoTitle: article.seoTitle || "",
      seoDescription: article.seoDescription || "",
    });
    setIsDirty(false);
    setActiveTab("editor");
  };

  // Handle creating a blank new story
  const handleCreateNew = () => {
    setEditingArticleId(null);
    setFormData({
      title: "",
      subtitle: "",
      slug: "",
      category: "supercars",
      excerpt: "",
      content: `## Executive Technical Summary\n\nProvide the opening editorial dispatch establishing the engineering narrative...\n\n> "A key quote from the vehicle's chief engineer or test driver on corner exit telemetry."\n\n### Powertrain & Telemetry Analysis\n\nDetail the cylinder displacement, kilowatt inverter outputs, and downforce balance...\n\n| Engineering Metric | Track Specification | Performance Significance |\n| :--- | :--- | :--- |\n| **Powertrain** | 4.0L Twin-Turbo V8 Hybrid | Direct injection with 350-bar rail pressure |\n| **System Power** | 1,030 hp (758 kW) | Instant axial-flux motor torque vectoring |\n| **0–100 km/h** | 2.3 seconds | Electronic all-wheel drive launch control |\n| **Peak Downforce** | 530 kg @ 250 km/h | Active underbody venturi ground effects |`,
      status: currentUser?.role === "AUTHOR" ? "DRAFT" : "PUBLISHED",
      featured: false,
      trending: false,
      readingTime: 6,
      tags: "Supercars, Engineering, Track Test",
      imageSrc: "/images/ferrari-supercar.jpg",
      imageAlt: "Automotive editorial photography",
      gallery: [],
      authorName: currentUser?.name || "Marcus Vance",
      scheduledAt: "",
      seoTitle: "",
      seoDescription: "",
    });
    setIsDirty(false);
    setActiveTab("editor");
  };

  // Perform permanent deletion
  const executeDelete = async () => {
    if (!deleteConfirmArticle) return;
    try {
      const res = await fetch(`/api/articles/${deleteConfirmArticle.id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== deleteConfirmArticle.id));
        setDeleteConfirmArticle(null);
        fetchAnalytics();
        setSaveMessage("Article permanently removed from archive.");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to delete article");
      }
    } catch {
      setErrorMessage("Network error while deleting article.");
    }
  };

  // Save or Update Article
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (galleryUploading) { setErrorMessage("Let the photo upload finish before publishing."); return; }
    setIsSubmitting(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const slug = formData.slug || generateSlug(formData.title);

    let publishedAt = new Date().toISOString();
    if (formData.status === "SCHEDULED" && formData.scheduledAt) {
      publishedAt = new Date(formData.scheduledAt).toISOString();
    }

    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      slug,
      category: formData.category,
      excerpt: formData.excerpt,
      content: formData.content,
      status: formData.status,
      featured: formData.featured,
      trending: formData.trending,
      readingTime: Number(formData.readingTime) || 5,
      tags: tagsArray,
      gallery: formData.gallery,
      publishedAt,
      featuredImage: {
        src: formData.gallery[0]?.src || formData.imageSrc,
        alt: formData.gallery[0]?.alt || formData.imageAlt || formData.title,
        caption: formData.title,
      },
      author: {
        id: currentUser?.id || "auth-1",
        name: formData.authorName,
        slug: formData.authorName.toLowerCase().replace(/\s+/g, "-"),
        role: currentUser?.role === "ADMIN" ? "Chief Technical Editor" : currentUser?.role === "EDITOR" ? "Senior Editor" : "Contributing Author",
        avatar: currentUser?.avatar || "/images/author-avatar.jpg",
      },
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.excerpt,
    };

    try {
      if (editingArticleId) {
        const res = await fetch(`/api/articles/${editingArticleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveMessage("Article successfully updated in database.");
          setIsDirty(false);
          await fetchArticles();
          await fetchAnalytics();
          setTimeout(() => setSaveMessage(null), 3500);
        } else {
          const err = await res.json();
          setErrorMessage(err.error || "Failed to update article.");
        }
      } else {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSaveMessage("New article published successfully.");
          setIsDirty(false);
          await fetchArticles();
          await fetchAnalytics();
          setTimeout(() => {
            setSaveMessage(null);
            setActiveTab("articles");
          }, 1500);
        } else {
          const err = await res.json();
          setErrorMessage(err.error || "Failed to create article.");
        }
      }
    } catch {
      setErrorMessage("Network connection error while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast Article Editor Submit
  const handleFastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastTitle.trim() || galleryUploading) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const slug = generateSlug(fastTitle);
    const payload = {
      title: fastTitle,
      subtitle: "",
      slug,
      category: fastCategory,
      excerpt: fastExcerpt || fastTitle,
      content: fastContent || `## Breaking Wire Report\n\n${fastExcerpt}\n\n*Field report filed by ${currentUser?.name || "Editorial Desk"} directly from paddock.*`,
      status: fastStatus,
      featured: false,
      trending: true,
      readingTime: 3,
      tags: ["Breaking", "News", fastCategory],
      gallery: fastGallery,
      publishedAt: new Date().toISOString(),
      featuredImage: {
        src: fastGallery[0]?.src || fastImage,
        alt: fastTitle,
        caption: fastTitle,
      },
      author: {
        id: currentUser?.id || "auth-1",
        name: currentUser?.name || "Editorial Staff",
        slug: (currentUser?.name || "editorial-staff").toLowerCase().replace(/\s+/g, "-"),
        role: currentUser?.role === "ADMIN" ? "Chief Technical Editor" : "Staff Reporter",
        avatar: currentUser?.avatar || "/images/author-avatar.jpg",
      },
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaveMessage("Fast dispatch published to live site.");
        setFastTitle("");
        setFastExcerpt("");
        setFastContent("");
        setFastGallery([]);
        await fetchArticles();
        await fetchAnalytics();
        setTimeout(() => {
          setSaveMessage(null);
          setActiveTab("articles");
        }, 1200);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to publish fast dispatch.");
      }
    } catch {
      setErrorMessage("Network error during fast publish.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((a) => {
        const matchesQuery =
          searchQuery === "" ||
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesCategory = filterCategory === "ALL" || a.category === filterCategory;
        const matchesStatus = filterStatus === "ALL" || a.status === filterStatus;

        return matchesQuery && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        }
        if (sortBy === "views-desc") {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === "title-asc") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [articles, searchQuery, filterCategory, filterStatus, sortBy]);

  // Paginated articles
  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage, pageSize]);

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink">
        <div className="text-center space-y-4">
          <div className="size-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted">
            Verifying Editorial Credentials...
          </p>
        </div>
      </div>
    );
  }

  const publishedCount = analytics?.publishedArticles ?? articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = analytics?.draftArticles ?? articles.filter((a) => a.status === "DRAFT").length;
  const scheduledCount = analytics?.scheduledArticles ?? articles.filter((a) => a.status === "SCHEDULED").length;
  const totalViews = analytics?.totalViews ?? articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const viewsToday = analytics?.viewsToday ?? 0;
  const topArticle = analytics?.topArticle;

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased">
      {/* 1. TOP COMMAND BAR (Administrative Shell) */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Brand Identity & System Telemetry */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-sm bg-accent text-white font-display font-bold text-xs tracking-wider">
                VV
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Editorial Console
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  Ops Center 2.0
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-block h-4 w-px bg-line" />

            <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-muted">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SQLite WAL • Node.js Engine</span>
            </div>
          </div>

          {/* User Account Strip & Quick Global Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface-elevated px-3 py-1.5 text-xs font-mono text-muted hover:text-ink hover:border-line-highlight transition-colors"
            >
              <span>Public Edition</span>
              <span aria-hidden="true">↗</span>
            </Link>

            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-hover transition-colors"
            >
              <span>+ New Story</span>
            </button>

            {/* Account Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-line">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-ink leading-none">{currentUser.name}</p>
                  <p className="text-[10px] font-mono text-accent leading-none mt-1">{currentUser.role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of editorial console"
                  className="rounded-sm border border-line bg-surface p-1.5 text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Primary Navigation Tabs */}
        <div className="border-t border-line/60 bg-surface/50">
          <div className="container-page flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5">
            {[
              { id: "overview", label: "Overview", count: null },
              { id: "articles", label: "Articles", count: articles.length },
              { id: "editor", label: editingArticleId ? "Editing Article" : "Composer", count: null },
              { id: "fast-editor", label: "Fast Dispatch", count: null },
              { id: "analytics", label: "Readership Telemetry", count: null },
              { id: "media", label: "Media Library", count: MEDIA_LIBRARY_ITEMS.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-surface-elevated text-ink font-bold border border-line shadow-xs"
                      : "text-muted hover:text-ink hover:bg-surface-elevated/40"
                  }`}
                >
                  {isActive && <span className="size-1.5 rounded-full bg-accent" />}
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="rounded bg-surface-secondary px-1.5 py-0.5 text-[9px] font-mono text-secondary">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="container-page py-8">
        {/* Alerts / Feedback Banner */}
        {saveMessage && (
          <div role="status" className="mb-6 flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-mono text-emerald-400 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>{saveMessage}</span>
            </div>
            <button type="button" onClick={() => setSaveMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="mb-6 flex items-center justify-between rounded-md border border-accent/40 bg-accent-subtle p-3.5 text-xs font-mono text-accent animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent" />
              <span>{errorMessage}</span>
            </div>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-accent hover:text-white">✕</button>
          </div>
        )}

        {/* =========================================================================
            TAB 1: OVERVIEW DASHBOARD
        ========================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header info */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
                Editorial Command Center
              </h1>
              <p className="mt-1 text-xs text-secondary font-normal">
                Real-time performance summary of active dispatches, audience traffic, and staff workflow.
              </p>
            </div>

            {/* Real Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Published
                </span>
                <p className="font-display text-3xl font-bold text-ink mt-1.5">{publishedCount}</p>
                <p className="text-[10px] font-mono text-emerald-400 mt-1">Live in archive</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Drafts
                </span>
                <p className="font-display text-3xl font-bold text-ink mt-1.5">{draftCount}</p>
                <p className="text-[10px] font-mono text-amber-400 mt-1">Pending review</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Scheduled
                </span>
                <p className="font-display text-3xl font-bold text-ink mt-1.5">{scheduledCount}</p>
                <p className="text-[10px] font-mono text-sky-400 mt-1">Embargo queue</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Total Views
                </span>
                <p className="font-display text-3xl font-bold text-accent mt-1.5">
                  {totalViews.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-muted mt-1">Real recorded hits</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Today&apos;s Views
                </span>
                <p className="font-display text-3xl font-bold text-ink mt-1.5">
                  {viewsToday.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-muted mt-1">Since 00:00 UTC</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm col-span-2 lg:col-span-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Top Dispatch
                </span>
                {topArticle && topArticle.views > 0 ? (
                  <div className="mt-1.5">
                    <p className="text-xs font-bold text-ink line-clamp-1">{topArticle.title}</p>
                    <p className="text-[10px] font-mono text-accent font-semibold mt-0.5">
                      {topArticle.views.toLocaleString()} views
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted mt-1.5 italic">Awaiting visits</p>
                )}
              </div>
            </div>

            {/* Quick Editorial Action Bar */}
            <div className="rounded-lg border border-line bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-accent" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                  Editorial Actions
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="rounded-sm bg-accent px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-accent-hover transition-colors"
                >
                  Compose Full Story
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("fast-editor")}
                  className="rounded-sm border border-line bg-surface-elevated px-3 py-1.5 text-xs font-mono text-secondary hover:text-ink hover:border-line-highlight transition-colors"
                >
                  Fast Wire Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus("DRAFT");
                    setActiveTab("articles");
                  }}
                  className="rounded-sm border border-line bg-surface-elevated px-3 py-1.5 text-xs font-mono text-secondary hover:text-ink hover:border-line-highlight transition-colors"
                >
                  Review Drafts ({draftCount})
                </button>
              </div>
            </div>

            {/* Real Activity Stream */}
            <div className="rounded-lg border border-line bg-card overflow-hidden shadow-sm">
              <div className="p-4 border-b border-line bg-surface-elevated flex items-center justify-between">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Recent Telemetry Log (Real Visitor Hits)
                </h3>
                <span className="text-[10px] font-mono text-muted">Deduplicated 30m window</span>
              </div>
              {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                <div className="divide-y divide-line text-xs">
                  {analytics.recentActivity.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-elevated/40 transition-colors">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{item.title}</p>
                        <p className="text-[11px] font-mono text-muted truncate mt-0.5">
                          Referrer: {item.referrer || "Direct / Internal"} • /{item.category}/{item.slug}
                        </p>
                      </div>
                      <time className="font-mono text-[10px] text-secondary shrink-0">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-muted">
                  No visitor hits logged yet today. Read an article on the public edition to register telemetry.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ARTICLE MANAGEMENT (SEARCH, FILTER, SORT, ACTIONS)
        ========================================================================== */}
        {activeTab === "articles" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Title and Create Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
                  Article Management
                </h1>
                <p className="text-xs text-secondary mt-1">
                  Filter, search, review, preview, and update all publication dispatches.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-hover transition-colors shrink-0"
              >
                <span>+ Create Article</span>
              </button>
            </div>

            {/* Filter & Search Control Bar */}
            <div className="rounded-lg border border-line bg-surface p-4 space-y-3.5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by title, author, or tags..."
                    className="w-full rounded-sm border border-line bg-input px-3.5 py-2 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-xs text-muted hover:text-ink"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="md:col-span-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-sm border border-line bg-input px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none font-mono"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="md:col-span-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-sm border border-line bg-input px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none font-mono"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="md:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-sm border border-line bg-input px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none font-mono"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="views-desc">Most Views</option>
                    <option value="title-asc">Title (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Filter Pills Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted pt-1">
                <span>
                  Showing {filteredArticles.length} of {articles.length} dispatches
                </span>
                {(searchQuery || filterCategory !== "ALL" || filterStatus !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterCategory("ALL");
                      setFilterStatus("ALL");
                      setCurrentPage(1);
                    }}
                    className="text-accent hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </div>

            {/* Articles Table */}
            <div className="rounded-lg border border-line bg-card overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-xs font-mono text-muted">
                  Loading editorial index...
                </div>
              ) : paginatedArticles.length === 0 ? (
                <div className="p-12 text-center text-muted space-y-2">
                  <p className="font-semibold text-ink text-sm">No articles match your criteria.</p>
                  <p className="text-xs">Adjust your search term or filter parameters above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-line bg-surface-elevated text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                        <th className="p-3.5 w-14">Media</th>
                        <th className="p-3.5">Title & Excerpt</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Author</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Views</th>
                        <th className="p-3.5">Published</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {paginatedArticles.map((art) => {
                        const statusColor =
                          art.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : art.status === "DRAFT"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/30";

                        return (
                          <tr key={art.id} className="hover:bg-surface-elevated/40 transition-colors">
                            {/* Thumbnail */}
                            <td className="p-3.5">
                              <div className="relative size-12 shrink-0 overflow-hidden rounded-sm border border-line bg-surface">
                                <Image
                                  src={art.featuredImage?.src || "/images/hero.webp"}
                                  alt={art.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            </td>

                            {/* Title & Excerpt */}
                            <td className="p-3.5 max-w-xs sm:max-w-md">
                              <p className="font-semibold text-ink line-clamp-1">{art.title}</p>
                              <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{art.excerpt}</p>
                              <div className="flex items-center gap-2 mt-1 font-mono text-[9.5px]">
                                {art.featured && (
                                  <span className="rounded bg-accent/15 px-1.5 py-0.2 text-accent font-bold">
                                    ★ FEATURED
                                  </span>
                                )}
                                {art.trending && (
                                  <span className="rounded bg-sky-500/15 px-1.5 py-0.2 text-sky-400 font-bold">
                                    ⚡ TRENDING
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3.5">
                              <span className="font-mono text-[11px] font-bold uppercase text-secondary">
                                {art.category}
                              </span>
                            </td>

                            {/* Author */}
                            <td className="p-3.5">
                              <span className="text-secondary">{art.author.name}</span>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${statusColor}`}>
                                {art.status}
                              </span>
                            </td>

                            {/* Views */}
                            <td className="p-3.5 text-right font-mono text-secondary">
                              {(art.views || 0).toLocaleString()}
                            </td>

                            {/* Published Date */}
                            <td className="p-3.5 font-mono text-[11px] text-muted whitespace-nowrap">
                              {formatDate(art.publishedAt)}
                            </td>

                            {/* Contextual Actions */}
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalArticle(art)}
                                  className="rounded px-2 py-1 font-mono text-[10px] text-muted hover:text-ink hover:bg-surface-elevated transition-colors"
                                  title="Quick modal preview"
                                >
                                  Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEdit(art)}
                                  className="rounded bg-surface-secondary px-2.5 py-1 font-mono text-[10px] font-bold text-ink hover:border-line hover:bg-surface-elevated transition-colors"
                                >
                                  Edit
                                </button>
                                {art.status === "PUBLISHED" && (
                                  <Link
                                    href={articleHref(art)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded px-2 py-1 font-mono text-[10px] text-muted hover:text-ink hover:bg-surface-elevated transition-colors"
                                    title="Open live story in new tab"
                                  >
                                    View ↗
                                  </Link>
                                )}
                                {["ADMIN", "EDITOR"].includes(currentUser?.role || "") && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmArticle(art)}
                                    className="rounded px-2 py-1 font-mono text-[10px] text-muted hover:text-accent hover:bg-accent-subtle transition-colors"
                                    title="Delete article"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-line bg-surface-elevated px-4 py-3 text-xs font-mono">
                  <span className="text-muted">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="rounded border border-line bg-surface px-2.5 py-1 text-muted hover:text-ink disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded border border-line bg-surface px-2.5 py-1 text-muted hover:text-ink disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COMPOSER & ARTICLE EDITOR (FULL PRODUCTION WORKFLOW)
        ========================================================================== */}
        {activeTab === "editor" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Header with Status & Save Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                    {editingArticleId ? "Production Article Editor" : "New Story Composer"}
                  </span>
                  {isDirty && (
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[9px] font-mono text-amber-400 font-bold">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink mt-1">
                  {editingArticleId ? "Modify Dispatch" : "Author New Automotive Dispatch"}
                </h1>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditorPreview(!editorPreview)}
                  className="rounded-sm border border-line bg-surface px-3 py-1.5 text-xs font-mono text-muted hover:text-ink transition-colors"
                >
                  {editorPreview ? "Edit Mode" : "Split Live Preview"}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting || galleryUploading}
                  className="rounded-sm bg-accent px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {galleryUploading ? "Uploading photos…" : isSubmitting ? "Saving..." : editingArticleId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </div>

            {/* Editor Workspace: 2-Column Split */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Column (8 cols): Title, Subtitle, Slug, Content */}
              <div className="lg:col-span-8 space-y-5">
                {/* Article Title */}
                <div>
                  <label htmlFor="art-title" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted mb-1">
                    Article Headline *
                  </label>
                  <input
                    id="art-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: prev.slug || generateSlug(title),
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="e.g. The New Ferrari Is Bringing a New Era of Performance"
                    className="w-full rounded-sm border border-line bg-input p-3 text-base sm:text-lg font-bold text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Slug Generator & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="art-slug" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1">
                      URL Slug
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        id="art-slug"
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                          setIsDirty(true);
                        }}
                        className="w-full rounded-sm border border-line bg-input px-3 py-1.5 text-xs font-mono text-secondary focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }))}
                        className="rounded border border-line bg-surface px-2 text-[10px] font-mono text-muted hover:text-ink shrink-0"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="art-subtitle" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1">
                      Sub-Headline / Deck
                    </label>
                    <input
                      id="art-subtitle"
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, subtitle: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Optional editorial deck..."
                      className="w-full rounded-sm border border-line bg-input px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="art-excerpt" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1">
                    Editorial Excerpt / Lead Paragraph *
                  </label>
                  <textarea
                    id="art-excerpt"
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }));
                      setIsDirty(true);
                    }}
                    placeholder="Short summary for card previews and search engines..."
                    className="w-full rounded-sm border border-line bg-input p-3 text-xs sm:text-sm text-secondary focus:border-accent focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Markdown Formatting Toolbar */}
                <div className="rounded-t-sm border-t border-x border-line bg-surface-elevated p-2 flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-[10px] text-muted uppercase mr-1">Insert:</span>
                  {[
                    { label: "H2", insert: "\n\n## Section Headline\n\n" },
                    { label: "H3", insert: "\n\n### Technical Subheading\n\n" },
                    { label: "Quote", insert: '\n\n> "Key driver feedback quote here."\n\n' },
                    { label: "Table", insert: "\n\n| Parameter | Specification |\n| :--- | :--- |\n| Output | 1,000 hp |\n\n" },
                    { label: "Bullet", insert: "\n- Key telemetry point\n- Aerodynamic note\n" },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, content: prev.content + btn.insert }));
                        setIsDirty(true);
                      }}
                      className="rounded bg-surface px-2 py-0.5 text-[10px] text-muted hover:text-ink hover:border-line border border-transparent"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Markdown Editor & Live Preview */}
                <div className={editorPreview ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <label htmlFor="art-content" className="sr-only">Article Content (Markdown)</label>
                    <textarea
                      id="art-content"
                      required
                      rows={18}
                      value={formData.content}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, content: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Write your in-depth automotive report in Markdown..."
                      className="w-full rounded-b-sm border border-line bg-input p-4 font-mono text-xs sm:text-sm text-ink leading-relaxed focus:border-accent focus:outline-none resize-y"
                    />
                  </div>

                  {editorPreview && (
                    <div className="rounded-b-sm border border-line bg-card p-4 overflow-y-auto max-h-[500px] text-xs text-secondary leading-relaxed">
                      <p className="font-mono text-[10px] uppercase text-accent mb-2">Live Preview Snippet:</p>
                      <div className="prose-editorial whitespace-pre-wrap font-sans text-xs">
                        {formData.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Settings (4 cols): Status, Category, Image, SEO */}
              <div className="lg:col-span-4 space-y-5">
                {/* Publication Status & Scheduling */}
                <div className="rounded-lg border border-line bg-card p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink border-b border-line pb-2">
                    Publishing Workflow
                  </h3>

                  <div>
                    <label htmlFor="art-status" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Publication Status
                    </label>
                    <select
                      id="art-status"
                      value={formData.status}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, status: e.target.value as ArticleStatus }));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="DRAFT">Draft (Unpublished)</option>
                      <option value="PUBLISHED">Published (Live Immediately)</option>
                      <option value="SCHEDULED">Scheduled (Embargo Release)</option>
                    </select>
                  </div>

                  {formData.status === "SCHEDULED" && (
                    <div>
                      <label htmlFor="art-scheduled" className="block text-[10px] font-mono uppercase text-muted mb-1">
                        Release Date & Time
                      </label>
                      <input
                        id="art-scheduled"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }));
                          setIsDirty(true);
                        }}
                        className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label htmlFor="art-featured" className="text-xs text-secondary cursor-pointer">
                      Featured Cover Story
                    </label>
                    <input
                      id="art-featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, featured: e.target.checked }));
                        setIsDirty(true);
                      }}
                      className="size-4 accent-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label htmlFor="art-trending" className="text-xs text-secondary cursor-pointer">
                      Trending Telemetry
                    </label>
                    <input
                      id="art-trending"
                      type="checkbox"
                      checked={formData.trending}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, trending: e.target.checked }));
                        setIsDirty(true);
                      }}
                      className="size-4 accent-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="art-readtime" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Reading Time (Minutes)
                    </label>
                    <input
                      id="art-readtime"
                      type="number"
                      min={1}
                      max={60}
                      value={formData.readingTime}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, readingTime: parseInt(e.target.value, 10) || 5 }));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Author */}
                <div className="rounded-lg border border-line bg-card p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink border-b border-line pb-2">
                    Department & Author
                  </h3>

                  <div>
                    <label htmlFor="art-category" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Department
                    </label>
                    <select
                      id="art-category"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, category: e.target.value as CategorySlug }));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.label} ({c.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="art-author" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Author Byline
                    </label>
                    <input
                      id="art-author"
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, authorName: e.target.value }));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="art-tags" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Article Tags (Comma separated)
                    </label>
                    <input
                      id="art-tags"
                      type="text"
                      value={formData.tags}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, tags: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Supercars, V8, Hybrid, Track Test"
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs text-ink focus:border-accent focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <GalleryUploader
                  images={formData.gallery}
                  onUploadingChange={setGalleryUploading}
                  onChange={(images) => {
                    setFormData((prev) => ({
                      ...prev,
                      gallery: images,
                      imageSrc: images[0]?.src || prev.imageSrc,
                      imageAlt: images[0]?.alt || prev.imageAlt,
                    }));
                    setIsDirty(true);
                  }}
                />

                {/* Featured Photography Media */}
                <div className="rounded-lg border border-line bg-card p-4 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                      Featured Photography
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("media")}
                      className="text-[10px] font-mono text-accent hover:underline"
                    >
                      Browse Media
                    </button>
                  </div>

                  {formData.imageSrc && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-sm border border-line bg-surface">
                      <Image
                        src={formData.imageSrc}
                        alt={formData.imageAlt || "Preview"}
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="art-imgsrc" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Image Path or URL
                    </label>
                    <input
                      id="art-imgsrc"
                      type="text"
                      value={formData.imageSrc}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, imageSrc: e.target.value }));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="art-imgalt" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Accessibility Alt Text
                    </label>
                    <input
                      id="art-imgalt"
                      type="text"
                      value={formData.imageAlt}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, imageAlt: e.target.value }));
                        setIsDirty(true);
                      }}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs text-ink focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                {/* SEO Snippet Preview */}
                <div className="rounded-lg border border-line bg-card p-4 space-y-3.5 shadow-sm">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink border-b border-line pb-2">
                    Search Engine Optimization (SERP)
                  </h3>

                  <div>
                    <label htmlFor="art-seotitle" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      SEO Title
                    </label>
                    <input
                      id="art-seotitle"
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, seoTitle: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder={formData.title || "Headline preview..."}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs text-ink focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="art-seodesc" className="block text-[10px] font-mono uppercase text-muted mb-1">
                      Meta Description
                    </label>
                    <textarea
                      id="art-seodesc"
                      rows={2}
                      value={formData.seoDescription}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, seoDescription: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder={formData.excerpt || "Brief search snippet..."}
                      className="w-full rounded-sm border border-line bg-input p-2 text-xs text-secondary focus:border-accent focus:outline-none"
                    />
                  </div>

                  {/* Google SERP Simulated Preview */}
                  <div className="rounded border border-line bg-surface p-2.5 space-y-1 text-xs">
                    <p className="text-[10px] font-mono text-muted uppercase">Google SERP Preview:</p>
                    <p className="text-sky-400 font-medium truncate">
                      {formData.seoTitle || formData.title || "VELOCITY VERSE Story Title"}
                    </p>
                    <p className="text-[10px] text-emerald-400 truncate font-mono">
                      velocityverse.com/{formData.category}/{formData.slug || "story-slug"}
                    </p>
                    <p className="text-[11px] text-muted line-clamp-2">
                      {formData.seoDescription || formData.excerpt || "The definitive performance telemetry analysis."}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 4: FAST ARTICLE EDITOR (STREAMLINED WIRE COMPOSER)
        ========================================================================== */}
        {activeTab === "fast-editor" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                  Rapid News Desk
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink mt-1">
                Fast Article Dispatcher
              </h1>
              <p className="text-xs text-secondary mt-1">
                Optimized 2-minute workflow for breaking paddock announcements, race results, and emergency manufacturer press releases.
              </p>
            </div>

            <form onSubmit={handleFastSubmit} className="rounded-lg border border-line bg-card p-6 space-y-5 shadow-sm">
              <div>
                <label htmlFor="fast-title" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted mb-1.5">
                  Breaking Headline *
                </label>
                <input
                  id="fast-title"
                  type="text"
                  required
                  value={fastTitle}
                  onChange={(e) => setFastTitle(e.target.value)}
                  placeholder="e.g. Breaking: New World Hypercar Lap Record Established at Nürburgring"
                  className="w-full rounded-sm border border-line bg-input p-3 text-base font-bold text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fast-category" className="block text-[10px] font-mono uppercase text-muted mb-1">
                    Department
                  </label>
                  <select
                    id="fast-category"
                    value={fastCategory}
                    onChange={(e) => setFastCategory(e.target.value as CategorySlug)}
                    className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fast-status" className="block text-[10px] font-mono uppercase text-muted mb-1">
                    Initial Status
                  </label>
                  <select
                    id="fast-status"
                    value={fastStatus}
                    onChange={(e) => setFastStatus(e.target.value as ArticleStatus)}
                    className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="PUBLISHED">Publish Instantly (Live)</option>
                    <option value="DRAFT">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="fast-excerpt" className="block text-[10px] font-mono uppercase text-muted mb-1">
                  Bullet Summary / Excerpt *
                </label>
                <textarea
                  id="fast-excerpt"
                  required
                  rows={2}
                  value={fastExcerpt}
                  onChange={(e) => setFastExcerpt(e.target.value)}
                  placeholder="Concise wire statement..."
                  className="w-full rounded-sm border border-line bg-input p-3 text-xs text-secondary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="fast-content" className="block text-[10px] font-mono uppercase text-muted mb-1">
                  Full Dispatch Details (Markdown)
                </label>
                <textarea
                  id="fast-content"
                  rows={6}
                  value={fastContent}
                  onChange={(e) => setFastContent(e.target.value)}
                  placeholder="In-depth report body or official telemetry quotes..."
                  className="w-full rounded-sm border border-line bg-input p-3 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="fast-image" className="block text-[10px] font-mono uppercase text-muted mb-1">
                  Featured Photography Asset
                </label>
                <select
                  id="fast-image"
                  value={fastImage}
                  onChange={(e) => setFastImage(e.target.value)}
                  className="w-full rounded-sm border border-line bg-input p-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                >
                  {MEDIA_LIBRARY_ITEMS.map((med) => (
                    <option key={med.id} value={med.src}>
                      {med.name} ({med.category})
                    </option>
                  ))}
                </select>
              </div>

              <GalleryUploader
                images={fastGallery}
                onUploadingChange={setGalleryUploading}
                onChange={(images) => {
                  setFastGallery(images);
                  if (images[0]) setFastImage(images[0].src);
                }}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || galleryUploading}
                  className="w-full rounded-sm bg-accent py-3 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Broadcasting Dispatch..." : "⚡ Broadcast Fast Dispatch Now"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 5: READERSHIP ANALYTICS (REAL TELEMETRY AUDIENCE DATA)
        ========================================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                  Verified Readership Telemetry
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink mt-1">
                Audience & Readership Analytics
              </h1>
              <p className="text-xs text-secondary mt-1">
                Deduplicated, bot-filtered real metrics generated directly from SQLite view logs. No synthetic numbers.
              </p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Total Recorded Views
                </span>
                <p className="font-display text-3xl font-bold text-accent mt-1.5">
                  {totalViews.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-muted mt-1">Direct from database</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Today&apos;s Readership
                </span>
                <p className="font-display text-3xl font-bold text-ink mt-1.5">
                  {viewsToday.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-emerald-400 mt-1">Real visitors today</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Avg Views / Story
                </span>
                <p className="font-display text-3xl font-bold text-ink mt-1.5">
                  {publishedCount > 0 ? Math.round(totalViews / publishedCount).toLocaleString() : 0}
                </p>
                <p className="text-[10px] font-mono text-muted mt-1">Across published archive</p>
              </div>

              <div className="rounded-lg border border-line bg-card p-4 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Top Category
                </span>
                <p className="font-display text-2xl font-bold text-ink mt-1.5 uppercase truncate">
                  {topArticle?.category || "Supercars"}
                </p>
                <p className="text-[10px] font-mono text-accent mt-1">Leading engagement</p>
              </div>
            </div>

            {/* Top 10 Ranked Articles by Views */}
            <div className="rounded-lg border border-line bg-card overflow-hidden shadow-sm">
              <div className="p-4 border-b border-line bg-surface-elevated">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Top Performing Stories by Recorded Views
                </h3>
              </div>
              <div className="divide-y divide-line">
                {articles
                  .slice()
                  .sort((a, b) => (b.views || 0) - (a.views || 0))
                  .slice(0, 8)
                  .map((art, idx) => {
                    const maxViews = articles[0]?.views || 1;
                    const percent = Math.min(100, Math.round(((art.views || 0) / maxViews) * 100));

                    return (
                      <div key={art.id} className="p-4 hover:bg-surface-elevated/40 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-xs font-bold text-accent w-5 shrink-0">
                              0{idx + 1}
                            </span>
                            <span className="font-semibold text-ink truncate">{art.title}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-accent shrink-0 ml-3">
                            {(art.views || 0).toLocaleString()} views
                          </span>
                        </div>
                        {/* Relative performance bar */}
                        <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: MEDIA LIBRARY (EDITORIAL ASSET MANAGER)
        ========================================================================== */}
        {activeTab === "media" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                    Asset Repository
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink mt-1">
                  High-Resolution Media Library
                </h1>
                <p className="text-xs text-secondary mt-1">
                  High-resolution automotive photography assets ready for editorial composition.
                </p>
              </div>

              {copiedUrl && (
                <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] text-emerald-400">
                  Copied: {copiedUrl}
                </div>
              )}
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MEDIA_LIBRARY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg border border-line bg-card overflow-hidden shadow-sm hover:border-line-highlight transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
                    <Image
                      src={item.src}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute top-2.5 right-2.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] text-zinc-300">
                      {item.aspect}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h4 className="font-semibold text-xs text-ink truncate">{item.name}</h4>
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                      <span>{item.dimensions}</span>
                      <span className="uppercase text-accent">{item.category}</span>
                    </div>

                    <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.src)}
                        className="rounded border border-line bg-surface px-2 py-1 font-mono text-[10px] text-muted hover:text-ink hover:border-line-highlight transition-colors flex-1"
                      >
                        {copiedUrl === item.src ? "Copied!" : "Copy Path"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, imageSrc: item.src, imageAlt: item.name }));
                          setActiveTab("editor");
                        }}
                        className="rounded bg-accent/15 px-2 py-1 font-mono text-[10px] text-accent hover:bg-accent hover:text-white transition-colors"
                      >
                        Use in Editor
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          INTERACTIVE MODAL: QUICK ARTICLE PREVIEW
      ========================================================================== */}
      {previewModalArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewModalArticle(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg border border-line bg-surface p-6 sm:p-8 shadow-2xl glass-panel animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <div className="flex items-center gap-2 font-mono text-xs text-accent">
                <span className="size-2 rounded-full bg-accent" />
                <span className="uppercase font-bold">Article Preview Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalArticle(null)}
                className="rounded border border-line px-2 py-1 font-mono text-xs text-muted hover:text-ink"
              >
                Close (ESC)
              </button>
            </div>

            <div className="space-y-4">
              <span className="rounded-xs bg-accent px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                {previewModalArticle.category}
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase leading-tight text-ink">
                {previewModalArticle.title}
              </h2>

              {previewModalArticle.subtitle && (
                <p className="text-sm text-secondary italic">{previewModalArticle.subtitle}</p>
              )}

              {previewModalArticle.featuredImage && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line my-4">
                  <Image
                    src={previewModalArticle.featuredImage.src}
                    alt={previewModalArticle.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 text-xs font-mono text-muted border-y border-line py-2.5">
                <span>By {previewModalArticle.author.name}</span>
                <span>•</span>
                <span>{previewModalArticle.readingTime} min read</span>
                <span>•</span>
                <span>{formatDate(previewModalArticle.publishedAt)}</span>
              </div>

              <div className="text-xs sm:text-sm text-secondary whitespace-pre-wrap leading-relaxed pt-2">
                {previewModalArticle.excerpt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE MODAL: DELETE CONFIRMATION
      ========================================================================== */}
      {deleteConfirmArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setDeleteConfirmArticle(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-accent/40 bg-surface p-6 shadow-2xl glass-panel animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-accent font-mono text-xs font-bold uppercase mb-3">
              <span className="size-2 rounded-full bg-accent animate-ping" />
              <span>Confirm Destructive Deletion</span>
            </div>

            <h3 className="font-display text-lg font-bold uppercase text-ink">
              Permanently delete this dispatch?
            </h3>

            <p className="text-xs text-secondary mt-2 leading-relaxed">
              You are about to delete <strong className="text-ink">&quot;{deleteConfirmArticle.title}&quot;</strong> from the database. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmArticle(null)}
                className="rounded-sm border border-line bg-surface px-4 py-2 text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="rounded-sm bg-accent px-4 py-2 font-bold uppercase tracking-wider text-white hover:bg-accent-hover transition-colors shadow-sm"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
