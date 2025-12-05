"use client";

import { useEffect, useState, useMemo, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "archived":
        return "secondary";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Published";
      case "archived":
        return "Archived";
      default:
        return "Draft";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
            filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onSelectArticle(article.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg mb-2 transition-colors",
                  "hover:bg-accent",
                  selectedArticleId === article.id
                    ? "bg-accent border-2 border-primary"
                    : "border border-transparent"
                )}
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
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with count */}
      <div className="border-t p-4 text-sm text-muted-foreground">
        {filteredArticles.length} {filteredArticles.length === 1 ? "article" : "articles"}
        {searchQuery && ` (filtered)`}
      </div>
    </div>
  );
});
