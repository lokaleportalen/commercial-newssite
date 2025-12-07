import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { article, category, articleCategory } from "@/database/schema";
import { or, desc, asc, eq, and, inArray, sql } from "drizzle-orm";
import { getArticleCategoriesBulk } from "@/lib/category-helpers";

/**
 * GET /api/articles
 * List published articles with optional search, category filter, sort, and pagination
 * Query params:
 *   - search: Search term for title, summary, content, or categories
 *   - category: Filter by category slug or name
 *   - sort: Sort order ('date-desc' | 'date-asc' | 'title-asc' | 'title-desc')
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 15)
 *   - includeHero: Include hero articles count in pagination (default: false)
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const categoryFilter = searchParams.get("category");
    const sort = searchParams.get("sort") || "date-desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const includeHero = searchParams.get("includeHero") === "true";

    let articles;

    // Build base query conditions
    const conditions = [eq(article.status, "published")];

    // Add category filter if provided (supports both slug and name)
    if (categoryFilter && categoryFilter !== "all") {
      // Find articles that have this category (by slug or name)
      const articlesWithCategory = db
        .select({ articleId: articleCategory.articleId })
        .from(articleCategory)
        .innerJoin(category, eq(articleCategory.categoryId, category.id))
        .where(or(eq(category.slug, categoryFilter), eq(category.name, categoryFilter)));

      conditions.push(inArray(article.id, articlesWithCategory));
    }

    // Add search condition
    if (search) {
      // Prepare search query for PostgreSQL full-text search
      const searchQuery = search.trim().split(/\s+/).join(' & ');

      // Subquery to find articles that have a category matching the search (using FTS)
      const categoryMatchingArticles = db
        .select({ articleId: articleCategory.articleId })
        .from(articleCategory)
        .innerJoin(category, eq(articleCategory.categoryId, category.id))
        .where(sql`to_tsvector('danish', ${category.name} || ' ' || COALESCE(${category.description}, '')) @@ to_tsquery('danish', ${searchQuery})`);

      conditions.push(
        or(
          // Full-text search on article content (title, summary, content)
          sql`to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')) @@ to_tsquery('danish', ${searchQuery})`,
          // Also include articles with matching categories
          inArray(article.id, categoryMatchingArticles)
        )!
      );
    }

    // Determine sort order
    let orderByClause;
    if (search && sort === "date-desc") {
      // When searching, order by relevance first, then date
      const searchQuery = search.trim().split(/\s+/).join(' & ');
      orderByClause = [
        sql`ts_rank(to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')), to_tsquery('danish', ${searchQuery})) DESC`,
        desc(article.publishedDate)
      ];
    } else {
      // Use specified sort order
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
    }

    // Execute query
    const queryBuilder = db
      .select()
      .from(article)
      .where(and(...conditions));

    if (Array.isArray(orderByClause)) {
      articles = await queryBuilder.orderBy(...orderByClause);
    } else {
      articles = await queryBuilder.orderBy(orderByClause);
    }

    // Fetch categories for all articles in bulk
    const articleIds = articles.map((a) => a.id);
    const categoriesMap = await getArticleCategoriesBulk(articleIds);

    // Merge categories into articles
    const articlesWithCategories = articles.map((art) => ({
      ...art,
      categories: categoriesMap.get(art.id) || [],
    }));

    return NextResponse.json(
      { articles: articlesWithCategories },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
