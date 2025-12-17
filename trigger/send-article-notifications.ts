import { task, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/database/db";
import {
  user,
  userPreferences,
  userPreferenceCategory,
  article,
  articleCategory,
  category,
} from "@/database/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendArticleNotification, checkEmailRateLimit } from "@/lib/email";

const ArticleNotificationPayload = z.object({
  articleId: z.string(),
});

export const sendArticleNotificationsTask = task({
  id: "send-article-notifications",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: z.infer<typeof ArticleNotificationPayload>) => {
    const { articleId } = payload;

    logger.info(`Starting article notification task for article: ${articleId}`);

    // Step 1: Fetch the article with its categories
    const articles = await db
      .select({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        image: article.image,
        status: article.status,
      })
      .from(article)
      .where(eq(article.id, articleId))
      .limit(1);

    if (articles.length === 0) {
      logger.error(`Article not found: ${articleId}`);
      throw new Error(`Article not found: ${articleId}`);
    }

    const articleData = articles[0];

    if (articleData.status !== "published") {
      logger.info(
        `Article ${articleId} is not published, skipping notifications`
      );
      return {
        success: true,
        message: "Article not published, skipping notifications",
        notificationsSent: 0,
      };
    }

    const articleCategories = await db
      .select({
        categoryId: articleCategory.categoryId,
        categoryName: category.name,
      })
      .from(articleCategory)
      .innerJoin(category, eq(articleCategory.categoryId, category.id))
      .where(eq(articleCategory.articleId, articleId));

    const articleCategoryIds = articleCategories.map((ac) => ac.categoryId);
    const articleCategoryNames = articleCategories.map((ac) => ac.categoryName);

    logger.info(
      `Article has ${articleCategoryIds.length} categories: ${articleCategoryNames.join(", ")}`
    );

    // Step 2: Find all users with "immediate" email frequency
    const immediateUsers = await db
      .select({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        preferencesId: userPreferences.id,
        allCategories: userPreferences.allCategories,
      })
      .from(userPreferences)
      .innerJoin(user, eq(userPreferences.userId, user.id))
      .where(eq(userPreferences.emailFrequency, "immediate"));

    logger.info(
      `Found ${immediateUsers.length} users with immediate email frequency`
    );

    if (immediateUsers.length === 0) {
      return {
        success: true,
        message: "No users with immediate email frequency",
        notificationsSent: 0,
      };
    }

    // Step 3: Filter users
    const usersToNotify: Array<{
      userId: string;
      userName: string;
      userEmail: string;
    }> = [];

    for (const immediateUser of immediateUsers) {
      if (immediateUser.allCategories) {
        usersToNotify.push({
          userId: immediateUser.userId,
          userName: immediateUser.userName,
          userEmail: immediateUser.userEmail,
        });
        continue;
      }

      if (articleCategoryIds.length === 0) {
        continue;
      }

      const userCategories = await db
        .select({
          categoryId: userPreferenceCategory.categoryId,
        })
        .from(userPreferenceCategory)
        .where(
          eq(
            userPreferenceCategory.userPreferencesId,
            immediateUser.preferencesId
          )
        );

      const userCategoryIds = userCategories.map((uc) => uc.categoryId);

      const hasMatchingCategory = articleCategoryIds.some((catId) =>
        userCategoryIds.includes(catId)
      );

      if (hasMatchingCategory) {
        usersToNotify.push({
          userId: immediateUser.userId,
          userName: immediateUser.userName,
          userEmail: immediateUser.userEmail,
        });
      }
    }

    logger.info(
      `Found ${usersToNotify.length} users to notify after filtering by categories`
    );

    if (usersToNotify.length === 0) {
      return {
        success: true,
        message: "No users match category preferences",
        notificationsSent: 0,
      };
    }

    // Step 4: Send notifications to all matching users
    const results: Array<{
      userId: string;
      success: boolean;
      error?: string;
      rateLimited?: boolean;
    }> = [];

    for (const notifyUser of usersToNotify) {
      try {
        // Check rate limit before sending
        const rateLimit = await checkEmailRateLimit(notifyUser.userId);

        if (!rateLimit.allowed) {
          logger.warn(
            `Rate limit exceeded for ${notifyUser.userName} (${notifyUser.userEmail}): ${rateLimit.currentCount}/${rateLimit.limit} emails in last 24h`
          );
          results.push({
            userId: notifyUser.userId,
            success: false,
            rateLimited: true,
            error: `Rate limit exceeded: ${rateLimit.currentCount}/${rateLimit.limit} emails`,
          });
          continue;
        }

        logger.info(
          `Sending notification to ${notifyUser.userName} (${notifyUser.userEmail}) [${rateLimit.currentCount}/${rateLimit.limit} emails]`
        );

        await sendArticleNotification({
          to: notifyUser.userEmail,
          userId: notifyUser.userId,
          articleId: articleId,
          articleTitle: articleData.title,
          articleSummary: articleData.summary || "",
          articleSlug: articleData.slug,
          articleImage: articleData.image || undefined,
          categoryName: articleCategoryNames[0] || "Erhvervsejendomme",
        });

        results.push({
          userId: notifyUser.userId,
          success: true,
        });

        logger.info(`✓ Notification sent to ${notifyUser.userEmail}`);
      } catch (error) {
        logger.error(
          `Failed to send notification to ${notifyUser.userEmail}`,
          { error }
        );
        results.push({
          userId: notifyUser.userId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success && !r.rateLimited).length;
    const rateLimitedCount = results.filter((r) => r.rateLimited).length;

    logger.info("Article notification task completed", {
      articleId,
      totalUsers: usersToNotify.length,
      successful: successCount,
      failed: failureCount,
      rateLimited: rateLimitedCount,
    });

    return {
      success: true,
      message: "Article notifications sent",
      notificationsSent: successCount,
      notificationsFailed: failureCount,
      notificationsRateLimited: rateLimitedCount,
      results,
    };
  },
});
