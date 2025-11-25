"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ArticleList } from "@/components/admin/article-list";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Article List */}
      <div className="w-80 border-r bg-muted/30">
        <ArticleList
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
  );
}
