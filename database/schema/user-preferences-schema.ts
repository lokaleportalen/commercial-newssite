import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // News category preferences (jeg ønsker)
  newsCategory: text("news_category").notNull().default("all"), // all, investment, construction, new, old

  // Email frequency (hyppighed for nyheder)
  emailFrequency: text("email_frequency").notNull().default("daily"), // daily, weekly, immediate

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
