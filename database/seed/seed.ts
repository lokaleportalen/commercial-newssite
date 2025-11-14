import { config } from "dotenv";
import { resolve } from "path";
import { seedAuth } from "./auth-seed";
import { seedCategories } from "./categories-seed";

config({ path: resolve(__dirname, "../../.env") });

export async function seed() {
  console.log("Starting database seed...\n");

  await seedAuth();
  await seedCategories();

  console.log("\n✓ All seeds completed successfully!");
}

// Only run if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n✗ Seed failed:", error);
      process.exit(1);
    });
}
