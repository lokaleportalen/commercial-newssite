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

/**
 * POST /api/admin/articles
 * Create a new article
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const body = await request.json();
    const { title, slug, content, summary, metaDescription, image, sources, categories, status } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    // Process sources - ensure it's an array
    let sourcesArray: string[] = [];
    if (sources) {
      if (Array.isArray(sources)) {
        sourcesArray = sources.filter(s => typeof s === 'string' && s.trim().length > 0);
      } else if (typeof sources === 'string') {
        sourcesArray = sources.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      }
    }

    // Create the article
    const [newArticle] = await db
      .insert(article)
      .values({
        title,
        slug,
        content,
        summary: summary || null,
        metaDescription: metaDescription || null,
        image: image || null,
        sources: sourcesArray,
        status: status || "draft",
        publishedDate: new Date(),
      })
      .returning();

    // Handle categories if provided
    if (categories) {
      const categoryNames = typeof categories === "string"
        ? categories.split(",").map((c: string) => c.trim()).filter((c: string) => c)
        : Array.isArray(categories)
        ? categories
        : [];

      if (categoryNames.length > 0) {
        // Get or create categories
        for (const categoryName of categoryNames) {
          // Check if category exists
          const [existingCategory] = await db
            .select()
            .from(category)
            .where(eq(category.name, categoryName))
            .limit(1);

          let categoryId: string;

          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            // Create new category
            const categorySlug = categoryName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "");
            const [newCategory] = await db
              .insert(category)
              .values({
                name: categoryName,
                slug: categorySlug,
              })
              .returning();
            categoryId = newCategory.id;
          }

          // Link article to category
          await db.insert(articleCategory).values({
            articleId: newArticle.id,
            categoryId,
          });
        }
      }
    }

    // Fetch the created article with categories
    const [articleData] = await db
      .select({
        article: article,
        prompt: aiPrompt,
      })
      .from(article)
      .leftJoin(aiPrompt, eq(article.promptId, aiPrompt.id))
      .where(eq(article.id, newArticle.id));

    const categoriesMap = await getArticleCategoriesBulk([newArticle.id]);
    const articleWithCategories = {
      ...articleData.article,
      prompt: articleData.prompt,
      categories: categoriesMap.get(newArticle.id) || [],
    };

    return NextResponse.json(
      { article: articleWithCategories },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating article:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Check for unique constraint violation (duplicate slug)
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "An article with this slug already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
