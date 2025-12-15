import { pgTable, text, timestamp, boolean, index, uuid, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./categories-schema";

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // News category preferences - if true, user wants all categories
  allCategories: boolean("all_categories").notNull().default(true),

  // Email frequency (hyppighed for nyheder)
  emailFrequency: text("email_frequency").notNull().default("weekly"), // weekly, immediate, none

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index("idx_user_preferences_user_id").on(table.userId),
}));

// Junction table for user-selected categories (when allCategories is false)
export const userPreferenceCategory = pgTable(
  "user_preference_category",
  {
    userPreferencesId: text("user_preferences_id")
      .notNull()
      .references(() => userPreferences.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userPreferencesId, table.categoryId] }),
      categoryIdIdx: index("idx_user_preference_category_category_id").on(table.categoryId),
      userPreferencesIdIdx: index("idx_user_preference_category_user_preferences_id").on(table.userPreferencesId),
    };
  }
);
