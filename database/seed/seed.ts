import { config } from "dotenv";
import { resolve } from "path";
import { seedAuth } from "./auth-seed";

// Load .env from root directory
config({ path: resolve(__dirname, "../../.env") });

async function seed() {
  console.log("Starting database seed...\n");

  try {
    await seedAuth();

    console.log("\n✓ All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Seed failed:", error);
    process.exit(1);
  }
}

seed();
