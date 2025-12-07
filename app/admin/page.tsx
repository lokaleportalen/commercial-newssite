"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ArticleList, type ArticleListRef } from "@/components/admin/article-list";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Newspaper, Sparkles, FolderTree, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const articleListRef = useRef<ArticleListRef>(null);

  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!session?.user) {
        router.push("/login");
        return;
      }

      try {
        // Check admin status by making a test request to admin API
        const response = await fetch("/api/admin/articles");
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

  const handleTriggerCron = async () => {
    setIsTriggeringCron(true);

    try {
      const response = await fetch("/api/admin/trigger-cron", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Failed to trigger task");
      }

      const data = await response.json();

      toast.success("News fetch started!", {
        description: "The job is running on Trigger.dev. New articles will appear when processing completes.",
        duration: 5000,
      });

      console.log("Trigger.dev task started:", data.taskId);
      console.log("Monitor at:", data.monitorUrl);

      // Keep button disabled for 5 minutes to prevent duplicate triggers
      setTimeout(() => {
        setIsTriggeringCron(false);
      }, 300000); // 5 minutes
    } catch (error) {
      console.error("Error triggering weekly news task:", error);
      toast.error("Failed to start news fetch", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setIsTriggeringCron(false);
    }
  };

  const handleCreateArticle = () => {
    // Open editor with special "new" ID - article will be created when user saves
    setSelectedArticleId("new");
  };

  const handleArticleCreated = (newArticleId: string) => {
    // Switch to the newly created article and refresh the list
    setSelectedArticleId(newArticleId);
    articleListRef.current?.refresh();
  };

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
      {/* Header with manual cron trigger */}
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage articles and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateArticle}
            size="sm"
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tilføj artikel
          </Button>
          <Link href="/admin/categories">
            <Button size="sm" variant="outline">
              <FolderTree className="mr-2 h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Link href="/admin/ai-prompts">
            <Button size="sm" variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Prompts
            </Button>
          </Link>
          <Button
            onClick={handleTriggerCron}
            disabled={isTriggeringCron}
            size="sm"
            variant={isTriggeringCron ? "default" : "outline"}
          >
            <Newspaper className="mr-2 h-4 w-4" />
            {isTriggeringCron ? "Job running..." : "Fetch weekly news"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Article List */}
        <div className="w-80 border-r bg-muted/30">
          <ArticleList
            ref={articleListRef}
            selectedArticleId={selectedArticleId}
            onSelectArticle={setSelectedArticleId}
          />
        </div>

        {/* Main Content - Article Editor */}
        <div className="flex-1 overflow-auto">
          {selectedArticleId ? (
            <ArticleEditor
              articleId={selectedArticleId}
              onClose={() => setSelectedArticleId(null)}
              onArticleCreated={handleArticleCreated}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Select an article to edit
                </h2>
                <p>Choose an article from the list to view and edit it</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
