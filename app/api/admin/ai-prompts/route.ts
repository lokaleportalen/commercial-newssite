import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { aiPrompt } from "@/database/schema";
import { desc } from "drizzle-orm";

/**
 * GET /api/admin/ai-prompts
 * List all AI prompts
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    // Get all prompts ordered by section and name
    const prompts = await db
      .select()
      .from(aiPrompt)
      .orderBy(aiPrompt.section, aiPrompt.name);

    return NextResponse.json({ prompts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching AI prompts:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch AI prompts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-prompts
 * Create a new AI prompt
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const body = await request.json();
    const { key, name, description, model, section, prompt } = body;

    // Validate required fields
    if (!key || !name || !model || !section || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new prompt
    const [newPrompt] = await db
      .insert(aiPrompt)
      .values({
        key,
        name,
        description: description || null,
        model,
        section,
        prompt,
      })
      .returning();

    return NextResponse.json({ prompt: newPrompt }, { status: 201 });
  } catch (error) {
    console.error("Error creating AI prompt:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create AI prompt" },
      { status: 500 }
    );
  }
}
