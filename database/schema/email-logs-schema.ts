import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { article } from "./articles-schema";

export const emailLog = pgTable(
  "email_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emailType: text("email_type", {
      enum: ["welcome", "article_notification", "weekly_digest", "password_reset"],
    }).notNull(),
    articleId: uuid("article_id").references(() => article.id, {
      onDelete: "set null",
    }),
    sentAt: timestamp("sent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: text("status", { enum: ["success", "failed"] })
      .notNull()
      .default("success"),
  },
  (table) => ({
    userIdIdx: index("email_log_user_id_idx").on(table.userId),
    sentAtIdx: index("email_log_sent_at_idx").on(table.sentAt),
    userIdSentAtIdx: index("email_log_user_id_sent_at_idx").on(
      table.userId,
      table.sentAt
    ),
  })
);

export type EmailLog = typeof emailLog.$inferSelect;
export type NewEmailLog = typeof emailLog.$inferInsert;
