import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { user } from "@/database/schema/auth-schema";
import { userPreferences, userPreferenceCategory } from "@/database/schema/user-preferences-schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const {
      name,
      email,
      emailFrequency,
      allCategories,
      categoryIds,
    } = body;

    // Update user basic info (name and email)
    const userUpdates: {
      name?: string;
      email?: string;
    } = {};

    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;

    if (Object.keys(userUpdates).length > 0) {
      await db.update(user).set(userUpdates).where(eq(user.id, id));
    }

    // Update user preferences
    const prefsUpdates: {
      emailFrequency?: "immediate" | "weekly";
      allCategories?: boolean;
    } = {};

    if (emailFrequency !== undefined) {
      if (!["immediate", "weekly"].includes(emailFrequency)) {
        return NextResponse.json(
          { error: "Invalid email frequency" },
          { status: 400 }
        );
      }
      prefsUpdates.emailFrequency = emailFrequency;
    }

    if (allCategories !== undefined) {
      prefsUpdates.allCategories = allCategories;
    }

    // Get or create user preferences
    const existingPrefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, id))
      .limit(1);

    let prefsId: string;

    if (existingPrefs.length === 0) {
      // Create new preferences
      const newPrefs = await db
        .insert(userPreferences)
        .values({
          id: crypto.randomUUID(),
          userId: id,
          ...prefsUpdates,
        })
        .returning();
      prefsId = newPrefs[0].id;
    } else {
      // Update existing preferences
      prefsId = existingPrefs[0].id;
      if (Object.keys(prefsUpdates).length > 0) {
        await db
          .update(userPreferences)
          .set(prefsUpdates)
          .where(eq(userPreferences.id, prefsId));
      }
    }

    // Update category preferences if provided
    if (categoryIds !== undefined) {
      if (!Array.isArray(categoryIds)) {
        return NextResponse.json(
          { error: "Category IDs must be an array" },
          { status: 400 }
        );
      }

      // Delete existing category preferences
      await db.delete(userPreferenceCategory).where(eq(userPreferenceCategory.userPreferencesId, prefsId));

      // Insert new category preferences
      if (categoryIds.length > 0) {
        await db.insert(userPreferenceCategory).values(
          categoryIds.map((categoryId: string) => ({
            userPreferencesId: prefsId,
            categoryId,
          }))
        );
      }
    }

    // Fetch updated user
    const updatedUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (adminSession.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will handle roles, categories, sessions, etc.)
    await db.delete(user).where(eq(user.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
