"use client";

import { useEffect, useState, useMemo, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Article = {
  id: string;
  title: string;
  status: string;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
  prompt?: {
    id: string;
    key: string;
    name: string;
    model: string;
  } | null;
};

type ArticleListProps = {
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
};

export type ArticleListRef = {
  refresh: () => void;
};

export const ArticleList = forwardRef<ArticleListRef, ArticleListProps>(
  function ArticleList({ selectedArticleId, onSelectArticle }, ref) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch articles
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/articles");
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchArticles();
    }, []);

    // Expose refresh method via ref
    useImperativeHandle(ref, () => ({
      refresh: fetchArticles,
    }));

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      return articles;
    }

    const query = searchQuery.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.summary?.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  // Handle selection toggle
  const toggleSelection = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  // Handle select all toggle
  const toggleSelectAll = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(filteredArticles.map((a) => a.id)));
    }
  };

  // Handle individual delete
  const handleDeleteClick = (articleId: string) => {
    setArticleToDelete(articleId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/articles/${articleToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Article deleted successfully");
        await fetchArticles();
        setSelectedArticles(new Set());
      } else {
        toast.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Error deleting article");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setArticleToDelete(null);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedArticles.size === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const deletePromises = Array.from(selectedArticles).map((articleId) =>
        fetch(`/api/admin/articles/${articleId}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.ok).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} article${successCount > 1 ? "s" : ""} deleted successfully`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} article${failCount > 1 ? "s" : ""}`);
      }

      await fetchArticles();
      setSelectedArticles(new Set());
    } catch (error) {
      console.error("Error deleting articles:", error);
      toast.error("Error deleting articles");
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Published";
      default:
        return "Draft";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Bulk actions */}
        {selectedArticles.size > 0 && (
          <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md">
            <span className="text-sm font-medium">
              {selectedArticles.size} selected
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDeleteClick}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Article List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 mb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? "No articles found" : "No articles yet"}
            </div>
          ) : (
            <>
              {/* Select all checkbox */}
              <div className="flex items-center gap-2 p-2 mb-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedArticles.size === filteredArticles.length && filteredArticles.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">
                  Select all
                </span>
              </div>
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg mb-2 transition-colors",
                    "hover:bg-accent",
                    selectedArticleId === article.id
                      ? "bg-accent border-2 border-primary"
                      : "border border-transparent"
                  )}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedArticles.has(article.id)}
                    onChange={() => toggleSelection(article.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 mt-1 rounded border-gray-300 shrink-0"
                  />
                  {/* Article content */}
                  <button
                    onClick={() => onSelectArticle(article.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {article.title}
                      </h3>
                      <Badge
                        variant={getStatusVariant(article.status)}
                        className="shrink-0 text-xs"
                      >
                        {getStatusLabel(article.status)}
                      </Badge>
                    </div>
                    {article.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                      {article.prompt && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {article.prompt.name}
                          </Badge>
                        </>
                      )}
                    </div>
                  </button>
                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(article.id);
                    }}
                    className="shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t p-4 text-sm text-muted-foreground">
        {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
        {searchQuery && ` (filtered)`}
      </div>

      {/* Individual Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this article. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedArticles.size} Article{selectedArticles.size > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedArticles.size} article{selectedArticles.size > 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
