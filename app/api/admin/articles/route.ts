import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import {
  article,
  aiPrompt,
  category,
  articleCategory,
} from "@/database/schema";
import { or, desc, eq, inArray, sql } from "drizzle-orm";
import { getArticleCategoriesBulk } from "@/lib/category-helpers";
import { createArticleSchema, validateSchema } from "@/lib/validation";

/**
 * GET /api/admin/articles
 * List all articles with optional search
 */

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    let articlesData;

    if (search) {
      const searchQuery = search.trim().split(/\s+/).join(" & ");

      const categoryMatchingArticles = db
        .select({ articleId: articleCategory.articleId })
        .from(articleCategory)
        .innerJoin(category, eq(articleCategory.categoryId, category.id))
        .where(
          sql`to_tsvector('danish', ${category.name} || ' ' || COALESCE(${category.description}, '')) @@ to_tsquery('danish', ${searchQuery})`
        );

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
            sql`to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')) @@ to_tsquery('danish', ${searchQuery})`,
            inArray(article.id, categoryMatchingArticles)
          )
        )
        .orderBy(
          sql`ts_rank(to_tsvector('danish', ${article.title} || ' ' || COALESCE(${article.summary}, '') || ' ' || COALESCE(${article.content}, '')), to_tsquery('danish', ${searchQuery})) DESC`,
          desc(article.createdAt)
        );
    } else {
      articlesData = await db
        .select({
          article: article,
          prompt: aiPrompt,
        })
        .from(article)
        .leftJoin(aiPrompt, eq(article.promptId, aiPrompt.id))
        .orderBy(desc(article.createdAt));
    }

    const articles = articlesData.map((row) => ({
      ...row.article,
      prompt: row.prompt,
    }));

    const articleIds = articles.map((a) => a.id);
    const categoriesMap = await getArticleCategoriesBulk(articleIds);

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

    // Validate input with Zod schema
    const validation = validateSchema(createArticleSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

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
    } = validation.data;

    // Process sources - ensure it's an array
    let sourcesArray: string[] = [];
    if (sources) {
      if (Array.isArray(sources)) {
        sourcesArray = sources;
      } else if (typeof sources === "string") {
        sourcesArray = sources
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    const articleStatus = status || "draft";
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
        status: articleStatus,
        publishedDate: articleStatus === "published" ? new Date() : undefined,
      })
      .returning();

    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const categoryId of categories) {
        await db.insert(articleCategory).values({
          articleId: newArticle.id,
          categoryId,
        });
      }
    }

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
      if (
        error.message.includes("unique") ||
        error.message.includes("duplicate")
      ) {
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
