import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { aiPrompt } from "./ai-prompts-schema";

export const aiPromptVersion = pgTable("ai_prompt_version", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: uuid("prompt_id")
    .notNull()
    .references(() => aiPrompt.id, { onDelete: "cascade" }),

  // Snapshot of the prompt at this version
  name: text("name").notNull(),
  description: text("description"),
  model: text("model").notNull(),
  section: text("section").notNull(),
  prompt: text("prompt").notNull(),

  // Metadata about this version
  versionNumber: text("version_number").notNull(), // e.g., "1.0", "1.1", "2.0"
  changeDescription: text("change_description"), // Optional description of what changed

  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"), // Could link to user table in future
});
