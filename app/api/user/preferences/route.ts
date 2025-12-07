import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { userPreferences, userPreferenceCategory } from "@/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (preferences.length === 0) {
      return NextResponse.json({
        allCategories: true,
        selectedCategories: [],
        emailFrequency: "weekly",
      });
    }

    // Get selected categories if not "all"
    let selectedCategories: string[] = [];
    if (!preferences[0].allCategories) {
      const categories = await db
        .select({ categoryId: userPreferenceCategory.categoryId })
        .from(userPreferenceCategory)
        .where(eq(userPreferenceCategory.userPreferencesId, preferences[0].id));
      selectedCategories = categories.map(c => c.categoryId);
    }

    return NextResponse.json({
      allCategories: preferences[0].allCategories,
      selectedCategories,
      emailFrequency: preferences[0].emailFrequency,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create or update user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { allCategories, selectedCategories, emailFrequency } = await request.json();

    if (allCategories === undefined || !emailFrequency) {
      return NextResponse.json(
        { error: "All categories flag and email frequency are required" },
        { status: 400 }
      );
    }

    if (!allCategories && (!selectedCategories || selectedCategories.length === 0)) {
      return NextResponse.json(
        { error: "At least one category must be selected when not selecting all categories" },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    let preferencesId: string;

    if (existing.length > 0) {
      preferencesId = existing[0].id;
      // Update existing preferences
      await db
        .update(userPreferences)
        .set({
          allCategories,
          emailFrequency,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id));

      // Delete existing category selections
      await db
        .delete(userPreferenceCategory)
        .where(eq(userPreferenceCategory.userPreferencesId, preferencesId));
    } else {
      // Create new preferences
      preferencesId = crypto.randomUUID();
      await db.insert(userPreferences).values({
        id: preferencesId,
        userId: session.user.id,
        allCategories,
        emailFrequency,
      });
    }

    // Insert selected categories if not "all"
    if (!allCategories && selectedCategories && selectedCategories.length > 0) {
      await db.insert(userPreferenceCategory).values(
        selectedCategories.map((categoryId: string) => ({
          userPreferencesId: preferencesId,
          categoryId,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
