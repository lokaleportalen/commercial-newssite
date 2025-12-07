import { db } from "@/database/db";
import { category, article, articleCategory } from "@/database/schema";
import { sql, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all categories with article counts
    const categories = await db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      })
      .from(category)
      .orderBy(category.name);

    // Get article count for each category using junction table
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const countResult = await db
          .select({ count: sql<number>`count(DISTINCT ${article.id})` })
          .from(article)
          .innerJoin(articleCategory, eq(article.id, articleCategory.articleId))
          .where(
            and(
              eq(article.status, "published"),
              eq(articleCategory.categoryId, cat.id)
            )
          );

        return {
          ...cat,
          articleCount: Number(countResult[0]?.count || 0),
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
