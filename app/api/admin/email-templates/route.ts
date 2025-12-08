import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { emailTemplate } from "@/database/schema";
import { desc } from "drizzle-orm";

/**
 * GET /api/admin/email-templates
 * List all email templates
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    // Get all templates ordered by name
    const templates = await db
      .select()
      .from(emailTemplate)
      .orderBy(emailTemplate.name);

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching email templates:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-templates
 * Create a new email template
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const body = await request.json();
    const { key, name, description, subject, previewText, content, isActive } =
      body;

    // Validate required fields
    if (!key || !name || !subject || !previewText || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Create new template
    const [newTemplate] = await db
      .insert(emailTemplate)
      .values({
        key,
        name,
        description: description || null,
        subject,
        previewText,
        content,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error("Error creating email template:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    );
  }
}
