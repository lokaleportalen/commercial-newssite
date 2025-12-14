"use client";

import { authClient } from "@/lib/auth-client";
import type { ClientSessionData } from "@/types/auth";

/**
 * Hook to get the current user's role from the session
 * Role is automatically included in the session via Better-Auth customSession plugin
 */
export function useUserRole() {
  const { data: session, isPending } = authClient.useSession() as { data: ClientSessionData | null; isPending: boolean };

  return {
    role: session?.role ?? "user",
    isLoading: isPending,
    isAdmin: session?.role === "admin",
  };
}
