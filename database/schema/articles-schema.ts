import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const article = pgTable("article", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary"),
  metaDescription: text("meta_description"),
  image: text("image"),
  sourceUrl: text("source_url"),
  categories: text("categories"), // Store as comma-separated values or JSON string
  // TODO: Migrate to proper categories table with fixed values for better consistency and filtering
  status: text("status").notNull().default("draft"), // draft, published, archived
  publishedDate: timestamp("published_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
