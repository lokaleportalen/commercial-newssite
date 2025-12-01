"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  publishedDate: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Debounced search function
  const searchArticles = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 4) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/articles?search=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.articles.slice(0, 5)); // Only show first 5
        setTotalResults(data.articles.length);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchArticles(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchArticles]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setTotalResults(0);
    }
  }, [open]);

  const handleResultClick = (slug: string) => {
    onOpenChange(false);
    router.push(`/nyheder/${slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Søg i artikler</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Søg efter artikler..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && query.length > 0 && query.length < 4 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Indtast mindst 4 tegn for at søge
              </p>
            )}

            {!loading && query.length >= 4 && results.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Ingen resultater fundet
              </p>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="space-y-2">
                  {results.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleResultClick(article.slug)}
                      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        {article.image ? (
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Title and Date */}
                      <div className="flex-1 min-w-0">
                        <h3 className="line-clamp-2 font-medium">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(article.publishedDate)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Show More Link */}
                {totalResults > 5 && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => onOpenChange(false)}
                    >
                      <Link href={`/resultat?q=${encodeURIComponent(query)}`}>
                        Se flere resultater ({totalResults})
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
