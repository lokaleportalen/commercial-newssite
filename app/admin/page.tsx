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
import {
  Newspaper,
  Sparkles,
  Plus,
  FolderOpen,
  Mail,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSearchModal } from "@/components/admin/user-search-modal";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import SettingsButton from "@/components/admin/settings-btn";

export default function AdminDashboard() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const articleListRef = useRef<ArticleListRef>(null);

  const handleCreateArticle = () => {
    setSelectedArticleId("new");
  };

  const handleArticleCreated = (newArticleId: string) => {
    // Switch to the newly created article and refresh the list
    setSelectedArticleId(newArticleId);
    articleListRef.current?.refresh();
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setShowUserSearch(false);
    setShowUserEdit(true);
  };

  const handleUserUpdated = () => {
    // Could refresh user data here if needed
    setSelectedUser(null);
  };

  const handleBackToSearch = () => {
    setShowUserEdit(false);
    setShowUserSearch(true);
  };

  return (
    <AdminRoute>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header with manual cron trigger */}
        <header className="border-b bg-background px-6 py-3 flex items-center justify-between">
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
            <Button
              onClick={() => setShowUserSearch(true)}
              size="sm"
              variant="outline"
            >
              <Users className="mr-2 h-4 w-4" />
              Find bruger
            </Button>

            <SettingsButton />
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Article List */}
          <aside
            aria-label="Article list"
            className="w-80 border-r bg-muted/30"
          >
            <ArticleList
              ref={articleListRef}
              selectedArticleId={selectedArticleId}
              onSelectArticle={setSelectedArticleId}
            />
          </aside>

          {/* Main Content - Article Editor */}
          <main className="flex-1 overflow-auto">
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
          </main>
        </div>

        {/* User Search Modal */}
        <UserSearchModal
          open={showUserSearch}
          onOpenChange={setShowUserSearch}
          onUserSelect={handleUserSelect}
        />

        {/* User Edit Modal */}
        <UserEditModal
          open={showUserEdit}
          onOpenChange={setShowUserEdit}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
          onBack={handleBackToSearch}
        />
      </div>
    </AdminRoute>
  );
}
