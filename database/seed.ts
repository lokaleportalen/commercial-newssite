import { db } from "./db";
import { user } from "./auth-schema";
import { randomUUID } from "crypto";

/**
 * Hash password using scrypt (Better Auth's default hashing algorithm)
 * Format: algorithm$salt$hash (e.g., "scrypt$salt$hash")
 */
async function hashPassword(password: string): Promise<string> {
  const crypto = await import("crypto");

  return new Promise((resolve, reject) => {
    // Generate a random salt (16 bytes)
    const salt = crypto.randomBytes(16).toString("hex");

    // Hash the password using scrypt
    // N: CPU/memory cost (16384), r: block size (8), p: parallelization (1)
    // keylen: 64 bytes output
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);

      // Format: scrypt$salt$hash
      const hash = derivedKey.toString("hex");
      resolve(`scrypt$${salt}$${hash}`);
    });
  });
}

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create sample users with hashed passwords
    const users = [
      {
        id: randomUUID(),
        name: "John Doe",
        email: "john@example.com",
        password: await hashPassword("password123"),
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Jane Smith",
        email: "jane@example.com",
        password: await hashPassword("password123"),
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Admin User",
        email: "admin@example.com",
        password: await hashPassword("admin123"),
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert users
    for (const userData of users) {
      await db.insert(user).values(userData).onConflictDoNothing();
      console.log(`✅ Created user: ${userData.email}`);
    }

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("Seed process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  });
