import { db } from "../db";
import { user, account } from "../schema/auth-schema";
import { role } from "../schema/roles-schema";

export async function seedAuth() {
  console.log("Seeding auth data...");

  // Create test user
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

  // Assign regular user role to test user
  await db.insert(role).values({
    id: "role-052d14e2-a373-430f-a2f7-584a0f7ce551",
    userId: "052d14e2-a373-430f-a2f7-584a0f7ce551",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✓ Created test user (test@example.com)");

  // Create admin user
  await db.insert(user).values({
    id: "admin-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Admin User",
    email: "admin@example.com",
    emailVerified: true,
    image: null,
    password: "admin123",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Assign admin role
  await db.insert(role).values({
    id: "role-admin-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userId: "admin-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✓ Created admin user (admin@example.com / admin123)");
}
