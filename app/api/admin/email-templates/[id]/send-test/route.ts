import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/database/db";
import { emailTemplate } from "@/database/schema";
import { eq } from "drizzle-orm";
import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email";
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
 * POST /api/admin/email-templates/[id]/send-test
 * Send a test email with sample data to specified recipient
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();
    const { recipientEmail } = body;

    // Validate recipient email
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid recipient email is required" },
        { status: 400 }
      );
    }

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
    let emailSubject: string;
    let emailText: string;

    // Render the appropriate template with sample data
    switch (template.key) {
      case "welcome":
        const welcomeContent = content as WelcomeEmailContent;
        emailHtml = await render(
          WelcomeEmail({
            userName: "Test Bruger",
            preferencesUrl: `${baseUrl}/profile/preferences`,
            articlesUrl: `${baseUrl}/artikler`,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=test-token`,
            // Override with database content
            ...welcomeContent,
          }) as React.ReactElement
        );
        emailSubject = template.subject.replace(/{userName}/g, "Test Bruger");
        emailText = `Hej Test Bruger, velkommen til Estatenews.dk! Dette er en test email.`;
        break;

      case "article_notification":
        const articleContent = content as ArticleNotificationContent;
        emailHtml = await render(
          ArticleNotification({
            articleTitle: "Nyt erhvervsejendomsprojekt i København",
            articleSummary:
              "En ny udvikling på 50.000 kvadratmeter kontorplads er planlagt til at åbne i 2025. Dette er en test email med placeholder indhold.",
            articleUrl: `${baseUrl}/artikler/test-artikel`,
            articleImage: "https://via.placeholder.com/600x400",
            categoryName: "Kontor",
            preferencesUrl: `${baseUrl}/profile/preferences`,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=test-token`,
            // Override with database content
            ...articleContent,
          }) as React.ReactElement
        );
        emailSubject = template.subject.replace(
          /{articleTitle}/g,
          "Nyt erhvervsejendomsprojekt i København"
        );
        emailText =
          "Nyt erhvervsejendomsprojekt i København. Dette er en test email.";
        break;

      case "weekly_digest":
        const digestContent = content as WeeklyDigestContent;
        emailHtml = await render(
          WeeklyDigest({
            userName: "Test Bruger",
            articles: [
              {
                id: "1",
                title: "Nyt kontorbyggeri i Aarhus",
                summary:
                  "Et nyt moderne kontorbyggeri på 25.000 kvadratmeter står klar til indflytning i 2025. Dette er test indhold.",
                slug: "nyt-kontorbyggeri-i-aarhus",
                image: "https://via.placeholder.com/600x400",
                categoryName: "Kontor",
              },
              {
                id: "2",
                title: "Store investeringer i logistikcentre",
                summary:
                  "Den danske logistiksektor oplever en rekordstor interesse fra internationale investorer. Dette er test indhold.",
                slug: "store-investeringer-i-logistikcentre",
                image: "https://via.placeholder.com/600x400",
                categoryName: "Logistik",
              },
            ],
            baseUrl,
            preferencesUrl: `${baseUrl}/profile/preferences`,
            unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?token=test-token`,
            weekStart: "4. dec",
            weekEnd: "10. dec",
            // Override with database content
            ...digestContent,
          }) as React.ReactElement
        );
        emailSubject = template.subject
          .replace(/{weekStart}/g, "4. dec")
          .replace(/{weekEnd}/g, "10. dec");
        emailText = `Hej Test Bruger, her er ugens nyheder fra Estatenews.dk. Dette er en test email.`;
        break;

      case "password_reset":
        const resetContent = content as PasswordResetContent;
        emailHtml = await render(
          PasswordReset({
            userName: "Test Bruger",
            resetUrl: `${baseUrl}/auth/reset-password?token=test-reset-token`,
            expirationMinutes: 60,
            // Override with database content
            ...resetContent,
          }) as React.ReactElement
        );
        emailSubject = template.subject.replace(/{userName}/g, "Test Bruger");
        emailText = `Hej Test Bruger, dette er en test email for password reset.`;
        break;

      default:
        return NextResponse.json(
          { error: "Unknown template type" },
          { status: 400 }
        );
    }

    // Send the test email
    await sendEmail({
      to: recipientEmail,
      subject: `[TEST] ${emailSubject}`,
      text: emailText,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
