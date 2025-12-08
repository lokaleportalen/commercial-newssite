"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  const isLoading = sessionPending || roleLoading;

  useEffect(() => {
    // Only redirect if we're done loading
    if (!isLoading) {
      if (!session || !isAdmin) {
        router.push("/");
      }
    }
  }, [isLoading, session, isAdmin, router]);

  // Show loading spinner while checking session and role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render children if not admin (will redirect)
  if (!session || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}
