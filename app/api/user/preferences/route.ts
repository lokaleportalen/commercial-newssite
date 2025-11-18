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
        newsCategory: "all",
        emailFrequency: "daily",
      });
    }

    return NextResponse.json({
      newsCategory: preferences[0].newsCategory,
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

    const { newsCategory, emailFrequency } = await request.json();

    if (!newsCategory || !emailFrequency) {
      return NextResponse.json(
        { error: "News category and email frequency are required" },
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
          newsCategory,
          emailFrequency,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      // Create new preferences
      await db.insert(userPreferences).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        newsCategory,
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
