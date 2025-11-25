import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { eq, and } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/articles/slug/[slug]
 * Get a single published article by slug
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    const articles = await db
      .select()
      .from(article)
      .where(
        and(
          eq(article.slug, slug),
          eq(article.status, "published")
        )
      )
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
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
