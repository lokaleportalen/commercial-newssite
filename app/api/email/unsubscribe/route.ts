import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { userPreferences, userPreferenceCategory } from "@/database/schema";
import { eq } from "drizzle-orm";
import { verifyUnsubscribeToken } from "@/lib/email";

/**
 * One-click unsubscribe endpoint
 * GET /api/email/unsubscribe?token=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Ugyldig afmeldings-link" },
      { status: 400 }
    );
  }

  // Verify the token
  const decoded = verifyUnsubscribeToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Ugyldig eller udløbet afmeldings-link" },
      { status: 400 }
    );
  }

  const { userId } = decoded;

  try {
    // First, check if user preferences exist
    const existingPrefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existingPrefs.length === 0) {
      // Create preferences with weekly frequency to unsubscribe
      await db.insert(userPreferences).values({
        id: `pref_${userId}`,
        userId,
        allCategories: false,
        emailFrequency: "weekly", // This will effectively unsubscribe them from immediate emails
      });

      // Delete all category preferences (if any)
      await db
        .delete(userPreferenceCategory)
        .where(eq(userPreferenceCategory.userPreferencesId, `pref_${userId}`));
    } else {
      const prefId = existingPrefs[0].id;

      // Update preferences to unsubscribe
      await db
        .update(userPreferences)
        .set({
          allCategories: false,
          emailFrequency: "weekly", // Remove immediate notifications
        })
        .where(eq(userPreferences.id, prefId));

      // Delete all category preferences
      await db
        .delete(userPreferenceCategory)
        .where(eq(userPreferenceCategory.userPreferencesId, prefId));
    }

    // Return HTML page confirming unsubscribe
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Afmeldt - Estatenews.dk</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f6f9fc;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 48px;
              max-width: 500px;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            h1 {
              color: #1a1a1a;
              font-size: 28px;
              margin: 0 0 16px;
            }
            p {
              color: #404040;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 32px;
            }
            .button {
              display: inline-block;
              background-color: #E87722;
              color: white;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 16px;
              margin: 8px;
            }
            .button-secondary {
              background-color: white;
              color: #E87722;
              border: 2px solid #E87722;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✓</div>
            <h1>Du er nu afmeldt</h1>
            <p>
              Du vil ikke længere modtage emails fra Estatenews.dk.
              Dine email-præferencer er blevet fjernet.
            </p>
            <p>
              Hvis du skifter mening, kan du til enhver tid tilmelde dig igen
              ved at logge ind og opdatere dine præferencer.
            </p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">
              Gå til Estatenews.dk
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/preferences" class="button button-secondary">
              Administrer præferencer
            </a>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Failed to unsubscribe user:", error);
    return NextResponse.json(
      { error: "Der opstod en fejl. Prøv venligst igen senere." },
      { status: 500 }
    );
  }
}
