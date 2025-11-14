import { config } from "dotenv";
import { resolve } from "path";
import { db } from "../db";
import { user, session, account, verification } from "../schema/auth-schema";
import { article } from "../schema/articles-schema";
import { seed } from "./seed";

config({ path: resolve(__dirname, "../../.env") });

async function reset() {
  console.log("Clearing all tables...\n");

  try {
    await db.delete(session);
    console.log("✓ Cleared sessions");

    await db.delete(account);
    console.log("✓ Cleared accounts");

    await db.delete(verification);
    console.log("✓ Cleared verifications");

    await db.delete(article);
    console.log("✓ Cleared articles");

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
