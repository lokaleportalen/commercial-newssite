import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { role } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const userRole = await db
      .select()
      .from(role)
      .where(eq(role.userId, user.id))
      .limit(1);

    if (!userRole || userRole.length === 0) {
      return NextResponse.json({ role: "user" });
    }

    return NextResponse.json({ role: userRole[0].role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
