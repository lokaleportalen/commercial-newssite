import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq, ne, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Fetch the current article
    const [currentArticle] = await db
      .select()
      .from(article)
      .where(eq(article.id, id))
      .limit(1);

    if (!currentArticle || !currentArticle.categories) {
      return NextResponse.json({ articles: [] });
    }

    // Parse categories from the current article
    const currentCategories = currentArticle.categories
      .split(",")
      .map((cat) => cat.trim());

    // Fetch related articles based on shared categories
    // We'll use LIKE queries to match categories
    const relatedArticles = await db
      .select({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        image: article.image,
        publishedDate: article.publishedDate,
        categories: article.categories,
      })
      .from(article)
      .where(
        sql`${article.status} = 'published'
        AND ${article.id} != ${id}
        AND (${sql.join(
          currentCategories.map(
            (cat) => sql`${article.categories} LIKE ${`%${cat}%`}`
          ),
          sql` OR `
        )})`
      )
      .orderBy(desc(article.publishedDate))
      .limit(4);

    return NextResponse.json({ articles: relatedArticles });
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch related articles" },
      { status: 500 }
    );
  }
}
