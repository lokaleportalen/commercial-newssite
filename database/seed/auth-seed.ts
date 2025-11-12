import { db } from "../db";
import { user, account } from "../schema/auth-schema";

export async function seedAuth() {
  console.log("Seeding auth data...");

  // Create user
  await db.insert(user).values({
    id: "052d14e2-a373-430f-a2f7-584a0f7ce551",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    password: "password123",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✓ Created test user (test@example.com)");
}
