import { db } from "../db";
import { emailTemplate } from "../schema/email-templates-schema";
import type {
  WelcomeEmailContent,
  ArticleNotificationContent,
  WeeklyDigestContent,
  PasswordResetContent,
} from "../schema/email-templates-schema";

export async function seedEmailTemplates() {
  console.log("Seeding email templates...");

  const templates = [
    {
      key: "welcome",
      name: "Welcome Email",
      description: "Sent to new users when they sign up for Estatenews.dk",
      subject: "Velkommen til Estatenews.dk",
      previewText:
        "Velkommen til Estatenews.dk - Din kilde til erhvervsejendomsnyheder",
      content: JSON.stringify({
        heading: "Velkommen til Estatenews.dk!",
        greeting: "Hej {userName},",
        introParagraph:
          "Tak fordi du tilmeldte dig Estatenews.dk. Vi er glade for at have dig med i vores fællesskab af erhvervsejendomsinteresserede.",
        descriptionParagraph:
          "Du vil modtage ugentlige nyheder om den danske erhvervsejendomsbranche - alt fra nye projekter og transaktioner til markedstendenser og analyser.",
        primaryCtaText: "Læs de nyeste artikler",
        preferencesInfoParagraph:
          "Du kan til enhver tid tilpasse dine præferencer og vælge hvilke kategorier du ønsker at modtage nyheder om.",
        secondaryCtaText: "Administrer præferencer",
        closingText: "Vi glæder os til at holde dig opdateret!",
        signatureText: "Estatenews.dk teamet",
      } as WelcomeEmailContent),
      isActive: true,
    },
    {
      key: "article_notification",
      name: "Article Notification",
      description:
        "Sent immediately when a new article is published to users with immediate notification preference",
      subject: "Ny artikel: {articleTitle}",
      previewText: "Ny artikel: {articleTitle}",
      content: JSON.stringify({
        primaryCtaText: "Læs hele artiklen",
        footerText:
          "Du modtager denne email, fordi du har valgt at modtage nye artikler med det samme.",
      } as ArticleNotificationContent),
      isActive: true,
    },
    {
      key: "weekly_digest",
      name: "Weekly Digest",
      description:
        "Sent every Saturday at 10 AM with a digest of all articles from the past week",
      subject: "Ugens erhvervsejendomsnyheder ({weekStart} - {weekEnd})",
      previewText: "Ugens erhvervsejendomsnyheder ({weekStart} - {weekEnd})",
      content: JSON.stringify({
        heading: "Ugens nyheder om erhvervsejendomme",
        greeting: "Hej {userName},",
        introParagraph:
          "Her er ugens vigtigste nyheder inden for den danske erhvervsejendomsbranche ({weekStart} - {weekEnd}):",
        noArticlesMessage:
          "Der er ingen nye artikler i denne uge, der matcher dine præferencer.",
        articleCtaText: "Læs mere",
        footerText:
          "Du modtager denne ugentlige oversigt baseret på dine præferencer. Du kan til enhver tid ændre dine indstillinger eller afmelde dig.",
        finalCtaText: "Se alle artikler på Estatenews.dk",
      } as WeeklyDigestContent),
      isActive: true,
    },
    {
      key: "password_reset",
      name: "Password Reset",
      description: "Sent when a user requests to reset their password",
      subject: "Nulstil din adgangskode til Estatenews.dk",
      previewText: "Nulstil din adgangskode til Estatenews.dk",
      content: JSON.stringify({
        heading: "Nulstil din adgangskode",
        greeting: "Hej {userName},",
        requestParagraph:
          "Vi har modtaget en anmodning om at nulstille adgangskoden til din Estatenews.dk konto.",
        instructionsParagraph:
          "Klik på knappen nedenfor for at nulstille din adgangskode. Dette link er kun gyldigt i {expirationMinutes} minutter af sikkerhedsmæssige årsager.",
        primaryCtaText: "Nulstil adgangskode",
        warningHeading: "Har du ikke anmodet om dette?",
        warningText:
          "Hvis du ikke har anmodet om at nulstille din adgangskode, kan du trygt ignorere denne email. Din adgangskode vil forblive uændret.",
        linkFallbackText:
          "Hvis knappen ikke virker, kan du kopiere og indsætte følgende link i din browser:",
        closingText: "Med venlig hilsen,",
        signatureText: "Estatenews.dk teamet",
      } as PasswordResetContent),
      isActive: true,
    },
  ];

  await db.insert(emailTemplate).values(templates);

  console.log(`✓ Created ${templates.length} email templates`);
}
