import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { or, like, desc, eq } from "drizzle-orm";

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
      // Search published articles by title, summary, or categories
      articles = await db
        .select()
        .from(article)
        .where(
          or(
            like(article.title, `%${search}%`),
            like(article.summary, `%${search}%`),
            like(article.categories, `%${search}%`)
          )
        )
        .where(eq(article.status, "published"))
        .orderBy(desc(article.publishedDate));
    } else {
      // Get all published articles
      articles = await db
        .select()
        .from(article)
        .where(eq(article.status, "published"))
        .orderBy(desc(article.publishedDate));
    }

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
