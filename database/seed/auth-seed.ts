import { db } from "../db";
import { role } from "../schema/roles-schema";
import { auth } from "../../lib/auth";

export async function seedAuth() {
  console.log("Seeding auth data...");

  // Create test user using Better-Auth API
  const testUserResponse = await auth.api.signUpEmail({
    body: {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    },
  });

  if (!testUserResponse || !testUserResponse.user) {
    console.error("Failed to create test user");
    return;
  }

  const testUserId = testUserResponse.user.id;

  // Assign regular user role to test user
  await db.insert(role).values({
    id: `role-${testUserId}`,
    userId: testUserId,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✓ Created test user (test@example.com / password123)");

  // Create admin user using Better-Auth API
  const adminUserResponse = await auth.api.signUpEmail({
    body: {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
    },
  });

  if (!adminUserResponse || !adminUserResponse.user) {
    console.error("Failed to create admin user");
    return;
  }

  const adminUserId = adminUserResponse.user.id;

  // Assign admin role
  await db.insert(role).values({
    id: `role-${adminUserId}`,
    userId: adminUserId,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✓ Created admin user (admin@example.com / admin123)");
}
