import { schedules, logger } from "@trigger.dev/sdk";
import { db } from "@/database/db";
import {
  user,
  userPreferences,
  userPreferenceCategory,
  article,
  articleCategory,
  category,
} from "@/database/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { sendWeeklyDigest } from "@/lib/email";

export const weeklyDigestTask = schedules.task({
  id: "weekly-digest-email",
  cron: { pattern: "0 10 * * 6", timezone: "Europe/Copenhagen" },
  maxDuration: 3600,
  run: async (payload) => {
    logger.info("Starting weekly digest email task", {
      timestamp: payload.timestamp,
      lastRun: payload.lastTimestamp,
    });

    // Step 1: Get date range for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    logger.info(`Fetching articles published since: ${oneWeekAgo.toISOString()}`);

    // Step 2: Fetch all published articles from the past week with their categories
    const recentArticles = await db
      .select({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        image: article.image,
        publishedDate: article.publishedDate,
      })
      .from(article)
      .where(
        and(
          eq(article.status, "published"),
          gte(article.publishedDate, oneWeekAgo)
        )
      )
      .orderBy(article.publishedDate);

    logger.info(`Found ${recentArticles.length} articles from the past week`);

    if (recentArticles.length === 0) {
      logger.info("No articles published in the past week, skipping digest");
      return {
        success: true,
        message: "No articles to send",
        digestsSent: 0,
      };
    }

    // Step 3: Get article categories for all articles
    const articleIds = recentArticles.map((a) => a.id);
    const articleCategoriesData = await db
      .select({
        articleId: articleCategory.articleId,
        categoryId: articleCategory.categoryId,
        categoryName: category.name,
      })
      .from(articleCategory)
      .innerJoin(category, eq(articleCategory.categoryId, category.id))
      .where(inArray(articleCategory.articleId, articleIds));

    const articleCategoriesMap = new Map<
      string,
      Array<{ categoryId: string; categoryName: string }>
    >();

    for (const ac of articleCategoriesData) {
      if (!articleCategoriesMap.has(ac.articleId)) {
        articleCategoriesMap.set(ac.articleId, []);
      }
      articleCategoriesMap.get(ac.articleId)!.push({
        categoryId: ac.categoryId,
        categoryName: ac.categoryName,
      });
    }

    // Step 4: Get all users with weekly email frequency
    const weeklyUsers = await db
      .select({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        preferencesId: userPreferences.id,
        allCategories: userPreferences.allCategories,
      })
      .from(userPreferences)
      .innerJoin(user, eq(userPreferences.userId, user.id))
      .where(eq(userPreferences.emailFrequency, "weekly"));

    logger.info(`Found ${weeklyUsers.length} users with weekly email frequency`);

    if (weeklyUsers.length === 0) {
      return {
        success: true,
        message: "No users with weekly email frequency",
        digestsSent: 0,
      };
    }

    // Step 5: Send digest to each user with their filtered articles
    const results: Array<{
      userId: string;
      success: boolean;
      articleCount: number;
      error?: string;
    }> = [];

    for (const weeklyUser of weeklyUsers) {
      try {
        let userArticles = recentArticles;

        if (!weeklyUser.allCategories) {
          const userCategories = await db
            .select({
              categoryId: userPreferenceCategory.categoryId,
            })
            .from(userPreferenceCategory)
            .where(
              eq(
                userPreferenceCategory.userPreferencesId,
                weeklyUser.preferencesId
              )
            );

          const userCategoryIds = userCategories.map((uc) => uc.categoryId);

          if (userCategoryIds.length === 0) {
            logger.info(
              `User ${weeklyUser.userName} has no category preferences, skipping email`
            );
            continue;
          }

          userArticles = recentArticles.filter((article) => {
            const articleCats = articleCategoriesMap.get(article.id) || [];
            const articleCategoryIds = articleCats.map((c) => c.categoryId);

            return articleCategoryIds.some((catId) =>
              userCategoryIds.includes(catId)
            );
          });
        }

        if (userArticles.length === 0) {
          logger.info(
            `User ${weeklyUser.userName} has no matching articles, skipping email`
          );
          continue;
        }

        logger.info(
          `Sending digest to ${weeklyUser.userName} with ${userArticles.length} articles`
        );

        const formattedArticles = userArticles.map((article) => {
          const articleCats = articleCategoriesMap.get(article.id) || [];
          return {
            id: article.id,
            title: article.title,
            summary: article.summary || "",
            slug: article.slug,
            image: article.image || undefined,
            categoryName: articleCats[0]?.categoryName || "Erhvervsejendomme",
          };
        });

        const weekStart = oneWeekAgo.toLocaleDateString("da-DK", {
          day: "numeric",
          month: "long",
        });
        const weekEnd = new Date().toLocaleDateString("da-DK", {
          day: "numeric",
          month: "long",
        });

        await sendWeeklyDigest({
          to: weeklyUser.userEmail,
          userName: weeklyUser.userName,
          userId: weeklyUser.userId,
          articles: formattedArticles,
          weekStart,
          weekEnd,
        });

        results.push({
          userId: weeklyUser.userId,
          success: true,
          articleCount: formattedArticles.length,
        });

        logger.info(
          `✓ Weekly digest sent to ${weeklyUser.userEmail} (${formattedArticles.length} articles)`
        );
      } catch (error) {
        logger.error(`Failed to send digest to ${weeklyUser.userEmail}`, {
          error,
        });
        results.push({
          userId: weeklyUser.userId,
          success: false,
          articleCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const totalArticlesSent = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + r.articleCount, 0);

    logger.info("Weekly digest task completed", {
      totalUsers: weeklyUsers.length,
      successful: successCount,
      failed: failureCount,
      totalArticles: recentArticles.length,
      totalArticlesSent,
    });

    return {
      success: true,
      message: "Weekly digest emails sent",
      digestsSent: successCount,
      digestsFailed: failureCount,
      totalArticles: recentArticles.length,
      totalArticlesSent,
      results,
    };
  },
});
