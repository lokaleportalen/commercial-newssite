import { pgTable, text, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { aiPrompt } from "./ai-prompts-schema";

export const article = pgTable("article", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary"),
  metaDescription: text("meta_description"),
  image: text("image"),
  sources: jsonb("sources").$type<string[]>().default([]),
  status: text("status").notNull().default("draft"),
  publishedDate: timestamp("published_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  promptId: uuid("prompt_id").references(() => aiPrompt.id, {
    onDelete: "set null",
  }),
  searchVector: text("search_vector").$type<string>(),
}, (table) => ({
  statusIdx: index("idx_article_status").on(table.status),
  publishedDateIdx: index("idx_article_published_date").on(table.publishedDate.desc()),
  statusPublishedIdx: index("idx_article_status_published").on(table.status, table.publishedDate.desc()),
  promptIdIdx: index("idx_article_prompt_id").on(table.promptId),
  searchVectorIdx: index("idx_article_search_vector").using("gin", sql`to_tsvector('danish', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))`),
}));
