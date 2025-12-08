import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const emailTemplate = pgTable("email_template", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // Unique identifier (e.g., "welcome", "article_notification", "weekly_digest", "password_reset")
  name: text("name").notNull(), // Human-readable name
  description: text("description"), // Description of what this email is for
  subject: text("subject").notNull(), // Email subject line
  previewText: text("preview_text").notNull(), // Preview text shown in email clients
  content: text("content").notNull(), // JSON string containing all editable content blocks
  isActive: boolean("is_active").default(true).notNull(), // Whether this template is active
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Type definitions for content structure of each template
export type WelcomeEmailContent = {
  heading: string;
  greeting: string; // "Hej {userName},"
  introParagraph: string;
  descriptionParagraph: string;
  primaryCtaText: string;
  preferencesInfoParagraph: string;
  secondaryCtaText: string;
  closingText: string;
  signatureText: string;
};

export type ArticleNotificationContent = {
  primaryCtaText: string;
  footerText: string;
};

export type WeeklyDigestContent = {
  heading: string;
  greeting: string; // "Hej {userName},"
  introParagraph: string; // Should include {weekStart} and {weekEnd}
  noArticlesMessage: string;
  articleCtaText: string;
  footerText: string;
  finalCtaText: string;
};

export type PasswordResetContent = {
  heading: string;
  greeting: string; // "Hej {userName},"
  requestParagraph: string;
  instructionsParagraph: string; // Should mention {expirationMinutes}
  primaryCtaText: string;
  warningHeading: string;
  warningText: string;
  linkFallbackText: string;
  closingText: string;
  signatureText: string;
};
