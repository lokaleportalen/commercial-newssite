import { db } from "../db";
import { user } from "../schema/auth-schema";

/**
 * Hashes a password using bcrypt to match Better Auth's hashing algorithm
 * Uses 10 salt rounds, which is the default for Better Auth
 */
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

export async function seedAuth() {
  console.log("Seeding auth data...");

  // Create user with properly hashed password
  const hashedPassword = await hashPassword("password123");

  await db.insert(user).values({
    id: "052d14e2-a373-430f-a2f7-584a0f7ce551",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✓ Created test user (test@example.com / password123)");
}
