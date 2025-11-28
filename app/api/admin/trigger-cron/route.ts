import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { tasks } from "@trigger.dev/sdk";
import type { weeklyNewsTask } from "@/trigger/weekly-news";

/**
 * Manual trigger endpoint for weekly news task (Trigger.dev)
 * Called by the "Fetch weekly news" button in admin dashboard
 */
export async function POST() {
  try {
    // Verify user is admin
    await requireAdmin();

    console.log("Manual weekly news task trigger initiated by admin");

    // Trigger the Trigger.dev task
    const handle = await tasks.trigger<typeof weeklyNewsTask>(
      "weekly-news-fetch",
      {} // Scheduled tasks don't need payload when triggered manually
    );

    return NextResponse.json({
      success: true,
      message: "Weekly news task triggered successfully",
      taskId: handle.id,
      // You can monitor the task at: https://cloud.trigger.dev
      monitorUrl: `https://cloud.trigger.dev/runs/${handle.id}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error triggering weekly news task:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger weekly news task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
