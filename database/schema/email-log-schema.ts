import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Email log table for tracking sent emails and enforcing rate limits
 */
export const emailLog = pgTable(
  "email_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emailType: text("email_type").notNull(), // 'welcome', 'article_notification', 'weekly_digest', 'password_reset'
    recipient: text("recipient").notNull(), // Email address
    subject: text("subject").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_email_log_user_id").on(table.userId),
    sentAtIdx: index("idx_email_log_sent_at").on(table.sentAt.desc()),
    userSentIdx: index("idx_email_log_user_sent").on(table.userId, table.sentAt.desc()),
  })
);
