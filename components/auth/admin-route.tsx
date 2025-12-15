"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2 } from "lucide-react";
import type { ClientSessionData } from "@/types/auth";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession() as { data: ClientSessionData | null; isPending: boolean };
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  const isLoading = sessionPending || roleLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!session || !isAdmin) {
        router.push("/");
      }
    }
  }, [isLoading, session, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
