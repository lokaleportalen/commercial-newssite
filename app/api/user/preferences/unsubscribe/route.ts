import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { userPreferences } from "@/database/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-helpers";

// Unsubscribe from all emails
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has preferences
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      // Update existing preferences to set email frequency to "none"
      await db
        .update(userPreferences)
        .set({
          emailFrequency: "none",
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      // Create new preferences with "none" frequency
      await db.insert(userPreferences).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        allCategories: true,
        emailFrequency: "none",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
