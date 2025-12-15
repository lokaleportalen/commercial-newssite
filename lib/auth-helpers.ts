import { auth } from "./auth";
import { headers } from "next/headers";
import type { ExtendedSession } from "@/types/auth";

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

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getUserRole(): Promise<string> {
  const session = await getSession();
  return session?.role ?? "user";
}

export async function hasRole(roleToCheck: string): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    return false;
  }
  return session.role === roleToCheck;
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}
