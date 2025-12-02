import { config } from "dotenv";
import { resolve } from "path";
import { seedAuth } from "./auth-seed";
import { seedCategories } from "./categories-seed";
import { seedArticles } from "./articles-seed";
import { seedAiPrompts } from "./ai-prompts-seed";

config({ path: resolve(__dirname, "../../.env") });

export async function seed() {
  console.log("Starting database seed...\n");

  await seedAuth();
  await seedCategories();
  await seedAiPrompts();
  await seedArticles();

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
