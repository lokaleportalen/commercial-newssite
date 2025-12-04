import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { article, category, articleCategory } from "@/database/schema";
import { or, desc, eq, and, inArray, sql } from "drizzle-orm";
import { getArticleCategoriesBulk } from "@/lib/category-helpers";

/**
 * GET /api/articles
 * List published articles with optional search
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let articles;

    if (search) {
      // Prepare search query for PostgreSQL full-text search
      const searchQuery = search.trim().split(/\s+/).join(' & ');

      // Subquery to find articles that have a category matching the search (using FTS)
      const categoryMatchingArticles = db
        .select({ articleId: articleCategory.articleId })
        .from(articleCategory)
        .innerJoin(category, eq(articleCategory.categoryId, category.id))
        .where(sql`to_tsvector('danish', ${category.name} || ' ' || COALESCE(${category.description}, '')) @@ to_tsquery('danish', ${searchQuery})`);

      // Search published articles using full-text search with relevance ranking
      articles = await db
        .select()
        .from(article)
        .where(
          and(
            or(
              // Full-text search on article content (title, summary, content)
              sql`to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')) @@ to_tsquery('danish', ${searchQuery})`,
              // Also include articles with matching categories
              inArray(article.id, categoryMatchingArticles)
            ),
            eq(article.status, "published")
          )
        )
        // Order by relevance (rank) then by published date
        .orderBy(
          sql`ts_rank(to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')), to_tsquery('danish', ${searchQuery})) DESC`,
          desc(article.publishedDate)
        );
    } else {
      // Get all published articles
      articles = await db
        .select()
        .from(article)
        .where(eq(article.status, "published"))
        .orderBy(desc(article.publishedDate));
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
