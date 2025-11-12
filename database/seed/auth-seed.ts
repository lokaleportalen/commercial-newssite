import { db } from "../db";
import { user, account } from "../auth-schema";
import { randomUUID } from "crypto";

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

async function seedAuth() {
  console.log("Starting auth seed...");

  const userId = randomUUID();
  const accountId = randomUUID();

  // Create user
  await db.insert(user).values({
    id: userId,
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Created user:", { id: userId, email: "test@example.com" });

  const hashedPassword = await hashPassword("password123");

  await db.insert(account).values({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Created account with password");
  console.log("\nLogin credentials:");
  console.log("Email: test@example.com");
  console.log("Password: password123");
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
