import { NextResponse } from "next/server";
import { db } from "@/database/db";
import { category } from "@/database/schema/categories-schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * GET /api/admin/categories
 * Fetch all categories sorted alphabetically
 */
export async function GET() {
  try {
    // Verify user is admin
    await requireAdmin();

    const categories = await db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })
      .from(category)
      .orderBy(asc(category.name));

    return NextResponse.json({ categories });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
