-- Migration: Update user preferences schema
-- Changes:
-- 1. Drop old news_category column (text)
-- 2. Add new news_categories column (jsonb array)
-- 3. Update email_frequency default from 'daily' to 'ugentligt'

-- Drop the old news_category column
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "news_category";

-- Add the new news_categories column as JSONB
ALTER TABLE "user_preferences" ADD COLUMN "news_categories" jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Update the email_frequency default value
ALTER TABLE "user_preferences" ALTER COLUMN "email_frequency" SET DEFAULT 'ugentligt';
