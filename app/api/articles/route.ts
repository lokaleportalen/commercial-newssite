import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { or, ilike, desc, asc, eq, and, sql } from "drizzle-orm";

/**
 * GET /api/articles
 * List published articles with optional search, category filter, and sort
 * Query params:
 *   - search: Search term for title, summary, or categories
 *   - category: Filter by category name
 *   - sort: Sort order ('date-desc' | 'date-asc' | 'title-asc' | 'title-desc')
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "date-desc";

    // Build WHERE conditions
    const conditions = [eq(article.status, "published")];

    // Add search condition
    if (search) {
      conditions.push(
        or(
          ilike(article.title, `%${search}%`),
          ilike(article.summary, `%${search}%`),
          ilike(article.categories, `%${search}%`)
        )!
      );
    }

    // Add category filter
    if (category && category !== "all") {
      conditions.push(ilike(article.categories, `%${category}%`));
    }

    // Determine sort order
    let orderByClause;
    switch (sort) {
      case "date-asc":
        orderByClause = asc(article.publishedDate);
        break;
      case "title-asc":
        orderByClause = asc(article.title);
        break;
      case "title-desc":
        orderByClause = desc(article.title);
        break;
      case "date-desc":
      default:
        orderByClause = desc(article.publishedDate);
        break;
    }

    // Execute query
    const articles = await db
      .select()
      .from(article)
      .where(and(...conditions))
      .orderBy(orderByClause);

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
