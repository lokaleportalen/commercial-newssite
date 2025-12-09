import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { user } from "@/database/schema/auth-schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { or, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Search users by name or email (case-insensitive)
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(
        or(
          ilike(user.name, `%${query}%`),
          ilike(user.email, `%${query}%`)
        )
      )
      .limit(20);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
