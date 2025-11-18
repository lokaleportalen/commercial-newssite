import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const image = pgTable("image", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Image URLs
  url: text("url").notNull(), // Unsplash URL (or future storage URL)
  unsplashUrl: text("unsplash_url"), // Link to Unsplash photo page for attribution

  // Copyright & Attribution (legally required)
  photographerName: text("photographer_name").notNull(), // "John Doe"
  photographerUrl: text("photographer_url"), // Link to photographer's Unsplash profile
  license: text("license").notNull().default("Unsplash License"), // License type

  // Unsplash-specific data
  unsplashId: text("unsplash_id").unique(), // Unsplash photo ID for deduplication
  downloadLocation: text("download_location"), // Unsplash download tracking URL (required by API terms)

  // Metadata
  description: text("description"), // Alt text / photo description

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
