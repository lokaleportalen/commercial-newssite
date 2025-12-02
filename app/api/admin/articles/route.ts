import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { article, aiPrompt } from "@/database/schema";
import { or, like, desc, eq } from "drizzle-orm";

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
      // Search articles by title, summary, or categories
      articlesData = await db
        .select({
          article: article,
          prompt: aiPrompt,
        })
        .from(article)
        .leftJoin(aiPrompt, eq(article.promptId, aiPrompt.id))
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
