"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { AiPromptList } from "@/components/admin/ai-prompt-list";
import { AiPromptEditor } from "@/components/admin/ai-prompt-editor";

export default function AiPromptsAdminPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!session?.user) {
        router.push("/login");
        return;
      }

      try {
        // Check admin status by making a test request to admin API
        const response = await fetch("/api/admin/ai-prompts");
        if (response.status === 403 || response.status === 401) {
          router.push("/");
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    }

    if (!isPending) {
      checkAdminStatus();
    }
  }, [session, isPending, router]);

  if (isPending || isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold">AI Prompts Management</h1>
          <p className="text-sm text-muted-foreground">
            Configure AI prompts for article generation and image creation
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Prompt List */}
        <div className="w-80 border-r bg-muted/30">
          <AiPromptList
            selectedPromptId={selectedPromptId}
            onSelectPrompt={setSelectedPromptId}
          />
        </div>

        {/* Main Content - Prompt Editor */}
        <div className="flex-1 overflow-auto">
          {selectedPromptId ? (
            <AiPromptEditor
              promptId={selectedPromptId}
              onClose={() => setSelectedPromptId(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Select an AI prompt to edit
                </h2>
                <p>Choose a prompt from the list to view and edit it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
