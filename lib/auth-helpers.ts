import { auth } from "./auth";
import { db } from "@/database/db";
import { role } from "@/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Get the current user's session from the request
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(roleToCheck: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  try {
    const userRole = await db
      .select()
      .from(role)
      .where(eq(role.userId, user.id))
      .limit(1);

    if (!userRole || userRole.length === 0) {
      return false;
    }

    return userRole[0].role === roleToCheck;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Require the user to be authenticated
 * Throws an error if the user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require the user to have admin role
 * Throws an error if the user is not an admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}
