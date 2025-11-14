import { pgTable, text, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { article } from "./articles-schema";

// Categories table with fixed Danish categories
export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // Danish category name
  slug: text("slug").notNull().unique(), // URL-friendly slug
  description: text("description"), // Optional description
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Junction table for many-to-many relationship between articles and categories
export const articleCategory = pgTable(
  "article_category",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.articleId, table.categoryId] }),
    };
  }
);
