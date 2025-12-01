import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const aiPrompt = pgTable("ai_prompt", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // Unique identifier for the prompt (e.g., "news_fetch", "article_research")
  name: text("name").notNull(), // Human-readable name
  description: text("description"), // Description of what this prompt does
  model: text("model").notNull(), // AI model used (e.g., "gpt-4o", "gemini-3-pro")
  section: text("section").notNull(), // Section/category (e.g., "Weekly News", "Article Generation", "Image Generation")
  prompt: text("prompt").notNull(), // The actual prompt text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
