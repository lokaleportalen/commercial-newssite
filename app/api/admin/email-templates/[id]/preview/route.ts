import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { emailTemplate } from "@/database/schema";
import { eq } from "drizzle-orm";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@/emails/welcome-email";
import { ArticleNotification } from "@/emails/article-notification";
import { WeeklyDigest } from "@/emails/weekly-digest";
import { PasswordReset } from "@/emails/password-reset";
import type {
  WelcomeEmailContent,
  ArticleNotificationContent,
  WeeklyDigestContent,
  PasswordResetContent,
} from "@/database/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/email-templates/[id]/preview
 * Preview an email template with sample data
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "html"; // html or text

    const templates = await db
      .select()
      .from(emailTemplate)
      .where(eq(emailTemplate.id, id))
      .limit(1);

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }

    const template = templates[0];
    const content = JSON.parse(template.content);

    // Base URL for sample data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    let emailHtml: string;

    // Render the appropriate template with sample data
    switch (template.key) {
      case "welcome":
        const welcomeContent = content as WelcomeEmailContent;
        emailHtml = await render(
          WelcomeEmail({
            userName: "John Doe",
            preferencesUrl: `${baseUrl}/profile/preferences`,
            articlesUrl: `${baseUrl}/artikler`,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=sample-token`,
            // Override with database content
            ...welcomeContent,
          }) as React.ReactElement,
          { plainText: format === "text" }
        );
        break;

      case "article_notification":
        const articleContent = content as ArticleNotificationContent;
        emailHtml = await render(
          ArticleNotification({
            articleTitle: "Nyt erhvervsejendomsprojekt i København",
            articleSummary:
              "En ny udvikling på 50.000 kvadratmeter kontorplads er planlagt til at åbne i 2025.",
            articleUrl: `${baseUrl}/artikler/sample-article`,
            articleImage: "https://via.placeholder.com/600x400",
            categoryName: "Kontor",
            preferencesUrl: `${baseUrl}/profile/preferences`,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=sample-token`,
            // Override with database content
            ...articleContent,
          }) as React.ReactElement,
          { plainText: format === "text" }
        );
        break;

      case "weekly_digest":
        const digestContent = content as WeeklyDigestContent;
        emailHtml = await render(
          WeeklyDigest({
            userName: "John Doe",
            articles: [
              {
                id: "1",
                title: "Nyt kontorbyggeri i Aarhus",
                summary:
                  "Et nyt moderne kontorbyggeri på 25.000 kvadratmeter står klar til indflytning i 2025.",
                slug: "nyt-kontorbyggeri-i-aarhus",
                image: "https://via.placeholder.com/600x400",
                categoryName: "Kontor",
              },
              {
                id: "2",
                title: "Store investeringer i logistikcentre",
                summary:
                  "Den danske logistiksektor oplever en rekordstor interesse fra internationale investorer.",
                slug: "store-investeringer-i-logistikcentre",
                image: "https://via.placeholder.com/600x400",
                categoryName: "Logistik",
              },
            ],
            baseUrl,
            preferencesUrl: `${baseUrl}/profile/preferences`,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=sample-token`,
            weekStart: "4. dec",
            weekEnd: "10. dec",
            // Override with database content
            ...digestContent,
          }) as React.ReactElement,
          { plainText: format === "text" }
        );
        break;

      case "password_reset":
        const resetContent = content as PasswordResetContent;
        emailHtml = await render(
          PasswordReset({
            userName: "John Doe",
            resetUrl: `${baseUrl}/auth/reset-password?token=sample-reset-token`,
            expirationMinutes: 60,
            // Override with database content
            ...resetContent,
          }) as React.ReactElement,
          { plainText: format === "text" }
        );
        break;

      default:
        return NextResponse.json(
          { error: "Unknown template type" },
          { status: 400 }
        );
    }

    // Return HTML or plain text based on format
    if (format === "text") {
      return new NextResponse(emailHtml, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new NextResponse(emailHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error previewing email template:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to preview email template" },
      { status: 500 }
    );
  }
}
