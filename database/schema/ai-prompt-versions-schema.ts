import { pgTable, text, timestamp, uuid, index, unique } from "drizzle-orm/pg-core";
import { aiPrompt } from "./ai-prompts-schema";
import { user } from "./auth-schema";

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
  updatedAt: timestamp("updated_at") // FIX: Added missing updatedAt column
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdBy: text("created_by") // FIX: Added FK constraint to user table
    .references(() => user.id, { onDelete: "set null" }),
}, (table) => ({
  promptIdIdx: index("idx_ai_prompt_version_prompt_id").on(table.promptId),
  promptVersionUnique: unique("uq_ai_prompt_version_prompt_version").on(table.promptId, table.versionNumber), // FIX: Added unique constraint
}));
