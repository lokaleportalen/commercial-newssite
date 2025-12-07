"use client";

import { useState, useRef } from "react";
import { ArticleList, type ArticleListRef } from "@/components/admin/article-list";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Button } from "@/components/ui/button";
import { AdminRoute } from "@/components/auth/admin-route";
import { toast } from "sonner";
import { Newspaper, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const articleListRef = useRef<ArticleListRef>(null);

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

  return (
    <AdminRoute>
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
    </AdminRoute>
  );
}
