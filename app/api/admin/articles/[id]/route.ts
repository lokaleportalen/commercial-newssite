import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/articles/[id]
 * Get a single article by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const articles = await db
      .select()
      .from(article)
      .where(eq(article.id, id))
      .limit(1);

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article: articles[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching article:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/articles/[id]
 * Update an article
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const {
      title,
      slug,
      content,
      summary,
      metaDescription,
      image,
      sourceUrl,
      categories,
      status,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Update the article
    const updatedArticles = await db
      .update(article)
      .set({
        title,
        slug,
        content,
        summary,
        metaDescription,
        image,
        sourceUrl,
        categories,
        status,
        updatedAt: new Date(),
      })
      .where(eq(article.id, id))
      .returning();

    if (!updatedArticles || updatedArticles.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { article: updatedArticles[0], message: "Article updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating article:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/articles/[id]
 * Delete an article
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const deletedArticles = await db
      .delete(article)
      .where(eq(article.id, id))
      .returning();

    if (!deletedArticles || deletedArticles.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Article deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting article:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
