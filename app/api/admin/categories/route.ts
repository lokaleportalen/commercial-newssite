import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { category, articleCategory } from "@/database/schema/categories-schema";
import { article } from "@/database/schema/articles-schema";
import { asc, eq } from "drizzle-orm";
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
        description: category.description,
        heroImage: category.heroImage,
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

/**
 * POST /api/admin/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, slug, description, heroImage } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db
      .select()
      .from(category)
      .where(eq(category.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const [newCategory] = await db
      .insert(category)
      .values({
        name,
        slug,
        description: description || null,
        heroImage: heroImage || null,
      })
      .returning();

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/categories
 * Update a category (primarily for hero image upload)
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, name, slug, description, heroImage } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (heroImage !== undefined) updateData.heroImage = heroImage;

    await db
      .update(category)
      .set(updateData)
      .where(eq(category.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories
 * Delete a category
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category has any articles (through junction table)
    const articlesInCategory = await db
      .select()
      .from(articleCategory)
      .where(eq(articleCategory.categoryId, id))
      .limit(1);

    if (articlesInCategory.length > 0) {
      return NextResponse.json(
        {
          error:
            "Kan ikke slette kategori med artikler. Fjern venligst artikler fra kategorien først.",
        },
        { status: 400 }
      );
    }

    await db.delete(category).where(eq(category.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
