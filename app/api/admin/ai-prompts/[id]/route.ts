import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { aiPrompt, aiPromptVersion } from "@/database/schema";
import { eq, desc } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/ai-prompts/[id]
 * Get a single AI prompt by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const prompts = await db
      .select()
      .from(aiPrompt)
      .where(eq(aiPrompt.id, id))
      .limit(1);

    if (!prompts || prompts.length === 0) {
      return NextResponse.json(
        { error: "AI prompt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ prompt: prompts[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching AI prompt:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch AI prompt" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-prompts/[id]
 * Update an AI prompt (archives old version before updating)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const { key, name, description, model, section, prompt, changeDescription } = body;

    // Validate required fields
    if (!name || !model || !section || !prompt) {
      return NextResponse.json(
        { error: "Name, model, section, and prompt are required" },
        { status: 400 }
      );
    }

    // Fetch the current prompt to archive it
    const currentPrompts = await db
      .select()
      .from(aiPrompt)
      .where(eq(aiPrompt.id, id))
      .limit(1);

    if (!currentPrompts || currentPrompts.length === 0) {
      return NextResponse.json(
        { error: "AI prompt not found" },
        { status: 404 }
      );
    }

    const currentPrompt = currentPrompts[0];

    // Check if the prompt has actually changed
    const hasChanges =
      currentPrompt.prompt !== prompt ||
      currentPrompt.name !== name ||
      currentPrompt.model !== model ||
      currentPrompt.section !== section ||
      currentPrompt.description !== description;

    if (hasChanges) {
      // Get the latest version number for this prompt
      const latestVersions = await db
        .select()
        .from(aiPromptVersion)
        .where(eq(aiPromptVersion.promptId, id))
        .orderBy(desc(aiPromptVersion.createdAt))
        .limit(1);

      // Calculate next version number
      let nextVersion = "1.0";
      if (latestVersions.length > 0) {
        const currentVersion = latestVersions[0].versionNumber;
        const versionParts = currentVersion.split(".");
        const major = parseInt(versionParts[0] || "1");
        const minor = parseInt(versionParts[1] || "0");
        nextVersion = `${major}.${minor + 1}`;
      }

      // Archive the current version
      await db.insert(aiPromptVersion).values({
        promptId: id,
        name: currentPrompt.name,
        description: currentPrompt.description,
        model: currentPrompt.model,
        section: currentPrompt.section,
        prompt: currentPrompt.prompt,
        versionNumber: nextVersion,
        changeDescription: changeDescription || null,
      });
    }

    // Update the prompt
    const updatedPrompts = await db
      .update(aiPrompt)
      .set({
        key: key || undefined, // Only update if provided
        name,
        description: description || null,
        model,
        section,
        prompt,
        updatedAt: new Date(),
      })
      .where(eq(aiPrompt.id, id))
      .returning();

    return NextResponse.json(
      {
        prompt: updatedPrompts[0],
        message: hasChanges
          ? "AI prompt updated and previous version archived"
          : "AI prompt updated (no changes detected)",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating AI prompt:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update AI prompt" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-prompts/[id]
 * Delete an AI prompt
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const deletedPrompts = await db
      .delete(aiPrompt)
      .where(eq(aiPrompt.id, id))
      .returning();

    if (!deletedPrompts || deletedPrompts.length === 0) {
      return NextResponse.json(
        { error: "AI prompt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "AI prompt deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting AI prompt:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete AI prompt" },
      { status: 500 }
    );
  }
}
