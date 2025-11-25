import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { article } from "@/database/schema";
import { or, like, desc } from "drizzle-orm";

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

    let articles;

    if (search) {
      // Search articles by title, summary, or categories
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
        .orderBy(desc(article.createdAt));
    } else {
      // Get all articles
      articles = await db
        .select()
        .from(article)
        .orderBy(desc(article.createdAt));
    }

    return NextResponse.json({ articles }, { status: 200 });
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
