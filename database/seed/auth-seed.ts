import { db } from "../db";
import { user, account } from "../auth-schema";

async function seedAuth() {
  console.log("Starting auth seed...");

  // Create user
  await db.insert(user).values({
    id: "052d14e2-a373-430f-a2f7-584a0f7ce551",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Created user!");
}

seedAuth()
  .then(() => {
    console.log("\n✓ Auth seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Auth seed failed:", error);
    process.exit(1);
  });
