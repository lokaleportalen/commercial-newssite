import { config } from "dotenv";
import { resolve } from "path";
import { seedEmailTemplates } from "./email-templates-seed";

config({ path: resolve(__dirname, "../../.env") });

async function seedEmailOnly() {
  console.log("Seeding email templates only...\n");

  try {
    await seedEmailTemplates();
    console.log("\n✓ Email templates seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Seed failed:", error);
    process.exit(1);
  }
}

seedEmailOnly();
