import { db } from "@/database/db";
import { category, article } from "@/database/schema";
import { sql, eq } from "drizzle-orm";
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

    // Get article count for each category
    // Since categories are stored as comma-separated strings in articles
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const categoryPattern = `%${cat.name}%`;
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(article)
          .where(
            sql`${article.status} = 'published' AND ${article.categories} LIKE ${categoryPattern}`
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
