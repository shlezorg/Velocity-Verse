import { NextResponse } from "next/server";
import { getAllArticles, createArticle } from "@/lib/articles";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get("all") === "true";

  let includeAll = false;
  if (wantsAll) {
    const user = await getSessionUser();
    // Only authenticated staff with ADMIN, EDITOR, or AUTHOR role can view unpublished drafts
    if (user && ["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      includeAll = true;
    }
  }

  const articles = await getAllArticles(includeAll);
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Staff authentication required to create articles" },
        { status: 401 }
      );
    }

    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to publish content" },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (body.gallery !== undefined) {
      if (!Array.isArray(body.gallery) || body.gallery.length > 10 || 
          body.gallery.some((img: unknown) => !img || typeof img !== "object" ||
            typeof (img as {src?:unknown}).src !== "string" ||
            !(/^\/(api\/media\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|avif)|images\/[a-z0-9._-]+)$/i).test((img as {src:string}).src) ||
            typeof (img as {src:string}).src.length > 512)) {
        return NextResponse.json({ error: "Gallery must contain up to 10 valid website image paths." }, { status: 400 });
      }
      body.gallery = body.gallery.map((img: {src:string;alt?:string;caption?:string}) => ({
        src: img.src, alt: String(img.alt || body.title || "Automotive photograph").slice(0, 300),
        caption: String(img.caption || "").slice(0, 500),
      }));
    }

    // If an AUTHOR creates an article, enforce DRAFT status
    let status = (body.status || "DRAFT").toUpperCase();
    if (user.role === "AUTHOR") {
      status = "DRAFT";
    }

    // Normalize tags
    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
      ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    // Normalize featuredImage
    let featuredImage = body.featuredImage;
    if (typeof featuredImage === "string") {
      featuredImage = {
        src: featuredImage,
        alt: body.title || "Editorial image",
        caption: body.title || "",
      };
    } else if (!featuredImage || !featuredImage.src) {
      featuredImage = {
        src: "/images/hero.webp",
        alt: body.title || "Editorial image",
        caption: body.title || "",
      };
    }

    // Normalize author
    let author = body.author;
    if (!author || !author.name) {
      author = {
        id: user.id || "auth-1",
        name: user.name || "Editorial Staff",
        slug: (user.name || "editorial-staff").toLowerCase().replace(/\s+/g, "-"),
        role: user.role === "ADMIN" ? "Chief Technical Editor" : user.role === "EDITOR" ? "Senior Editor" : "Contributing Author",
        avatar: user.avatar || "/images/author-avatar.jpg",
      };
    }

    const payload = {
      ...body,
      status,
      tags,
      featuredImage,
      author,
      readingTime: typeof body.readingTime === "number" ? body.readingTime : parseInt(body.readingTime, 10) || 5,
    };

    const newArticle = await createArticle(payload);
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error: any) {
    console.error("Article creation error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create article" }, { status: 400 });
  }
}
