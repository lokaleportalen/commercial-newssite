import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { aiPromptVersion } from "@/database/schema";
import { eq, desc } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/ai-prompts/[id]/versions
 * Get all versions for a specific prompt
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const versions = await db
      .select()
      .from(aiPromptVersion)
      .where(eq(aiPromptVersion.promptId, id))
      .orderBy(desc(aiPromptVersion.createdAt));

    return NextResponse.json({ versions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching prompt versions:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch prompt versions" },
      { status: 500 }
    );
  }
}
