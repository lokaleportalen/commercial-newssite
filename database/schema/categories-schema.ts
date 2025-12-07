import { pgTable, text, uuid, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { article } from "./articles-schema";

// Categories table with fixed Danish categories
export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // Danish category name
  slug: text("slug").notNull().unique(), // URL-friendly slug
  description: text("description"), // Optional description
  heroImage: text("hero_image"), // Static hero image for category page
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  // Full-text search vector for category names
  searchVector: text("search_vector").$type<string>(),
}, (table) => ({
  // GIN index for full-text search on category names
  searchVectorIdx: index("idx_category_search_vector").using("gin", sql`to_tsvector('danish', COALESCE(name, '') || ' ' || COALESCE(description, ''))`),
}));

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
      categoryIdIdx: index("idx_article_category_category_id").on(table.categoryId),
      articleIdIdx: index("idx_article_category_article_id").on(table.articleId),
    };
  }
);
