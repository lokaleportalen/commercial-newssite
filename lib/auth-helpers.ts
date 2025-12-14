import { auth } from "./auth";
import { headers } from "next/headers";
import type { ExtendedSession } from "@/types/auth";

/**
 * Get the current user's session from the request
 * Includes custom fields like role
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session as ExtendedSession | null;
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
 * Get the current user's role from the session
 */
export async function getUserRole(): Promise<string> {
  const session = await getSession();
  return session?.role ?? "user";
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(roleToCheck: string): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    return false;
  }
  return session.role === roleToCheck;
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
