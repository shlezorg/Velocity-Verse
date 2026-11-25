import { NextResponse } from "next/server";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/articles";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  // If article is draft or scheduled, verify staff authentication
  if (article.status !== "PUBLISHED") {
    const user = await getSessionUser();
    if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
  }

  return NextResponse.json(article);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Server-side Authorization Check
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 }
    );
  }

  if (!["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to modify articles" },
      { status: 403 }
    );
  }

  try {
    const existing = await getArticleById(id);
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updates = await request.json();
    if (updates.gallery !== undefined) {
      if (!Array.isArray(updates.gallery) || updates.gallery.length > 10 || 
          updates.gallery.some((img: unknown) => !img || typeof img !== "object" ||
            typeof (img as {src?:unknown}).src !== "string" ||
            !(/^\/(api\/media\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|avif)|images\/[a-z0-9._-]+)$/i).test((img as {src:string}).src) ||
            typeof (img as {src:string}).src.length > 512)) {
        return NextResponse.json({ error: "Gallery must contain up to 10 valid website image paths." }, { status: 400 });
      }
      updates.gallery = updates.gallery.map((img: {src:string;alt?:string;caption?:string}) => ({
        src: img.src, alt: String(img.alt || updates.title || "Automotive photograph").slice(0, 300),
        caption: String(img.caption || "").slice(0, 500),
      }));
    }

    // Authors cannot publish or modify other authors' articles
    if (user.role === "AUTHOR") {
      if (existing.author.id !== user.id && existing.author.name !== user.name) {
        return NextResponse.json(
          { error: "Forbidden: Authors can only edit their own draft articles" },
          { status: 403 }
        );
      }
      // Cannot set to PUBLISHED
      if (updates.status === "PUBLISHED") {
        updates.status = "DRAFT";
      }
    }

    const updated = await updateArticle(id, updates);
    if (!updated) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Article update error:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Server-side Authorization Check: Only ADMIN and EDITOR can delete
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 }
    );
  }

  if (!["ADMIN", "EDITOR"].includes(user.role)) {
    return NextResponse.json(
      { error: "Forbidden: Only Editors and Administrators can delete articles" },
      { status: 403 }
    );
  }

  const success = await deleteArticle(id);
  if (!success) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
