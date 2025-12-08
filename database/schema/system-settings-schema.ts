import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // Setting key (e.g., "ai_provider")
  value: text("value").notNull(), // Setting value (e.g., "openai", "gemini", "claude")
  description: text("description"), // Human-readable description
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Valid AI providers
export const AI_PROVIDERS = ["openai", "gemini", "claude"] as const;
export type AIProvider = (typeof AI_PROVIDERS)[number];
