import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { aiPrompt, aiPromptVersion } from "@/database/schema";
import { eq, desc } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/ai-prompts/[id]/restore
 * Restore a prompt from a specific version
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json(
        { error: "Version ID is required" },
        { status: 400 }
      );
    }

    // Fetch the version to restore
    const versions = await db
      .select()
      .from(aiPromptVersion)
      .where(eq(aiPromptVersion.id, versionId))
      .limit(1);

    if (versions.length === 0) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    const versionToRestore = versions[0];

    // Verify the version belongs to this prompt
    if (versionToRestore.promptId !== id) {
      return NextResponse.json(
        { error: "Version does not belong to this prompt" },
        { status: 400 }
      );
    }

    // Fetch current prompt to archive it before restoring
    const currentPrompts = await db
      .select()
      .from(aiPrompt)
      .where(eq(aiPrompt.id, id))
      .limit(1);

    if (currentPrompts.length === 0) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const currentPrompt = currentPrompts[0];

    // Get the latest version number
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

    // Archive the current version before restoring
    await db.insert(aiPromptVersion).values({
      promptId: id,
      name: currentPrompt.name,
      description: currentPrompt.description,
      model: currentPrompt.model,
      section: currentPrompt.section,
      prompt: currentPrompt.prompt,
      versionNumber: nextVersion,
      changeDescription: `Restored from version ${versionToRestore.versionNumber}`,
    });

    // Restore the prompt from the selected version
    const restoredPrompts = await db
      .update(aiPrompt)
      .set({
        name: versionToRestore.name,
        description: versionToRestore.description,
        model: versionToRestore.model,
        section: versionToRestore.section,
        prompt: versionToRestore.prompt,
        updatedAt: new Date(),
      })
      .where(eq(aiPrompt.id, id))
      .returning();

    return NextResponse.json(
      {
        prompt: restoredPrompts[0],
        message: `Prompt restored from version ${versionToRestore.versionNumber}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error restoring prompt version:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to restore prompt version" },
      { status: 500 }
    );
  }
}
