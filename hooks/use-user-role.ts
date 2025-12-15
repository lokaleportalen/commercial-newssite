"use client";

import { authClient } from "@/lib/auth-client";
import type { ClientSessionData } from "@/types/auth";

export function useUserRole() {
  const { data: session, isPending } = authClient.useSession() as { data: ClientSessionData | null; isPending: boolean };

  return {
    role: session?.role ?? "user",
    isLoading: isPending,
    isAdmin: session?.role === "admin",
  };
}
