import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { tasks } from "@trigger.dev/sdk";
import type { dailyNewsTask } from "@/trigger/weekly-news";

/**
 * Manual trigger endpoint for daily news task (Trigger.dev)
 * Called by the "Fetch daily news" button in admin dashboard
 */
export async function POST() {
  try {
    // Verify user is admin
    await requireAdmin();

    console.log("Manual daily news task trigger initiated by admin");

    // Trigger the Trigger.dev task
    // Scheduled tasks need a schedule-compatible payload when triggered manually
    const handle = await tasks.trigger<typeof dailyNewsTask>(
      "daily-news-fetch",
      {
        type: "IMPERATIVE" as const,
        timestamp: new Date(),
        timezone: "Europe/Copenhagen",
        scheduleId: "manual-trigger",
        upcoming: [],
      }
    );

    return NextResponse.json({
      success: true,
      message: "Daily news task triggered successfully",
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

    console.error("Error triggering daily news task:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger daily news task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
