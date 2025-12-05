import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq } from "drizzle-orm";
import {
  resolveCategoryIds,
  updateArticleCategories,
  getArticleCategories,
} from "@/lib/category-helpers";

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

    // Fetch categories from junction table
    const categories = await getArticleCategories(id);

    return NextResponse.json(
      {
        article: {
          ...articles[0],
          categories,
        },
      },
      { status: 200 }
    );
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
      sources,
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

    // Process sources - ensure it's an array
    let sourcesArray: string[] | undefined = undefined;
    if (sources !== undefined) {
      if (Array.isArray(sources)) {
        sourcesArray = sources.filter(s => typeof s === 'string' && s.trim().length > 0);
      } else if (typeof sources === 'string') {
        sourcesArray = sources.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      } else {
        sourcesArray = [];
      }
    }

    // Update article fields (excluding categories which are handled separately)
    const updatedArticles = await db
      .update(article)
      .set({
        title,
        slug,
        content,
        summary,
        metaDescription,
        image,
        ...(sourcesArray !== undefined && { sources: sourcesArray }),
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

    // Update categories in junction table if provided
    if (categories !== undefined) {
      if (Array.isArray(categories)) {
        const { ids: categoryIds, unknown } =
          await resolveCategoryIds(categories);

        if (unknown.length > 0) {
          return NextResponse.json(
            {
              error: "Invalid categories",
              unknown,
              message: `Unknown categories: ${unknown.join(", ")}`,
            },
            { status: 400 }
          );
        }

        await updateArticleCategories(id, categoryIds);
      } else {
        return NextResponse.json(
          { error: "Categories must be an array" },
          { status: 400 }
        );
      }
    }

    // Fetch updated categories
    const updatedCategories = await getArticleCategories(id);

    return NextResponse.json(
      {
        article: {
          ...updatedArticles[0],
          categories: updatedCategories,
        },
        message: "Article updated successfully",
      },
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
