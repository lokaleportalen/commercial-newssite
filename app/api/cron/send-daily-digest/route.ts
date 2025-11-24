import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { user, userPreferences, article } from "@/database/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { sendDailyDigestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Daily Digest Cron Job
 * Sends personalized news digests to users who have opted for daily emails
 *
 * Authorization: Requires Bearer token matching CRON_SECRET
 * Schedule: Run daily (e.g., 8:00 AM local time)
 *
 * Process:
 * 1. Query all users with emailFrequency = 'daily'
 * 2. For each user, fetch articles matching their preferences
 * 3. Send personalized digest email
 * 4. Return summary of emails sent
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all users with daily email preference
    const usersWithDailyDigest = await db
      .select({
        userId: user.id,
        email: user.email,
        name: user.name,
        newsCategory: userPreferences.newsCategory,
      })
      .from(userPreferences)
      .innerJoin(user, eq(userPreferences.userId, user.id))
      .where(eq(userPreferences.emailFrequency, "daily"));

    if (usersWithDailyDigest.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users with daily digest preference",
        emailsSent: 0,
      });
    }

    // Get yesterday's date for filtering articles
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const results = await Promise.allSettled(
      usersWithDailyDigest.map(async (userPref) => {
        try {
          // Fetch articles based on user's category preference
          let articles;

          if (userPref.newsCategory === "all") {
            // Get all published articles from the last 24 hours
            articles = await db
              .select({
                id: article.id,
                title: article.title,
                summary: article.summary,
                slug: article.slug,
                categories: article.categories,
                publishedDate: article.publishedDate,
              })
              .from(article)
              .where(
                and(
                  eq(article.status, "published"),
                  gte(article.publishedDate, yesterday)
                )
              )
              .orderBy(sql`${article.publishedDate} DESC`)
              .limit(10);
          } else {
            // Get articles matching specific category
            articles = await db
              .select({
                id: article.id,
                title: article.title,
                summary: article.summary,
                slug: article.slug,
                categories: article.categories,
                publishedDate: article.publishedDate,
              })
              .from(article)
              .where(
                and(
                  eq(article.status, "published"),
                  gte(article.publishedDate, yesterday),
                  sql`${article.categories} LIKE ${`%${userPref.newsCategory}%`}`
                )
              )
              .orderBy(sql`${article.publishedDate} DESC`)
              .limit(10);
          }

          // Only send email if there are articles
          if (articles.length === 0) {
            return {
              email: userPref.email,
              success: true,
              skipped: true,
              reason: "No new articles",
            };
          }

          // Send digest email
          const emailResult = await sendDailyDigestEmail(
            userPref.email,
            userPref.name || userPref.email.split("@")[0],
            articles.map((a) => ({
              id: a.id.toString(),
              title: a.title,
              summary: a.summary,
              slug: a.slug,
              categories: a.categories,
              publishedDate: a.publishedDate,
            }))
          );

          return {
            email: userPref.email,
            success: emailResult.success,
            articlesCount: articles.length,
            error: emailResult.error,
          };
        } catch (error) {
          console.error(
            `Failed to send digest to ${userPref.email}:`,
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
      (r) => r.status === "fulfilled" && r.value.success && !r.value.skipped
    ).length;
    const skippedCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.skipped
    ).length;
    const failedCount = results.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    ).length;

    return NextResponse.json({
      success: true,
      message: "Daily digest processing completed",
      totalUsers: usersWithDailyDigest.length,
      emailsSent: successCount,
      skipped: skippedCount,
      failed: failedCount,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: "Promise rejected" }
      ),
    });
  } catch (error) {
    console.error("Daily digest cron error:", error);
    return NextResponse.json(
      {
        error: "Failed to process daily digest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
