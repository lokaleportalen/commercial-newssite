import { render } from "@react-email/components";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { WelcomeEmail } from "@/emails/welcome-email";
import { ArticleNotification } from "@/emails/article-notification";
import { WeeklyDigest } from "@/emails/weekly-digest";
import { PasswordReset } from "@/emails/password-reset";

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
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, text, html, from } = options;

  const domain = process.env.MAILGUN_DOMAIN;
  if (!domain || !mg) {
    throw new Error("Mailgun is not configured");
  }

  try {
    const result = await mg.messages.create(domain, {
      from: from || `Estate News <noreply@${domain}>`,
      to: [to],
      subject,
      text,
      html: html || text,
    });

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

  const html = renderEmail(
    WelcomeEmail({
      userName,
      preferencesUrl: urls.preferencesUrl,
      articlesUrl: urls.articlesUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
    })
  );

  return sendEmail({
    to,
    subject: "Velkommen til Estate News",
    text: `Hej ${userName}, velkommen til Estate News! Besøg ${urls.articlesUrl} for at læse de nyeste artikler.`,
    html,
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

  const html = renderEmail(
    ArticleNotification({
      articleTitle,
      articleSummary,
      articleUrl,
      articleImage,
      categoryName,
      preferencesUrl: urls.preferencesUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
    })
  );

  return sendEmail({
    to,
    subject: `Ny artikel: ${articleTitle}`,
    text: `${articleTitle}\n\n${articleSummary}\n\nLæs mere: ${articleUrl}`,
    html,
  });
}

interface Article {
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
  articles: Article[];
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

  const html = renderEmail(
    WeeklyDigest({
      userName,
      articles,
      baseUrl: urls.baseUrl,
      preferencesUrl: urls.preferencesUrl,
      unsubscribeUrl: urls.unsubscribeUrl,
      weekStart,
      weekEnd,
    })
  );

  const articleCount = articles.length;
  const subject =
    articleCount > 0
      ? `Ugens erhvervsejendomsnyheder (${articleCount} nye artikler)`
      : "Ugens erhvervsejendomsnyheder";

  return sendEmail({
    to,
    subject,
    text: `Hej ${userName}, her er ugens nyheder fra Estate News (${weekStart} - ${weekEnd}). Besøg ${urls.baseUrl} for at læse artiklerne.`,
    html,
  });
}

interface SendPasswordResetParams {
  to: string;
  userName: string;
  resetUrl: string;
  expirationMinutes?: number;
}

export async function sendPasswordReset({
  to,
  userName,
  resetUrl,
  expirationMinutes = 60,
}: SendPasswordResetParams) {
  const html = renderEmail(
    PasswordReset({
      userName,
      resetUrl,
      expirationMinutes,
    })
  );

  return sendEmail({
    to,
    subject: "Nulstil din adgangskode - Estate News",
    text: `Hej ${userName}, klik på dette link for at nulstille din adgangskode: ${resetUrl} (Gyldigt i ${expirationMinutes} minutter)`,
    html,
  });
}
