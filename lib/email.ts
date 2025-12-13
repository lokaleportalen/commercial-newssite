import { render } from "@react-email/components";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { WelcomeEmail } from "@/emails/welcome-email";
import { ArticleNotification } from "@/emails/article-notification";
import { WeeklyDigest } from "@/emails/weekly-digest";
import { PasswordReset } from "@/emails/password-reset";
import { db } from "@/database/db";
import { emailTemplate, emailLog } from "@/database/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import type {
  WelcomeEmailContent,
  ArticleNotificationContent,
  WeeklyDigestContent,
  PasswordResetContent,
} from "@/database/schema";

const mailgun = new Mailgun(formData);

// Initialize Mailgun client
const apiKey = process.env.MAILGUN_API_KEY;
if (!apiKey) {
  console.warn("MAILGUN_API_KEY environment variable is not set");
}

const mg = apiKey
  ? mailgun.client({
      username: "api",
      key: apiKey,
      url: process.env.MAILGUN_HOST || "https://api.eu.mailgun.net",
    })
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  userId?: string;
  emailType?: string;
}

const MAX_EMAILS_PER_DAY = 10;

/**
 * Check if user has exceeded daily email rate limit
 */
async function checkEmailRateLimit(userId: string): Promise<boolean> {
  // Get emails sent in last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const emailCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(emailLog)
    .where(
      and(
        eq(emailLog.userId, userId),
        gte(emailLog.sentAt, twentyFourHoursAgo)
      )
    );

  const count = Number(emailCount[0]?.count || 0);

  return count < MAX_EMAILS_PER_DAY;
}

/**
 * Log email send to database
 */
async function logEmailSend(
  userId: string,
  recipient: string,
  subject: string,
  emailType: string
): Promise<void> {
  await db.insert(emailLog).values({
    userId,
    recipient,
    subject,
    emailType,
  });
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, text, html, from, userId, emailType } = options;

  const domain = process.env.MAILGUN_DOMAIN;
  if (!domain || !mg) {
    throw new Error("Mailgun is not configured");
  }

  // Check rate limit if userId is provided
  if (userId) {
    const withinLimit = await checkEmailRateLimit(userId);
    if (!withinLimit) {
      console.warn(
        `Email rate limit exceeded for user ${userId}. Email not sent.`
      );
      throw new Error(
        "Email rate limit exceeded. Maximum 10 emails per day allowed."
      );
    }
  }

  try {
    const result = await mg.messages.create(domain, {
      from: from || `Estate News <noreply@${domain}>`,
      to: [to],
      subject,
      text,
      html: html || text,
    });

    // Log successful send if userId provided
    if (userId && emailType) {
      await logEmailSend(userId, to, subject, emailType);
    }

    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Render a React Email component to HTML string
 */
export async function renderEmail(
  component: React.ReactElement
): Promise<string> {
  return await render(component);
}

/**
 * Generate unsubscribe token for a user
 */
export function generateUnsubscribeToken(userId: string): string {
  const payload = JSON.stringify({ userId, timestamp: Date.now() });
  return Buffer.from(payload).toString("base64url");
}

/**
 * Verify and decode unsubscribe token
 */
export function verifyUnsubscribeToken(
  token: string
): { userId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (!payload.userId) {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

/**
 * Generate email URLs for a user
 */
export function generateEmailUrls(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const unsubscribeToken = generateUnsubscribeToken(userId);

  return {
    baseUrl,
    preferencesUrl: `${baseUrl}/profile/preferences`,
    unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=${unsubscribeToken}`,
    articlesUrl: `${baseUrl}/artikler`,
  };
}

/**
 * Fetch an email template from the database by key
 */
async function getEmailTemplate(key: string) {
  const templates = await db
    .select()
    .from(emailTemplate)
    .where(eq(emailTemplate.key, key))
    .limit(1);

  if (!templates || templates.length === 0 || !templates[0].isActive) {
    throw new Error(`Email template "${key}" not found or inactive`);
  }

  const template = templates[0];
  const content = JSON.parse(template.content);

  return {
    template,
    content,
  };
}

// ============================================================================
// Email Sender Functions
// ============================================================================

interface SendWelcomeEmailParams {
  to: string;
  userName: string;
  userId: string;
}

export async function sendWelcomeEmail({
  to,
  userName,
  userId,
}: SendWelcomeEmailParams) {
  const urls = generateEmailUrls(userId);

  // Fetch template content from database
  const { template, content } = await getEmailTemplate("welcome");
  const welcomeContent = content as WelcomeEmailContent;

  const html = await renderEmail(
    WelcomeEmail({
      userName,
      preferencesUrl: urls.preferencesUrl,
      articlesUrl: urls.articlesUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
      // Spread database content
      ...welcomeContent,
    })
  );

  // Replace variables in subject
  const subject = template.subject.replace(/{userName}/g, userName);

  return sendEmail({
    to,
    subject,
    text: `Hej ${userName}, velkommen til Estate News! Besøg ${urls.articlesUrl} for at læse de nyeste artikler.`,
    html,
    userId,
    emailType: "welcome",
  });
}

interface SendArticleNotificationParams {
  to: string;
  userId: string;
  articleTitle: string;
  articleSummary: string;
  articleSlug: string;
  articleImage?: string;
  categoryName: string;
}

export async function sendArticleNotification({
  to,
  userId,
  articleTitle,
  articleSummary,
  articleSlug,
  articleImage,
  categoryName,
}: SendArticleNotificationParams) {
  const urls = generateEmailUrls(userId);
  const articleUrl = `${urls.baseUrl}/artikler/${articleSlug}`;

  // Fetch template content from database
  const { template, content } = await getEmailTemplate("article_notification");
  const articleContent = content as ArticleNotificationContent;

  const html = await renderEmail(
    ArticleNotification({
      articleTitle,
      articleSummary,
      articleUrl,
      articleImage,
      categoryName,
      preferencesUrl: urls.preferencesUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
      // Spread database content
      ...articleContent,
    })
  );

  // Replace variables in subject
  const subject = template.subject.replace(/{articleTitle}/g, articleTitle);

  return sendEmail({
    to,
    subject,
    text: `${articleTitle}\n\n${articleSummary}\n\nLæs mere: ${articleUrl}`,
    html,
    userId,
    emailType: "article_notification",
  });
}

// Email-specific Article type (different from main Article type)
interface EmailArticle {
  id: string;
  title: string;
  summary: string;
  slug: string;
  image?: string;
  categoryName: string;
}

interface SendWeeklyDigestParams {
  to: string;
  userName: string;
  userId: string;
  articles: EmailArticle[];
  weekStart: string;
  weekEnd: string;
}

export async function sendWeeklyDigest({
  to,
  userName,
  userId,
  articles,
  weekStart,
  weekEnd,
}: SendWeeklyDigestParams) {
  const urls = generateEmailUrls(userId);

  // Fetch template content from database
  const { template, content } = await getEmailTemplate("weekly_digest");
  const digestContent = content as WeeklyDigestContent;

  const html = await renderEmail(
    WeeklyDigest({
      userName,
      articles,
      baseUrl: urls.baseUrl,
      preferencesUrl: urls.preferencesUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
      weekStart,
      weekEnd,
      // Spread database content
      ...digestContent,
    })
  );

  // Replace variables in subject
  const subject = template.subject
    .replace(/{weekStart}/g, weekStart)
    .replace(/{weekEnd}/g, weekEnd);

  return sendEmail({
    to,
    subject,
    text: `Hej ${userName}, her er ugens nyheder fra Estate News (${weekStart} - ${weekEnd}). Besøg ${urls.baseUrl} for at læse artiklerne.`,
    html,
    userId,
    emailType: "weekly_digest",
  });
}

interface SendPasswordResetParams {
  to: string;
  userName: string;
  resetUrl: string;
  expirationMinutes?: number;
  userId?: string;
}

export async function sendPasswordReset({
  to,
  userName,
  resetUrl,
  expirationMinutes = 60,
  userId,
}: SendPasswordResetParams) {
  // Fetch template content from database
  const { template, content } = await getEmailTemplate("password_reset");
  const resetContent = content as PasswordResetContent;

  const html = await renderEmail(
    PasswordReset({
      userName,
      resetUrl,
      expirationMinutes,
      // Spread database content
      ...resetContent,
    })
  );

  // Replace variables in subject
  const subject = template.subject.replace(/{userName}/g, userName);

  return sendEmail({
    to,
    subject,
    text: `Hej ${userName}, klik på dette link for at nulstille din adgangskode: ${resetUrl} (Gyldigt i ${expirationMinutes} minutter)`,
    html,
    userId,
    emailType: "password_reset",
  });
}
