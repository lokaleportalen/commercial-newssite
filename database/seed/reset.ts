import { config } from "dotenv";
import { resolve } from "path";
import { db } from "../db";
import { user, session, account, verification } from "../schema/auth-schema";
import { article } from "../schema/articles-schema";
import { category, articleCategory } from "../schema/categories-schema";
import { aiPrompt } from "../schema/ai-prompts-schema";
import { aiPromptVersion } from "../schema/ai-prompt-versions-schema";
import { role } from "../schema/roles-schema";
import { userPreferences } from "../schema/user-preferences-schema";
import { emailTemplate } from "../schema/email-templates-schema";
import { systemSettings } from "../schema/system-settings-schema";
import { seed } from "./seed";

config({ path: resolve(__dirname, "../../.env") });

async function reset() {
  console.log("Clearing all tables...\n");

  try {
    // Clear tables with foreign keys first (in correct order)
    await db.delete(articleCategory);
    console.log("✓ Cleared article categories");

    await db.delete(session);
    console.log("✓ Cleared sessions");

    await db.delete(account);
    console.log("✓ Cleared accounts");

    await db.delete(verification);
    console.log("✓ Cleared verifications");

    await db.delete(role);
    console.log("✓ Cleared roles");

    await db.delete(userPreferences);
    console.log("✓ Cleared user preferences");

    await db.delete(aiPromptVersion);
    console.log("✓ Cleared AI prompt versions");

    await db.delete(article);
    console.log("✓ Cleared articles");

    await db.delete(aiPrompt);
    console.log("✓ Cleared AI prompts");

    await db.delete(emailTemplate);
    console.log("✓ Cleared email templates");

    await db.delete(systemSettings);
    console.log("✓ Cleared system settings");

    await db.delete(category);
    console.log("✓ Cleared categories");

    // Clear user table last (has foreign key references)
    await db.delete(user);
    console.log("✓ Cleared users");

    console.log("\n--- Re-seeding database ---\n");

    await seed();

    console.log("\n✓ Database cleared and re-seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Reset failed:", error);
    process.exit(1);
  }
}

reset();
