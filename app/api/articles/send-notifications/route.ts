import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { user, userPreferences, article } from "@/database/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendImmediateNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Send Immediate Notifications
 * Sends immediate email notifications to users for a newly published article
 *
 * Authorization: Requires Bearer token matching CRON_SECRET (internal API)
 *
 * POST Body:
 * {
 *   "articleId": "uuid-of-article"
 * }
 *
 * Process:
 * 1. Fetch the article details
 * 2. Query all users with emailFrequency = 'immediate'
 * 3. Filter users based on their category preferences
 * 4. Send notification email to matching users
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token || token !== process.env.CRON_SECRET) {
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

    // Fetch the article
    const [articleData] = await db
      .select({
        id: article.id,
        title: article.title,
        summary: article.summary,
        slug: article.slug,
        categories: article.categories,
        publishedDate: article.publishedDate,
      })
      .from(article)
      .where(eq(article.id, articleId))
      .limit(1);

    if (!articleData) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Get all users with immediate notification preference
    const usersWithImmediateNotification = await db
      .select({
        userId: user.id,
        email: user.email,
        name: user.name,
        newsCategory: userPreferences.newsCategory,
      })
      .from(userPreferences)
      .innerJoin(user, eq(userPreferences.userId, user.id))
      .where(eq(userPreferences.emailFrequency, "immediate"));

    if (usersWithImmediateNotification.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users with immediate notification preference",
        emailsSent: 0,
      });
    }

    // Filter users based on category preferences
    const matchingUsers = usersWithImmediateNotification.filter((userPref) => {
      // If user wants all categories, include them
      if (userPref.newsCategory === "all") {
        return true;
      }

      // If article has no categories, skip
      if (!articleData.categories) {
        return false;
      }

      // Check if article categories match user's preference
      const articleCategories = articleData.categories
        .split(",")
        .map((cat) => cat.trim().toLowerCase());
      const userCategory = userPref.newsCategory.toLowerCase();

      return articleCategories.includes(userCategory);
    });

    if (matchingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users match the article category",
        emailsSent: 0,
      });
    }

    // Send notification emails
    const results = await Promise.allSettled(
      matchingUsers.map(async (userPref) => {
        try {
          const emailResult = await sendImmediateNotificationEmail(
            userPref.email,
            userPref.name || userPref.email.split("@")[0],
            {
              id: articleData.id.toString(),
              title: articleData.title,
              summary: articleData.summary,
              slug: articleData.slug,
              categories: articleData.categories,
              publishedDate: articleData.publishedDate,
            }
          );

          return {
            email: userPref.email,
            success: emailResult.success,
            error: emailResult.error,
          };
        } catch (error) {
          console.error(
            `Failed to send notification to ${userPref.email}:`,
            error
          );
          return {
            email: userPref.email,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // Process results
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failedCount = results.filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && !r.value.success)
    ).length;

    return NextResponse.json({
      success: true,
      message: "Immediate notifications sent",
      article: {
        id: articleData.id,
        title: articleData.title,
        slug: articleData.slug,
      },
      totalMatchingUsers: matchingUsers.length,
      emailsSent: successCount,
      failed: failedCount,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: "Promise rejected" }
      ),
    });
  } catch (error) {
    console.error("Send notifications error:", error);
    return NextResponse.json(
      {
        error: "Failed to send notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
