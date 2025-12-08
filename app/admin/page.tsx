"use client";

import { useState, useRef } from "react";
import {
  ArticleList,
  type ArticleListRef,
} from "@/components/admin/article-list";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Button } from "@/components/ui/button";
import { AdminRoute } from "@/components/auth/admin-route";
import { toast } from "sonner";
import { Newspaper, Sparkles, Plus, FolderOpen, Mail, Settings } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        throw new Error(
          error.details || error.error || "Failed to trigger task"
        );
      }

      const data = await response.json();

      toast.success("Nyhedshentning startet!", {
        description:
          "Jobbet kører på Trigger.dev. Nye artikler vil vises når behandlingen er færdig.",
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
      toast.error("Kunne ikke starte nyhedshentning", {
        description: error instanceof Error ? error.message : "Ukendt fejl",
      });
      setIsTriggeringCron(false);
    }
  };

  const handleCreateArticle = () => {
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
              Administrer artikler og indhold
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreateArticle} size="sm" variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Tilføj artikel
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Indstillinger
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Konfiguration</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/admin/categories" className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>Kategorier</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/ai-prompts" className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>AI Prompts</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/email-templates" className="cursor-pointer">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email Skabeloner</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System Indstillinger</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleTriggerCron}
                  disabled={isTriggeringCron}
                  className="cursor-pointer"
                >
                  <Newspaper className="mr-2 h-4 w-4" />
                  <span>{isTriggeringCron ? "Job kører..." : "Hent dagens nyheder"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    Vælg en artikel at redigere
                  </h2>
                  <p>Vælg en artikel fra listen for at se og redigere den</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
