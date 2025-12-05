ALTER TABLE "article" ADD COLUMN "sources" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "article" DROP COLUMN "source_url";