"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import type { ClientSessionData } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession() as { data: ClientSessionData | null; isPending: boolean };

  useEffect(() => {
    // Only redirect if we're done loading and there's no session
    if (!isPending && !session) {
      router.push("/");
    }
  }, [isPending, session, router]);

  // Show loading spinner while checking session
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render children if no session (will redirect)
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
