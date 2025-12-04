import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { article, aiPrompt, category, articleCategory } from "@/database/schema";
import { or, desc, eq, inArray, sql } from "drizzle-orm";
import { getArticleCategoriesBulk } from "@/lib/category-helpers";

/**
 * GET /api/admin/articles
 * List all articles with optional search
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let articlesData;

    if (search) {
      // Prepare search query for PostgreSQL full-text search
      const searchQuery = search.trim().split(/\s+/).join(' & ');

      // Subquery to find articles that have a category matching the search (using FTS)
      const categoryMatchingArticles = db
        .select({ articleId: articleCategory.articleId })
        .from(articleCategory)
        .innerJoin(category, eq(articleCategory.categoryId, category.id))
        .where(sql`to_tsvector('danish', ${category.name} || ' ' || COALESCE(${category.description}, '')) @@ to_tsquery('danish', ${searchQuery})`);

      // Search articles using full-text search with relevance ranking
      articlesData = await db
        .select({
          article: article,
          prompt: aiPrompt,
        })
        .from(article)
        .leftJoin(aiPrompt, eq(article.promptId, aiPrompt.id))
        .where(
          or(
            // Full-text search on article content
            sql`to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')) @@ to_tsquery('danish', ${searchQuery})`,
            // Also include articles with matching categories
            inArray(article.id, categoryMatchingArticles)
          )
        )
        // Order by relevance (rank) then by created date
        .orderBy(
          sql`ts_rank(to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')), to_tsquery('danish', ${searchQuery})) DESC`,
          desc(article.createdAt)
        );
    } else {
      // Get all articles
      articlesData = await db
        .select({
          article: article,
          prompt: aiPrompt,
        })
        .from(article)
        .leftJoin(aiPrompt, eq(article.promptId, aiPrompt.id))
        .orderBy(desc(article.createdAt));
    }

    // Transform the data to include prompt info
    const articles = articlesData.map((row) => ({
      ...row.article,
      prompt: row.prompt,
    }));

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

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
