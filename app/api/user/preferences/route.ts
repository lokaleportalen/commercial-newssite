import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { userPreferences } from "@/database/schema";
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
        newsCategories: [],
        emailFrequency: "ugentligt",
      });
    }

    return NextResponse.json({
      newsCategories: preferences[0].newsCategories,
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

    const { newsCategories, emailFrequency } = await request.json();

    if (!emailFrequency) {
      return NextResponse.json(
        { error: "Email frequency is required" },
        { status: 400 }
      );
    }

    // Validate newsCategories is an array
    if (newsCategories && !Array.isArray(newsCategories)) {
      return NextResponse.json(
        { error: "News categories must be an array" },
        { status: 400 }
      );
    }

    // Validate emailFrequency options
    const validFrequencies = ["straks", "ugentligt", "aldrig"];
    if (!validFrequencies.includes(emailFrequency)) {
      return NextResponse.json(
        { error: "Invalid email frequency" },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      // Update existing preferences
      await db
        .update(userPreferences)
        .set({
          newsCategories: newsCategories || [],
          emailFrequency,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      // Create new preferences
      await db.insert(userPreferences).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        newsCategories: newsCategories || [],
        emailFrequency,
      });
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
