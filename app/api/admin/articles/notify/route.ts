import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { tasks } from "@trigger.dev/sdk";
import { sendArticleNotificationsTask } from "@/trigger/send-article-notifications";

/**
 * POST /api/admin/articles/notify
 * Manually trigger article notifications for a published article
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    // Trigger the notification task
    const handle = await tasks.trigger<typeof sendArticleNotificationsTask>(
      "send-article-notifications",
      { articleId }
    );

    return NextResponse.json({
      success: true,
      message: "Article notifications triggered",
      taskId: handle.id,
    });
  } catch (error) {
    console.error("Failed to trigger article notifications:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
