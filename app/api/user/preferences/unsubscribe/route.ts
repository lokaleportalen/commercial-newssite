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

    // Delete user preferences (which unsubscribes them)
    await db
      .delete(userPreferences)
      .where(eq(userPreferences.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
