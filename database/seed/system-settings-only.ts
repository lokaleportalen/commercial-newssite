import { config } from "dotenv";
import { resolve } from "path";
import { seedSystemSettings } from "./system-settings-seed";

config({ path: resolve(__dirname, "../../.env") });

async function seedSettingsOnly() {
  console.log("Seeding system settings only...\n");

  try {
    await seedSystemSettings();
    console.log("\n✓ System settings seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Seed failed:", error);
    process.exit(1);
  }
}

seedSettingsOnly();
