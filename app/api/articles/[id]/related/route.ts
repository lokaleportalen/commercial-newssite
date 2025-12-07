import { db } from "@/database/db";
import { article, articleCategory } from "@/database/schema";
import { eq, ne, desc, inArray, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getArticleCategories, getArticleCategoriesBulk } from "@/lib/category-helpers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Fetch the current article's categories from junction table
    const currentCategories = await getArticleCategories(id);

    if (currentCategories.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    // Get category IDs
    const categoryIds = currentCategories.map((cat) => cat.id);

    // Find articles that share categories with this article
    const articlesWithSharedCategories = db
      .select({ articleId: articleCategory.articleId })
      .from(articleCategory)
      .where(inArray(articleCategory.categoryId, categoryIds));

    // Fetch related articles (published, not current article, shared categories)
    const relatedArticles = await db
      .select()
      .from(article)
      .where(
        and(
          inArray(article.id, articlesWithSharedCategories),
          eq(article.status, "published"),
          ne(article.id, id)
        )
      )
      .orderBy(desc(article.publishedDate))
      .limit(4);

    // Fetch categories for all related articles
    const articleIds = relatedArticles.map((a) => a.id);
    const categoriesMap = await getArticleCategoriesBulk(articleIds);

    // Merge categories into articles
    const articlesWithCategories = relatedArticles.map((art) => ({
      ...art,
      categories: categoriesMap.get(art.id) || [],
    }));

    return NextResponse.json({ articles: articlesWithCategories });
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch related articles" },
      { status: 500 }
    );
  }
}
