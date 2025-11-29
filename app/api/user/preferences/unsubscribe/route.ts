import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { userPreferences } from "@/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Unsubscribe from all emails
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

    // Set email frequency to "aldrig" (never) to unsubscribe
    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userPreferences)
        .set({
          emailFrequency: "aldrig",
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      // Create preferences with "aldrig" frequency
      await db.insert(userPreferences).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        newsCategories: [],
        emailFrequency: "aldrig",
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
