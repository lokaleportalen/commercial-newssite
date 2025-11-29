import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // News category preferences (multiple categories supported)
  // Array of category slugs: ["investering", "byggeri", "kontor", etc.]
  newsCategories: json("news_categories")
    .$type<string[]>()
    .notNull()
    .default([]),

  // Email frequency (hyppighed for nyheder)
  // Options: "straks" (immediate), "ugentligt" (weekly), "aldrig" (never)
  emailFrequency: text("email_frequency").notNull().default("ugentligt"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
