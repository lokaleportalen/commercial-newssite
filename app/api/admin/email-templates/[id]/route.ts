import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { emailTemplate } from "@/database/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/email-templates/[id]
 * Get a single email template by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const templates = await db
      .select()
      .from(emailTemplate)
      .where(eq(emailTemplate.id, id))
      .limit(1);

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template: templates[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching email template:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/email-templates/[id]
 * Update an email template
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const { key, name, description, subject, previewText, content, isActive } =
      body;

    // Validate required fields
    if (!name || !subject || !previewText || !content) {
      return NextResponse.json(
        { error: "Name, subject, preview text, and content are required" },
        { status: 400 }
      );
    }

    // Validate that content is valid JSON
    try {
      JSON.parse(content);
    } catch (e) {
      return NextResponse.json(
        { error: "Content must be valid JSON" },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplates = await db
      .select()
      .from(emailTemplate)
      .where(eq(emailTemplate.id, id))
      .limit(1);

    if (!existingTemplates || existingTemplates.length === 0) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }

    // Update the template
    const updatedTemplates = await db
      .update(emailTemplate)
      .set({
        key: key || undefined, // Only update if provided
        name,
        description: description || null,
        subject,
        previewText,
        content,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplate.id, id))
      .returning();

    return NextResponse.json(
      {
        template: updatedTemplates[0],
        message: "Email template updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating email template:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/email-templates/[id]
 * Delete an email template
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;

    const deletedTemplates = await db
      .delete(emailTemplate)
      .where(eq(emailTemplate.id, id))
      .returning();

    if (!deletedTemplates || deletedTemplates.length === 0) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Email template deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting email template:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    );
  }
}
